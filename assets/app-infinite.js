// Kids Quiz v1.4.0 — Infinite (no Sheets) + Grades + Subjects
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const sample=(arr,n)=>arr.slice().sort(()=>Math.random()-0.5).slice(0,n);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const themeMap={sky:'#f8fbff',forest:'#f6fff8',candy:'#fff7fb',space:'#f7f9ff',dino:'#fcfff6'};
function tagFor(cat){const el=document.createElement('span');el.className='tag';el.textContent=cat;if(cat.includes('국어'))el.classList.add('tag-kr');if(cat.includes('수학'))el.classList.add('tag-math');if(cat.includes('영어'))el.classList.add('tag-en');if(cat.includes('상식')||cat.includes('과학')||cat.includes('사회'))el.classList.add('tag-gk');return el;}

// Stickers
const STICKERS=[
  {id:'leaf',name:'Leaf',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f332.svg'},
  {id:'star',name:'Star',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f31f.svg'},
  {id:'book',name:'Book',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d6.svg'},
  {id:'pencil',name:'Pencil',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270f.svg'},
];
const STK_KEY='kidquiz_stickers_v1';const getStickers=()=>{try{return JSON.parse(localStorage.getItem(STK_KEY)||'[]')}catch{return[]}};const saveStickers=a=>localStorage.setItem(STK_KEY,JSON.stringify(a));
function renderStickers(){const grid=$('#stickerGrid');const owned=new Set(getStickers());grid.innerHTML='';$('#stickerTotal').textContent=STICKERS.length;$('#stickerCount').textContent=owned.size;STICKERS.forEach(s=>{const img=new Image();img.alt=s.name;img.title=owned.has(s.id)?s.name:`${s.name} (locked)`;img.src=s.url;if(!owned.has(s.id))img.classList.add('sticker-locked');grid.appendChild(img);});}
function awardSticker(){const owned=new Set(getStickers());if(owned.size===STICKERS.length)return;if(Math.random()<0.35){const c=STICKERS.filter(x=>!owned.has(x.id));if(c.length){const s=c[(Math.random()*c.length)|0];saveStickers([...owned,s.id]);renderStickers();const wrap=document.createElement('div');wrap.className='sticker-toast';wrap.innerHTML=`<div class="sticker-badge"><img alt="sticker" src="${s.url}"/><span>Sticker! ${s.name}</span></div>`;document.body.appendChild(wrap);setTimeout(()=>wrap.remove(),1400);}}}

// State
const WRONGS_KEY='kidquiz_wrongs_v1';const loadWrongs=()=>{try{return JSON.parse(localStorage.getItem(WRONGS_KEY)||'[]')}catch{return[]}};const saveWrongs=a=>localStorage.setItem(WRONGS_KEY,JSON.stringify(a));
const state={ deck:[], idx:0, right:0, streak:0, revealed:false, reviewMode:false, sessionWrongs:[], timer:0, timerId:null };
const statsKey='kidquiz_stats_v1'; const stats=(()=>{let s={today:0,bestStreak:0,theme:localStorage.getItem('theme')||'sky'};try{s=Object.assign(s,JSON.parse(localStorage.getItem(statsKey)||'{}'));}catch{}function persist(){localStorage.setItem(statsKey,JSON.stringify(s));localStorage.setItem('theme',s.theme);}return{get:()=>s,incToday(){s.today++;persist();},setBest(n){if(n>s.bestStreak){s.bestStreak=n;persist();}},setTheme(t){s.theme=t;persist();}}})();

// Grade → difficulty scale (1~6)
const gradeScale={ '초1':1,'초2':1,'초3':2,'초4':2,'초5':3,'초6':3,'중1':4,'중2':4,'중3':5,'고1':5,'고2':6,'고3':6 };

// Unsplash (no key) by subject/grade
function unsplashFor(subject, grade){
  const map={ '국어':'korean,letters,illustration', '수학':'math,geometry,worksheet', '영어':'english,alphabet,flashcards', '과학':'science,experiment,kids', '사회/역사':'history,globe,map', '상식':'kids,education,illustration' };
  const kw = `${map[subject]||'education'},${grade}`;
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(kw)}`;
}

// OpenTDB for General Knowledge only
async function loadOpenTDB(n){
  try{
    const url=`https://opentdb.com/api.php?amount=${n}&type=multiple&encode=url3986`;
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok) return [];
    const data=await res.json();
    return (data.results||[]).map((r,i)=>{
      const opts=[...r.incorrect_answers, r.correct_answer].map(s=>decodeURIComponent(s));
      for(let i=opts.length-1;i>0;i--){const j=(Math.random()*(i+1))|0; [opts[i],opts[j]]=[opts[j],opts[i]];}
      const answer=opts.indexOf(decodeURIComponent(r.correct_answer));
      return { id:'t_'+Date.now()+'_'+i, category:'상식', level:3, type:'mcq', q:decodeURIComponent(r.question), choices:opts, answer, image:unsplashFor('상식','중1') };
    });
  }catch(e){ return []; }
}

// Procedural generators per subject & grade scale
function genMath(scale, n){
  const out=[];
  for(let i=0;i<n;i++){
    const typ = scale<=2 ? ['add','sub','cmp'][i%3] : scale<=4 ? ['add','sub','mul','div'][i%4] : ['mul','div','mix'][i%3];
    let a,b,q,ans,choices;
    if(typ==='add'){ a=rand(1, 10*scale); b=rand(1, 10*scale); ans=a+b; q=`${a} + ${b} = ?`; choices=variants(ans); }
    else if(typ==='sub'){ a=rand(1, 10*scale); b=rand(1, a); ans=a-b; q=`${a} - ${b} = ?`; choices=variants(ans); }
    else if(typ==='mul'){ a=rand(1, 3*scale); b=rand(1, 3*scale); ans=a*b; q=`${a} × ${b} = ?`; choices=variants(ans, true); }
    else if(typ==='div'){ b=rand(1, 3*scale); ans=rand(1, 3*scale); a=b*ans; q=`${a} ÷ ${b} = ?`; choices=variants(ans, true); }
    else { // mix word problem
      a=rand(2, 9*scale); b=rand(2, 9*scale); const c=rand(1,5);
      ans=a+b-c; q=`사과가 ${a}개, 배가 ${b}개 있어요. ${c}개를 먹었어요. 남은 개수는?`; choices=variants(ans);
    }
    out.push({id:'m_'+i+'_'+Date.now(),category:'수학',level:scale,type:'mcq',q,choices,answer:choices.indexOf(String(ans)), image: unsplashFor('수학', scaleToGrade(scale))});
  }
  return out;
}
function rand(a,b){return (Math.random()*(b-a+1)+a)|0;}
function variants(ans, wide=false){
  const s=new Set([ans]);
  while(s.size<4){ s.add(ans + (wide? rand(-9,9):rand(-3,3))); }
  return Array.from(s).slice(0,4).map(String).sort(()=>Math.random()-0.5);
}

function genEnglish(scale,n){
  const bankEasy=[['apple','사과'],['dog','개'],['book','책'],['water','물'],['school','학교'],['red','빨강']];
  const bankMid=[['planet','행성'],['library','도서관'],['weather','날씨'],['dangerous','위험한'],['quickly','빠르게'],['complete','완전한']];
  const bankHigh=[['photosynthesis','광합성'],['democracy','민주주의'],['metaphor','은유'],['momentum','운동량'],['derivative','도함수'],['hypothesis','가설']];
  const src = scale<=2?bankEasy: scale<=4?bankMid:bankHigh;
  const out=[];
  for(let i=0;i<n;i++){
    const [word, kr]=src[i%src.length];
    const wrongs = sample(src.filter(x=>x[0]!==word),3).map(x=>x[0]);
    const options = sample([word, ...wrongs],4);
    out.push({id:'e_'+i+'_'+Date.now(),category:'영어',level:scale,type:'mcq',q:`다음 중 ‘${kr}’의 영어는?`,choices:options,answer:options.indexOf(word), image:unsplashFor('영어', scaleToGrade(scale))});
  }
  return out;
}

function genKorean(scale,n){
  const pairs=[['밝다','어둡다'],['높다','낮다'],['빠르다','느리다'],['크다','작다'],['가깝다','멀다'],['뜨겁다','차갑다']];
  const out=[];
  for(let i=0;i<n;i++){
    const [a,b]=pairs[i%pairs.length]; const wrongs=sample(pairs.filter(p=>p[0]!==a).map(p=>p[1]),3);
    const opts = sample([b,...wrongs],4);
    out.push({id:'k_'+i+'_'+Date.now(),category:'국어',level:scale,type:'mcq',q:`‘${a}’의 반댓말은?`,choices:opts,answer:opts.indexOf(b), image:unsplashFor('국어', scaleToGrade(scale))});
  }
  return out;
}

function genScience(scale,n){
  const facts=[
    ['태양은 무엇일까요?', ['별','행성','위성','구름'],0],
    ['물은 몇 도에서 얼음이 되나요? (섭씨)', ['0도','10도','50도','100도'],0],
    ['식물의 잎에서 일어나는 과정은?', ['광합성','증발','발효','연소'],0],
    ['지구의 위성은?', ['달','금성','화성','북극성'],0],
    ['포유류는?', ['고래','상어','문어','참새'],0],
  ];
  const out=[]; for(let i=0;i<n;i++){ const b=facts[i%facts.length]; out.push({id:'s_'+i+'_'+Date.now(),category:'과학',level:scale,type:'mcq',q:b[0],choices:b[1],answer:b[2], image:unsplashFor('과학', scaleToGrade(scale))}); }
  return out;
}

function genSocial(scale,n){
  const facts=[
    ['대한민국의 수도는?', ['서울','부산','대구','인천'],0],
    ['세계에서 사용하는 지도는?', ['세계지도','위성사진','달력','악보'],0],
    ['역사에서 과거 일을 조사하는 사람은?', ['역사가','과학자','화가','음악가'],0],
    ['지구본은 무엇을 줄여 놓은 것?', ['지구','태양','달','별자리'],0],
  ];
  const out=[]; for(let i=0;i<n;i++){ const b=facts[i%facts.length]; out.push({id:'h_'+i+'_'+Date.now(),category:'사회/역사',level:scale,type:'mcq',q:b[0],choices:b[1],answer:b[2], image:unsplashFor('사회/역사', scaleToGrade(scale))}); }
  return out;
}

function scaleToGrade(scale){
  const inv={1:'초1',2:'초3',3:'초6',4:'중2',5:'고1',6:'고3'}; return inv[scale]||'초1';
}

// Timer
function startTimer(){stopTimer();const secs=+$('#timerSelect').value;const badge=$('#timerBadge');if(!secs){badge.classList.add('hidden');return;}state.timer=secs;badge.classList.remove('hidden');$('#timerText').textContent=state.timer+'s';state.timerId=setInterval(()=>{state.timer--;$('#timerText').textContent=Math.max(0,state.timer)+'s';if(state.timer<=0){stopTimer();const nodes=$$('#choices .choice');nodes.forEach(n=>n.disabled=true);const q=state.deck[state.idx];nodes[q.answer]?.classList.add('correct');$('#feedback').textContent='시간 초과! 정답: '+q.choices[q.answer];storeWrong(q);state.revealed=true;updateProgress();setTimeout(()=>{if(state.idx<state.deck.length-1){state.idx++;renderQuestion();updateProgress();}else{showResult();}},900);}},1000);}
function stopTimer(){if(state.timerId){clearInterval(state.timerId);state.timerId=null;}}
function storeWrong(q){if(!state.sessionWrongs.some(w=>w.id===q.id))state.sessionWrongs.push(q);}

// UI binds
const numQ=$('#numQ'), numQVal=$('#numQVal');numQ.addEventListener('input',()=>numQVal.textContent=numQ.value);
document.addEventListener('click',ev=>{const t=ev.target.closest('button[data-theme]');if(!t)return;const th=t.dataset.theme;document.body.dataset.theme=th;document.documentElement.style.setProperty('--bg',themeMap[th]||'#f8fbff');});
document.getElementById('startBtn').addEventListener('click',()=>{state.reviewMode=false;startQuiz();});
document.getElementById('btnReviewWrong').addEventListener('click',()=>{state.reviewMode=true;startQuiz();});
document.getElementById('btnReveal').addEventListener('click',()=>{const q=state.deck[state.idx];const nodes=$$('#choices .choice');nodes[q.answer]?.classList.add('correct');$('#feedback').textContent=q.explanation?`정답: ${q.choices[q.answer]} — ${q.explanation}`:`정답: ${q.choices[q.answer]}`;state.revealed=true;nodes.forEach(n=>n.disabled=true);stopTimer();});
document.getElementById('btnNext').addEventListener('click',()=>{if(state.idx<state.deck.length-1){state.idx++;renderQuestion();updateProgress();}else{showResult();}});
document.getElementById('btnRetry').addEventListener('click',startQuiz);
document.getElementById('btnHome').addEventListener('click',()=>{stopTimer();state.reviewMode=false;$('#result').classList.add('hidden');$('#idle').classList.remove('hidden');});

function renderQuestion(){const q=state.deck[state.idx];const tag=tagFor(q.category);tag.id='tagCat';$('#tagCat').replaceWith(tag);$('#tagLvl').textContent=`${$('#grade').value}`;$('#qIndex').textContent=state.idx+1;$('#qText').textContent=q.q;const wrap=$('#qImageWrap');if(q.image){$('#qImage').src=q.image;wrap.classList.remove('hidden');}else{wrap.classList.add('hidden');}const box=$('#choices');box.innerHTML='';q.choices.forEach((c,i)=>{const btn=document.createElement('button');btn.className='choice';btn.innerHTML=`<span class="mr-2">${String.fromCharCode(65+i)}.</span> ${c}`;btn.addEventListener('click',()=>selectChoice(i));box.appendChild(btn);});$('#feedback').textContent='\\u00A0';state.revealed=false;startTimer();}
function selectChoice(i){if(state.revealed)return;stopTimer();const q=state.deck[state.idx];const nodes=$$('#choices .choice');nodes.forEach(n=>n.disabled=true);if(i===q.answer){nodes[i].classList.add('correct');$('#feedback').textContent='정답! 잘했어요 ✨';state.right++;state.streak++;awardSticker();}else{nodes[i].classList.add('wrong');nodes[q.answer]?.classList.add('correct');$('#feedback').textContent='아쉬워요! 다음 문제에 도전!';state.streak=0;storeWrong(q);}state.revealed=true;updateProgress();}
function updateProgress(){const pct=Math.round((state.idx/Math.max(1,state.deck.length))*100);}
function showResult(){stopTimer();$('#quiz').classList.add('hidden');$('#result').classList.remove('hidden');$('#scoreRight').textContent=state.right;$('#scoreTotal').textContent=state.deck.length;$('#scorePct').textContent=Math.round((state.right/state.deck.length)*100);state.sessionWrongs.length&&saveWrongs([...loadWrongs(),...state.sessionWrongs]);state.sessionWrongs=[];}

// Build deck
async function pickDeck(){
  const grade=$('#grade').value; const subject=$('#subject').value; const n=+$('#numQ').value;
  if(state.reviewMode){ const wrongs=loadWrongs(); if(wrongs.length===0){ alert('오답노트가 비어 있어요.'); return []; } return wrongs.slice().sort(()=>Math.random()-0.5).slice(0,n); }
  const scale=gradeScale[grade]||2;
  let pool=[];
  if(subject==='수학') pool=genMath(scale, n*2);
  else if(subject==='영어') pool=genEnglish(scale, n*2);
  else if(subject==='국어') pool=genKorean(scale, n*2);
  else if(subject==='과학') pool=genScience(scale, n*2);
  else if(subject==='사회/역사') pool=genSocial(scale, n*2);
  else if(subject==='상식') pool=await loadOpenTDB(Math.min(50, n*3));
  // ensure image
  pool.forEach(q=>{ if(!q.image) q.image=unsplashFor(subject, grade); });
  return sample(pool, Math.min(n, pool.length));
}

async function startQuiz(){
  const deck=await pickDeck();
  if(deck.length===0) return;
  Object.assign(state,{deck,idx:0,right:0,streak:0,revealed:false,sessionWrongs:[]});
  $('#qTotal').textContent=deck.length;$('#idle').classList.add('hidden');$('#result').classList.add('hidden');$('#quiz').classList.remove('hidden');renderQuestion();
}

function init(){
  document.documentElement.style.setProperty('--bg', themeMap['sky']);
  renderStickers();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
console.log('[KidsQuiz] v1.4.0 infinite ready');
