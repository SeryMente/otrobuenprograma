/* ===================================================================
   Instrumento de comunicacion · Proyecto Vital
   assets/js/backend.js · F4
   Adaptador de backend: Supabase.
   - Si no hay URL/clave configuradas, no rompe el sitio y deja el modo local.
   - Con backend configurado, crea una sesion anonima persistente.
   - Expone solo las operaciones necesarias para Glosa y Pulso:
     glosas compartidas, buzon persistente, chat Realtime.
   =================================================================== */
(function(){
  'use strict';

  var CONF=window.INSTRUMENT_CONFIG||{};
  var B=CONF.backend||{};
  var AUTH=CONF.auth||{};
  var status={provider:B.provider||null,configured:false,ready:false,user:null,error:null};
  var client=null;
  var channel=null;
  var resolveReady;
  var ready=new Promise(function(resolve){resolveReady=resolve;});

  function publish(){
    window.INSTRUMENT_BACKEND_STATUS=Object.assign({},status);
    window.dispatchEvent(new CustomEvent('instrument-backend-status',{detail:Object.assign({},status)}));
  }

  function fail(message,error){
    status.ready=false;
    status.error=message;
    publish();
    if(error) console.warn('[backend]',message);
    resolveReady(false);
  }

  function cfg(){
    var url=String(B.supabaseUrl||'').trim();
    var key=String(B.supabasePublishableKey||B.supabaseAnonKey||'').trim();
    return {url:url,key:key};
  }

  async function connect(){
    var c=cfg();
    if(B.provider!=='supabase' || !c.url || !c.key){
      status.configured=false;
      publish();
      resolveReady(false);
      return false;
    }
    status.configured=true;
    publish();

    if(!window.supabase || typeof window.supabase.createClient!=='function'){
      fail('SDK de Supabase no disponible');
      return false;
    }

    try{
      client=window.supabase.createClient(c.url,c.key,{
        auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}
      });

      var sessionResult=await client.auth.getSession();
      var session=sessionResult&&sessionResult.data&&sessionResult.data.session;
      if(!session){
        if(AUTH.anonymous===false){
          fail('No hay sesion de backend y el acceso anonimo esta desactivado');
          return false;
        }
        var signed=await client.auth.signInAnonymously();
        if(signed.error) throw signed.error;
        session=signed.data&&signed.data.session;
      }

      var user=session&&session.user;
      if(!user) throw new Error('Supabase no devolvio usuario');

      status.user=user;
      status.ready=true;
      status.error=null;
      publish();
      resolveReady(true);
      return true;
    }catch(error){
      fail('No se pudo iniciar la sesion de backend',error);
      return false;
    }
  }

  async function readyClient(){
    var ok=await ready;
    if(!ok || !client || !status.user) throw new Error('backend_unavailable');
    return client;
  }

  async function listChat(){
    var c=await readyClient();
    var uid=status.user.id;
    var r=await c.from('pulso_chat_messages')
      .select('id,visitor_id,sender_role,body,mode,created_at,client_id')
      .eq('visitor_id',uid)
      .order('created_at',{ascending:true})
      .limit(100);
    if(r.error) throw r.error;
    return r.data||[];
  }

  async function sendChat(body,mode,clientId){
    var c=await readyClient();
    var text=String(body||'').trim().slice(0,1200);
    if(!text) throw new Error('empty_message');
    var r=await c.from('pulso_chat_messages').insert({
      visitor_id:status.user.id,
      sender_role:'visitor',
      body:text,
      mode:(mode==='live'?'live':'async'),
      client_id:String(clientId||('c-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)))
    }).select('id,visitor_id,sender_role,body,mode,created_at,client_id').single();
    if(r.error) throw r.error;
    return r.data;
  }

  function subscribeChat(onMessage,onStatus){
    if(!client || !status.user) return function(){};
    if(channel){ try{client.removeChannel(channel);}catch(e){} channel=null; }
    var uid=status.user.id;
    channel=client.channel('pulso-chat-'+uid)
      .on('postgres_changes',{
        event:'INSERT',
        schema:'public',
        table:'pulso_chat_messages',
        filter:'visitor_id=eq.'+uid
      },function(payload){
        if(onMessage) onMessage(payload.new);
      })
      .subscribe(function(state){
        if(onStatus) onStatus(state);
      });
    return function(){
      if(channel){ try{client.removeChannel(channel);}catch(e){} channel=null; }
    };
  }

  async function listGlosas(){
    var c=await readyClient();
    var r=await c.from('glosas_compartidas')
      .select('id,anchor,text,author,author_id,created_at,quote,client_id')
      .eq('approved',true)
      .order('created_at',{ascending:true})
      .limit(500);
    if(r.error) throw r.error;
    return r.data||[];
  }

  async function addGlosa(rec){
    var c=await readyClient();
    var G=CONF.glosa||{};
    var r=await c.from('glosas_compartidas').insert({
      client_id:String(rec.id),
      anchor:String(rec.anchor||'doc#general').slice(0,180),
      text:String(rec.text||'').trim().slice(0,1200),
      author:String(rec.author||'Anonimo').trim().slice(0,40)||'Anonimo',
      author_id:status.user.id,
      quote:String(rec.quote||'').trim().slice(0,120),
      approved:G.requireApproval===true ? false : true
    }).select('id,anchor,text,author,author_id,created_at,quote,client_id').single();
    if(r.error) throw r.error;
    return r.data;
  }

  window.INSTRUMENT_BACKEND={
    ready:ready,
    isReady:function(){return status.ready;},
    isConfigured:function(){return status.configured;},
    getStatus:function(){return Object.assign({},status);},
    getUser:function(){return status.user;},
    getClient:function(){return client;},
    listChat:listChat,
    sendChat:sendChat,
    subscribeChat:subscribeChat,
    listGlosas:listGlosas,
    addGlosa:addGlosa
  };
  publish();
  connect();
})();