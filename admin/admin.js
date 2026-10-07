(function(){
  "use strict";
  const cfg=window.OGP_BACKEND_CONFIG||{};
  const ready=Boolean(cfg.supabaseUrl&&cfg.supabasePublishableKey&&window.supabase);
  const authView=document.getElementById("auth-view"),dash=document.getElementById("dashboard-view");
  const form=document.getElementById("login-form"),msg=document.getElementById("login-message");
  const identity=document.getElementById("identity"),status=document.getElementById("system-status");
  let client=null,profile=null,currentUser=null;

  function setStatus(text,tone){status.textContent=text;status.dataset.tone=tone||"neutral";}
  function number(v){return new Intl.NumberFormat("es-MX").format(Number(v||0));}
  function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
  function showAuth(){authView.classList.remove("hidden");dash.classList.add("hidden");}
  function showDash(){authView.classList.add("hidden");dash.classList.remove("hidden");identity.textContent=currentUser?.email||"";}

  async function loadProfile(userId){
    const r=await client.from("app_profiles").select("user_id,email,display_name,role,created_at,updated_at").eq("user_id",userId).maybeSingle();
    if(r.error)throw r.error; profile=r.data; return profile;
  }
  function requireAdmin(){if(!profile||profile.role!=="admin")throw new Error("not_admin");}

  async function claimFirstAdmin(user){
    if(!user?.email || user.email.toLowerCase()!=="the.willfreeman@gmail.com") return null;
    try{
      const r=await client.functions.invoke("ogp-admin-claim");
      if(!r.error && r.data?.promoted){
        await loadProfile(user.id);
        return r.data;
      }
      return null;
    }catch(_){return null;}
  }

  function bindTabs(){
    document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{
      document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
      document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
      b.classList.add("active"); document.getElementById("panel-"+b.dataset.panel).classList.add("active");
    }));
  }

  async function loadOverview(){
    requireAdmin();
    const from=new Date(Date.now()-30*86400000).toISOString(),to=new Date().toISOString();
    const [s,t]=await Promise.all([
      client.rpc("admin_analytics_summary",{from_ts:from,to_ts:to}),
      client.rpc("admin_analytics_timeseries",{from_ts:from,to_ts:to})
    ]);
    if(s.error)throw s.error; if(t.error)throw t.error;
    const row=s.data?.[0]||{};
    const cards=[["page_views","Vistas"],["unique_visitors","Visitantes únicos"],["sessions","Sesiones"],["engagements","Engagement"],["cta_clicks","Clicks CTA"],["conversions","Conversiones"]];
    document.getElementById("metric-grid").innerHTML=cards.map(([k,l])=>'<article class="metric"><div class="label">'+l+'</div><div class="value">'+number(row[k])+'</div><div class="label">últimos 30 días</div></article>').join("");
    drawTrend(t.data||[]);
    document.getElementById("site-traffic-summary").innerHTML=
      '<div class="facts"><div><dt>Vistas</dt><dd>'+number(row.page_views)+'</dd></div><div><dt>Visitantes</dt><dd>'+number(row.unique_visitors)+'</dd></div><div><dt>Sesiones</dt><dd>'+number(row.sessions)+'</dd></div><div><dt>Conversiones</dt><dd>'+number(row.conversions)+'</dd></div></div>';
  }

  function drawTrend(rows){
    const c=document.getElementById("timeseries"),wrap=c.parentElement,w=Math.max(wrap.clientWidth||700,620),h=300,dpr=window.devicePixelRatio||1;
    c.width=w*dpr;c.height=h*dpr;c.style.width=w+"px";c.style.height=h+"px";
    const x=c.getContext("2d");x.scale(dpr,dpr);x.clearRect(0,0,w,h);
    if(!rows.length){x.fillStyle="#9db0bd";x.font="14px system-ui";x.fillText("Todavía no hay datos de telemetría.",28,145);return;}
    const pad=28,innerW=w-pad*2,innerH=h-pad*2,max=Math.max(...rows.map(r=>Number(r.page_views||0)),1);
    x.strokeStyle="rgba(255,255,255,.1)";x.lineWidth=1;for(let i=0;i<=4;i++){const y=pad+innerH*i/4;x.beginPath();x.moveTo(pad,y);x.lineTo(w-pad,y);x.stroke();}
    x.strokeStyle="#b6e34d";x.lineWidth=3;x.beginPath();
    rows.forEach((r,i)=>{const px=pad+innerW*i/Math.max(rows.length-1,1),py=pad+innerH-(Number(r.page_views||0)/max)*innerH;i?x.lineTo(px,py):x.moveTo(px,py);});
    x.stroke();
  }

  async function loadEvents(){
    requireAdmin();
    const r=await client.from("analytics_events").select("occurred_at,event_name,path,device_class,visitor_id").order("occurred_at",{ascending:false}).limit(80);
    if(r.error)throw r.error;
    document.getElementById("events-body").innerHTML=(r.data||[]).map(e=>'<tr><td>'+esc(new Date(e.occurred_at).toLocaleString("es-MX"))+'</td><td>'+esc(e.event_name)+'</td><td>'+esc(e.path)+'</td><td>'+esc(e.device_class||"—")+'</td><td><code>'+esc((e.visitor_id||"").slice(0,12))+'</code></td></tr>').join("");
  }

  async function loadTraffic(){
    requireAdmin();
    const r=await client.from("github_traffic_daily").select("traffic_date,views_total,views_unique,clones_total,clones_unique").order("traffic_date",{ascending:false}).limit(30);
    if(r.error)throw r.error; const rows=r.data||[];
    document.getElementById("github-traffic-status").textContent=rows.length?("Snapshots: "+rows.length):"Sin snapshots";
    document.getElementById("github-traffic-table").innerHTML=rows.length?'<div class="table-scroll"><table><thead><tr><th>Fecha</th><th>Vistas</th><th>Únicos</th><th>Clones</th><th>Únicos</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+esc(r.traffic_date)+'</td><td>'+number(r.views_total)+'</td><td>'+number(r.views_unique)+'</td><td>'+number(r.clones_total)+'</td><td>'+number(r.clones_unique)+'</td></tr>').join("")+'</tbody></table></div>':'<p class="muted">El collector diario aún no está desplegado.</p>';
  }

  async function loadUsers(){
    requireAdmin();
    const r=await client.from("app_profiles").select("user_id,email,display_name,role,created_at").order("created_at",{ascending:true});
    if(r.error)throw r.error;
    document.getElementById("users-body").innerHTML=(r.data||[]).map(u=>{
      const roles=["viewer","editor","admin"].map(role=>'<option value="'+role+'"'+(u.role===role?" selected":"")+'>'+role+'</option>').join("");
      const canChange=u.user_id!==currentUser?.id;
      return '<tr><td>'+esc(u.email||"—")+'</td><td>'+esc(u.display_name||"—")+'</td><td><select class="role-select" data-user-id="'+esc(u.user_id)+'"'+(canChange?"":" disabled")+">"+roles+'</select></td><td>'+esc(new Date(u.created_at).toLocaleDateString("es-MX"))+'</td><td><button class="ghost save-role" data-user-id="'+esc(u.user_id)+'"'+(canChange?"":" disabled")+">Guardar</button></td></tr>";
    }).join("");
  }

  async function updateRole(userId, role){
    requireAdmin();
    if(userId===currentUser?.id){throw new Error("No puedes cambiar tu propio rol desde esta sesión.");}
    if(role==="admin"){
      const confirmed=true;
      if(!confirmed) return;
    }
    const previous=await client.from("app_profiles").select("role,email").eq("user_id",userId).maybeSingle();
    if(previous.error)throw previous.error;
    if(previous.data?.role==="admin" && role!=="admin"){
      const admins=await client.from("app_profiles").select("user_id").eq("role","admin");
      if(admins.error)throw admins.error;
      if((admins.data||[]).length<=1)throw new Error("Debe permanecer al menos un administrador.");
    }
    const r=await client.from("app_profiles").update({role,updated_at:new Date().toISOString()}).eq("user_id",userId);
    if(r.error)throw r.error;
    await client.from("admin_audit_log").insert({actor_user_id:currentUser.id,action:"role_change",target_type:"app_profile",target_id:userId,details:{from:previous.data?.role||null,to:role}});
    await loadUsers();
    setStatus("Rol actualizado.","ok");
  }

  async function loadAccess(){
    requireAdmin(); const u=currentUser;
    document.getElementById("access-facts").innerHTML=[
      ["Usuario",esc(u?.email||"—")],["User ID","<code>"+esc(u?.id||"—")+"</code>"],["Rol",esc(profile.role)],
      ["Proveedor",esc(u?.app_metadata?.provider||"email")],["Último acceso",esc(u?.last_sign_in_at?new Date(u.last_sign_in_at).toLocaleString("es-MX"):"—")]
    ].map(([a,b])=>"<div><dt>"+a+"</dt><dd>"+b+"</dd></div>").join("");
    document.getElementById("supabase-origin").textContent=cfg.supabaseUrl;
  }

  async function refreshAll(){
    try{await loadOverview();await loadEvents();await loadTraffic();await loadUsers();await loadAccess();setStatus("Backend conectado · Auth + Postgres + RLS operativos.","ok");}
    catch(e){console.error(e);setStatus("Error de backend: "+(e.message||e),"error");}
  }

  async function authenticate(user){
    currentUser=user; await loadProfile(user.id);
    if(profile?.role!=="admin"){
      await claimFirstAdmin(user);
      await loadProfile(user.id);
    }
    if(profile?.role!=="admin"){showAuth();msg.textContent="La cuenta está autenticada, pero no tiene rol admin.";return;}
    showDash(); bindTabs(); await refreshAll();
  }

  async function boot(){
    if(!ready){setStatus("Backend no configurado.","error");msg.textContent="Configura assets/js/backend-config.js con la URL y publishable key públicas de Supabase.";return;}
    client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    client.auth.onAuthStateChange(async(_event,session)=>{if(!session?.user){showAuth();return;}try{await authenticate(session.user);}catch(e){console.error(e);showAuth();msg.textContent="No se pudo verificar el acceso administrativo.";}});
    const r=await client.auth.getSession(); if(r.data.session?.user){try{await authenticate(r.data.session.user);}catch(e){console.error(e);showAuth();}}
  }

  form.addEventListener("submit",async e=>{e.preventDefault();msg.textContent="";if(!ready){msg.textContent="Backend no configurado.";return;}try{
    if(!client)await boot();
    const r=await client.auth.signInWithPassword({email:document.getElementById("email").value.trim(),password:document.getElementById("password").value});
    if(r.error)msg.textContent="No se pudo iniciar sesión. Verifica las credenciales.";
  }catch(err){console.error(err);msg.textContent="No se pudo iniciar sesión.";}});

  document.getElementById("signout").addEventListener("click",async()=>{if(client)await client.auth.signOut();});
  document.getElementById("refresh-overview").addEventListener("click",()=>loadOverview().catch(e=>setStatus(e.message,"error")));
  document.getElementById("refresh-traffic").addEventListener("click",()=>loadTraffic().catch(e=>setStatus(e.message,"error")));
  document.getElementById("refresh-events").addEventListener("click",()=>loadEvents().catch(e=>setStatus(e.message,"error")));
  document.getElementById("refresh-users").addEventListener("click",()=>loadUsers().catch(e=>setStatus(e.message,"error")));
  document.getElementById("users-body").addEventListener("click",e=>{
    const button=e.target.closest(".save-role"); if(!button) return;
    const id=button.dataset.userId, select=document.querySelector('.role-select[data-user-id="'+id+'"]');
    updateRole(id,select.value).catch(err=>setStatus(err.message,"error"));
  });
  boot();
})();
