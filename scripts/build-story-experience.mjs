import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const canonPath=path.join(ROOT,'assets/data/story-experience-canon.json');
const sourcePath=path.join(ROOT,'assets/data/relato-ogp-phase3.json');
const outPath=path.join(ROOT,'assets/data/relato-ogp-experience.json');

const canon=JSON.parse(fs.readFileSync(canonPath,'utf8'));
const source=JSON.parse(fs.readFileSync(sourcePath,'utf8'));

if(canon.segmentation?.recommendedCount!==49) throw new Error('Canonical recommendedCount must be 49.');
if(canon.segmentation?.proposedSegments?.length!==49) throw new Error('Canonical proposedSegments must contain 49 entries.');
if(source.segments?.length!==20) throw new Error('Immutable source baseline must contain 20 segments.');
if(source.sourceAudio?.duration!==1391.304) throw new Error('Unexpected source audio duration.');
if(source.sourceAudio?.path!=='assets/audio/relato-ogp-v015.mp3') throw new Error('Unexpected master audio path.');

const sourceById=new Map(source.segments.map(s=>[String(s.id),s]));
const coverage=[];
const tmp=[];

for(const e of canon.segmentation.proposedSegments){
  const words=[];
  for(const r of e.sources){
    const s=sourceById.get(String(r.sourceSegment));
    if(!s) throw new Error(`Missing source segment ${r.sourceSegment} for ${e.id}`);
    if(!Number.isInteger(r.startWord)||!Number.isInteger(r.endWord)||r.startWord<0||r.endWord>=s.words.length||r.startWord>r.endWord) throw new Error(`Invalid range for ${e.id}: ${r.sourceSegment}:${r.startWord}-${r.endWord}`);
    for(let i=r.startWord;i<=r.endWord;i++){
      coverage.push(`${r.sourceSegment}:${i}`);
      words.push({...s.words[i],sourceId:String(s.id),sourceSegment:String(s.id),sourceIndex:i});
    }
  }
  if(!words.length) throw new Error(`Empty segment ${e.id}`);
  tmp.push({...e,sourceWords:words,first:words[0],last:words.at(-1)});
}

const uniq=new Set(coverage);
if(coverage.length!==2206||uniq.size!==2206) throw new Error(`Coverage must be exactly 2206 unique words; got ${coverage.length}/${uniq.size}`);

for(let i=0;i<tmp.length;i++){
  if(i===0){tmp[i].masterStart=0;}
  else{
    const prev=tmp[i-1], cur=tmp[i];
    const ps=sourceById.get(prev.last.sourceId), cs=sourceById.get(cur.first.sourceId);
    const prevGlobal=Number(prev.last.end)+Number(ps.masterStart||0);
    const curGlobal=Number(cur.first.start)+Number(cs.masterStart||0);
    if(!(curGlobal>prevGlobal)) throw new Error(`Non-increasing boundary before ${cur.id}`);
    tmp[i].masterStart=(prevGlobal+curGlobal)/2;
  }
}

const duration=Number(source.sourceAudio.duration);
for(let i=0;i<tmp.length;i++) tmp[i].masterEnd=i<tmp.length-1?tmp[i+1].masterStart:duration;

const norm=v=>String(v??'').toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[«»“”¿¡]/g,'').replace(/[.,;:!?()]/g,'');
const findPhrase=(words,phrase)=>{
  const tokens=phrase.trim().split(/\s+/).map(norm).filter(Boolean);
  for(let i=0;i<=words.length-tokens.length;i++){
    let ok=true;
    for(let j=0;j<tokens.length;j++){if(norm(words[i+j].word)!==tokens[j]){ok=false;break;}}
    if(ok)return [i,i+tokens.length-1];
  }
  return null;
};

