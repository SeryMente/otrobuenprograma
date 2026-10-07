(function(root){
  "use strict";
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function quality(value,rule){
    if(!Number.isFinite(value)) return 0;
    if(rule.direction==="higher"){
      return clamp((value-rule.worst)/(rule.ideal-rule.worst),0,1);
    }
    if(rule.direction==="lower"){
      return clamp((rule.worst-value)/(rule.worst-rule.ideal),0,1);
    }
    if(rule.direction==="zero"){
      return clamp(1-(Math.abs(value-rule.ideal)/(rule.softLimit || 1)),0,1);
    }
    return null;
  }
  function gatePass(value,gate,epsilon){
    if(!gate) return true;
    if(!Number.isFinite(value)) return false;
    if(gate.op==="eq") return Math.abs(value-gate.value)<=epsilon;
    if(gate.op==="lte") return value<=gate.value+epsilon;
    if(gate.op==="gte") return value>=gate.value-epsilon;
    if(gate.op==="lt") return value<gate.value-epsilon;
    if(gate.op==="gt") return value>gate.value+epsilon;
    return false;
  }
  function calculate(metrics,config){
    var eps=(config.index&&config.index.perfectEpsilon)||1e-6;
    var dims=config.dimensions||[];
    var totalWeight=dims.reduce(function(s,d){return s+d.weight;},0);
    var logSum=0, perfect=true;
    var rows=dims.map(function(d){
      var value=Number(metrics[d.key]);
      var q=quality(value,d);
      var gate=gatePass(value,d.gate,eps);
      if(!gate) perfect=false;
      if(q===null||q<=0){ logSum=-Infinity; }
      else if(Number.isFinite(logSum)){ logSum+=d.weight*Math.log(q); }
      return {code:d.code,name:d.name,value:value,quality:q,weight:d.weight,gatePass:gate,unit:d.unit};
    });
    var score=(logSum===-Infinity)?0:100*Math.exp(logSum/totalWeight);
    var deficit=100-score;
    var weakest=rows.slice().sort(function(a,b){return a.quality-b.quality;})[0]||null;
    var perfectIndex=perfect && deficit<=eps;
    return {
      score:score,
      deficit:deficit,
      status:perfectIndex?"PERFECTO":(perfect?"CERTIFICADO":"NO CERTIFICADO"),
      gatesPassed:rows.filter(function(r){return r.gatePass;}).length,
      gatesTotal:rows.length,
      rows:rows,
      weakest:weakest
    };
  }
  root.SyncIGP={calculate:calculate,quality:quality,gatePass:gatePass};
})(window);