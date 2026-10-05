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
 assert tm["status"]=="editorial-word-timing-preliminary" and tm["forcedAlignmentPending"] is True
 assert len(p3["segments"])==20 and len(tm["segments"])==20
 total=0; visuals=set()
 for s in p3["segments"]:
  assert len(toks(s["text"]))==len(s["words"]),s["id"]
  assert (ROOT/s["audio"]).exists(),s["audio"]
  visuals.add(s["visualKey"])
  last=-1.0
  for i,w in enumerate(s["words"]):
   assert w["index"]==i
   a,b=float(w["start"]),float(w["end"])
   assert a>=0 and b>a and a>=last
   last=b
  total+=len(s["words"])
 assert len(visuals)==10 and total==tm["wordCount"]
 assert "No existe sincronización proporcional" not in js
 assert "forced alignment" not in js.lower() or "pendiente" in js.lower()
 print(json.dumps({"status":"passed","quality":"normal-preliminary","phases":5,"segments":20,"words":total,"visualMasterCompositions":10,"forcedAlignmentPending":True},ensure_ascii=False))
if __name__=="__main__": main()