const richById=new Map((canon.richTranscript.segments49||[]).map(x=>[String(x.segment),x]));
const segments=tmp.map(e=>{
  const s=sourceById.get(String(e.sources[0].sourceSegment));
  const rich=richById.get(String(e.id));
  if(!rich) throw new Error(`Missing rich transcript entry ${e.id}`);
  const localWords=e.sourceWords.map(w=>{
    const src=sourceById.get(String(w.sourceId));
    return {index:w.sourceIndex,sourceIndex:w.sourceIndex,sourceSegment:String(w.sourceSegment),word:w.word,start:Number((Number(w.start)+Number(src.masterStart||0)).toFixed(3)),end:Number((Number(w.end)+Number(src.masterStart||0)).toFixed(3)),score:w.score};
  });
  const strong=findPhrase(localWords,rich.strong), underline=findPhrase(localWords,rich.underline);
  if(!strong||!underline) throw new Error(`Rich phrase mismatch in ${e.id}`);
  return {
    id:e.id,phase:e.phase,title:e.title,idea:e.idea,role:e.role,visualKey:e.visualKey,
    text:localWords.map(w=>w.word).join(' ').replace(/\s+([,.;:!?])/g,'$1'),
    wordCount:localWords.length,
    masterStart:Number(e.masterStart.toFixed(3)),masterEnd:Number(e.masterEnd.toFixed(3)),duration:Number((e.masterEnd-e.masterStart).toFixed(3)),
    sources:e.sources,rich:{strong:rich.strong,underline:rich.underline,strongWordRange:strong,underlineWordRange:underline},words:localWords
  };
});

for(let i=0;i<segments.length-1;i++){
  if(Math.abs(segments[i].masterEnd-segments[i+1].masterStart)>0.0005) throw new Error(`Boundary mismatch at ${segments[i].id}`);
}
if(Math.abs(segments.at(-1).masterEnd-duration)>0.0005) throw new Error('Final boundary mismatch.');
if(segments.reduce((n,s)=>n+s.wordCount,0)!==2206) throw new Error('Executable word count mismatch.');

const phaseSegmentCounts=segments.reduce((a,s)=>{a[s.phase]=(a[s.phase]||0)+1;return a;},{});
const durs=segments.map(s=>s.duration),sorted=[...durs].sort((a,b)=>a-b);
const mean=durs.reduce((a,b)=>a+b,0)/durs.length, median=sorted[Math.floor(sorted.length/2)], p90=sorted[Math.ceil(sorted.length*.9)-1];

const out={
  version:'1.0-experience-canon-49',
  status:'timing-and-editorial-model-certified',
  displayName:'Otro Gran Programa',
  spokenWorkingName:'Otro Gran Programa',
  sourceAudio:{path:source.sourceAudio.path,sha256:source.sourceAudio.sha256,duration},
  model:{
    phases:5,segments:49,phaseSegmentCounts,oneIdeaPerSegment:true,primaryContent:'transcript',
    visualMasterCompositions:9,timingArtifact:'assets/data/relato-ogp-phase3.json',
    canonicalObject:'assets/data/story-experience-canon.json',
    wordClock:'audio-derived forced alignment with global master coordinates',
    audioArchitecture:'single-master-audio',
    segmentationArchitecture:'editorial-windows-over-master-clock',
    boundaryRule:'midpoint between previous spoken-word end and next spoken-word start'
  },
  metrics:{meanSegmentSeconds:Number(mean.toFixed(3)),medianSegmentSeconds:Number(median.toFixed(3)),p90SegmentSeconds:Number(p90.toFixed(3)),maxSegmentSeconds:Number(Math.max(...durs).toFixed(3)),segmentsUnder15Seconds:durs.filter(x=>x<15).length,segmentsUnder20Seconds:durs.filter(x=>x<20).length,segmentsOver50Seconds:durs.filter(x=>x>50).length,segmentsOver60Seconds:durs.filter(x=>x>60).length},
  segments
};

if(process.argv.includes('--check')){
  if(!fs.existsSync(outPath)) throw new Error('Executable dataset missing.');
  const current=JSON.parse(fs.readFileSync(outPath,'utf8'));
  if(JSON.stringify(current)!==JSON.stringify(out)) throw new Error('Executable dataset is stale; rebuild required.');
  console.log('STORY_EXPERIENCE_CHECK_OK',JSON.stringify(out.metrics));
}else{
  fs.writeFileSync(outPath,JSON.stringify(out,null,2)+'\n');
  console.log('STORY_EXPERIENCE_REBUILT',JSON.stringify({segments:49,phaseSegmentCounts,metrics:out.metrics}));
}
