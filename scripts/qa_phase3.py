#!/usr/bin/env python3
import json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
P3=ROOT/"assets/data/relato-obp-phase3.json"; TM=ROOT/"assets/data/story-word-timing.json"; JS=ROOT/"assets/js/story-v3.js"
def toks(x): return re.findall(r"\S+",x or "")
def main():
 p3=json.loads(P3.read_text(encoding="utf-8")); tm=json.loads(TM.read_text(encoding="utf-8")); js=JS.read_text(encoding="utf-8")
 assert p3["model"]["phases"]==5 and p3["model"]["segments"]==20 and p3["model"]["oneIdeaPerSegment"] is True
 assert p3["model"]["visualMasterCompositions"]==10
 assert tm["status"]=="forced-alignment-certified" and tm.get("proportionalTiming") is False and tm.get("interpolation") is False
 assert p3["status"]=="timing-and-narrative-model-certified"
 assert p3["model"]["wordClock"]=="audio-derived forced alignment"
 assert len(p3["segments"])==20 and len(tm["segments"])==20
 assert "certification" in tm and tm["certification"]["aligner"]=="WhisperX CTC"
 total=0; visuals=set()
 for s in p3["segments"]:
  assert len(toks(s["text"]))==len(s["words"]),s["id"]
  assert (ROOT/s["audio"]).exists(),s["audio"]
  visuals.add(s["visualKey"])
  tmseg=next(x for x in tm["segments"] if str(x["id"])==str(s["id"]))
  assert len(tmseg["words"])==len(s["words"])
  last=-1.0
  for i,w in enumerate(s["words"]):
   assert w["index"]==i
   tw=tmseg["words"][i]
   assert str(tw["word"]).strip()==str(w["word"]).strip()
   assert abs(float(tw["start"])-float(w["start"]))<0.001
   assert abs(float(tw["end"])-float(w["end"]))<0.001
   a,b=float(w["start"]),float(w["end"])
   assert a>=0 and b>a and a>=last
   last=b
  total+=len(s["words"])
 assert len(visuals)==10 and total==tm["wordCount"]
 assert "proportionalTiming" in tm and tm["proportionalTiming"] is False
 assert "interpolation" in tm and tm["interpolation"] is False
 print(json.dumps({"status":"passed","quality":"forced-alignment-certified","phases":5,"segments":20,"words":total,"visualMasterCompositions":10,"forcedAlignmentPending":False},ensure_ascii=False))
if __name__=="__main__": main()
