(function(root){
  "use strict";
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function quality(value,rule){
    if(!Number.isFinite(value)) return 0;
    if(rule.direction==="higher"){
      return clamp((value-rule.worst)/(rule.ideal-rule.worst),0,1);
    }
    if(rule.direction==="lower"){
      if(value<=rule.ideal) return 1;
      var span=rule.worst-rule.ideal;
      var hard=rule.hardLimit||rule.worst;
      if(value<=rule.worst){
        var ratio=clamp((value-rule.ideal)/span,0,1);
        var floor=rule.floorQuality==null?0:rule.floorQuality;
        var power=rule.curvePower||1;
        return 1-(1-floor)*Math.pow(ratio,power);
      }
      if(hard<=rule.worst) return 0;
      return clamp((rule.floorQuality==null?0:rule.floorQuality)*(hard-value)/(hard-rule.worst),0,1);
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
    var logSum=0;
    var rows=dims.map(function(d){
      var value=Number(metrics[d.key]);
      var q=quality(value,d);
      var gate=gatePass(value,d.gate,eps);
      if(q===null||q<=0) logSum=-Infinity;
      else if(Number.isFinite(logSum)) logSum+=d.weight*Math.log(q);
      return {code:d.code,name:d.name,value:value,quality:q,weight:d.weight,gatePass:gate,unit:d.unit};
    });
    var score=(logSum===-Infinity)?0:100*Math.exp(logSum/totalWeight);
    var deficit=100-score;
    var gatesPassed=rows.filter(function(r){return r.gatePass;}).length;
    var allGates=gatesPassed===rows.length;
    var perfect=allGates&&deficit<=eps;
    var weakest=rows.slice().sort(function(a,b){return a.quality-b.quality;})[0]||null;
    return {
      score:score,
      deficit:deficit,
      status:perfect?"PERFECTO":(allGates?"CERTIFICADO":"NO CERTIFICADO"),
      gatesPassed:gatesPassed,
      gatesTotal:rows.length,
      rows:rows,
      weakest:weakest
    };
  }
  root.SyncIGP={calculate:calculate,quality:quality,gatePass:gatePass};
})(window);