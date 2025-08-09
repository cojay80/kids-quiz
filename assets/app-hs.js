// Kids Quiz v1.5.0 — HS upgrade + anti-dup + richer templates
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const sample=(arr,n)=>arr.slice().sort(()=>Math.random()-0.5).slice(0,n);
const themeMap={sky:'#f8fbff',forest:'#f6fff8',candy:'#fff7fb',space:'#f7f9ff',dino:'#fcfff6'};

// Stickers
const STICKERS=[
  {id:'leaf',name:'Leaf',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f332.svg'},
  {id:'star',name:'Star',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f31f.svg'},
  {id:'book',name:'Book',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d6.svg'},
  {id:'pencil',name:'Pencil',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270f.svg'},
];
const STK_KEY='kidquiz_stickers_v1';const getStickers=()=>{try{return JSON.parse(localStorage.getItem(STK_KEY)||'[]')}catch{return[]}};const saveStickers=a=>localStorage.setItem(STK_KEY,JSON.stringify(a));
function renderStickers(){const grid=$('#stickerGrid');const owned=new Set(getStickers());grid.innerHTML='';$('#stickerTotal').textContent=STICKERS.length;$('#stickerCount').textContent=owned.size;STICKERS.forEach(s=>{const img=new Image();img.alt=s.name;img.title=owned.has(s.id)?s.name:`${s.name} (locked)`;img.src=s.url;if(!owned.has(s.id))img.classList.add('sticker-locked');grid.appendChild(img);});}
function awardSticker(){const owned=new Set(getStickers());if(owned.size===STICKERS.length)return;if(Math.random()<0.3){const c=STICKERS.filter(x=>!owned.has(x.id));if(c.length){const s=c[(Math.random()*c.length)|0];saveStickers([...owned,s.id]);renderStickers();const wrap=document.createElement('div');wrap.className='sticker-toast';wrap.innerHTML=`<div class="sticker-badge"><img alt="sticker" src="${s.url}"/><span>Sticker! ${s.name}</span></div>`;document.body.appendChild(wrap);setTimeout(()=>wrap.remove(),1400);}}}

const WRONGS_KEY='kidquiz_wrongs_v1';const loadWrongs=()=>{try{return JSON.parse(localStorage.getItem(WRONGS_KEY)||'[]')}catch{return[]}};const saveWrongs=a=>localStorage.setItem(WRONGS_KEY,JSON.stringify(a));

// Anti-dup memory (cross-session)
const SEEN_KEY='kidquiz_seen_v1';
function seenSet(){try{return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)||'[]'))}catch{return new Set()}}
function pushSeen(sig){const s=seenSet();s.add(sig);const arr=Array.from(s);if(arr.length>800) arr.splice(0, arr.length-800);localStorage.setItem(SEEN_KEY, JSON.stringify(arr));}
function makeSig(q){return q.signature || (q.category+'|'+q.level+'|'+q.q.replace(/\s+/g,' ').slice(0,160));}

// Grade scale
const gradeScale={ '초1':1,'초2':1,'초3':2,'초4':2,'초5':3,'초6':3,'중1':4,'중2':4,'중3':5,'고1':5,'고2':6,'고3':6 };

// Helpers
function mix(arr){ for(let i=arr.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }
function pick(arr){ return arr[(Math.random()*arr.length)|0]; }
function rand(a,b){ return (Math.random()*(b-a+1)+a)|0; }
function choiceVariants(correct, deltas, formatter=(x)=>String(x)){
  const set=new Set([correct]);
  mix(deltas.slice()).forEach(d=>{ if(set.size<4) set.add(correct+d); });
  while(set.size<4) set.add(correct + rand(-9,9));
  return mix(Array.from(set)).map(formatter);
}
function htmlSup(n){ return `<sup>${n}</sup>`; }

// Unsplash: only for elem/middle; for HS -> disabled by default
function unsplashFor(subject, grade){
  if(grade.startsWith('고')) return null;
  const map={ '국어':'korean,letters,illustration', '수학':'math,geometry,worksheet', '영어':'english,reading,flashcards', '과학':'science,experiment,kids', '사회/역사':'history,globe,map', '상식':'kids,education,illustration' };
  const kw = `${map[subject]||'education'},${grade}`;
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(kw)}`;
}

// MATH — HS templates
function genMathHS(scale,n){
  const out=[]; const seen=seenSet();
  const T=[
    // Quadratic roots ax^2+bx+c=0
    ()=>{ let a=rand(1,3)*pick([1,2]); let r1=rand(-6,6); let r2=rand(-6,6); if(r1===r2) r2+=pick([-1,1,2]); 
          const b= -a*(r1+r2), c= a*(r1*r2);
          const qa=`${a!==1?a:''}x${htmlSup(2)} ${b<0?'-':'+'} ${Math.abs(b)}x ${c<0?'-':'+'} ${Math.abs(c)} = 0 의 해의 합은?`;
          const sum=r1+r2; const ch=choiceVariants(sum,[ -2,-1,1,2 ],(v)=>String(v)); 
          const expl=`근의 합 = -b/a = ${-b}/${a} = ${sum}`;
          return {q:qa, choices:ch, ans:ch.indexOf(String(sum)), expl};
    },
    // Vertex of y=ax^2+bx+c
    ()=>{ let a=pick([-2,-1,1,2]), b=rand(-8,8), c=rand(-5,10);
          const h = (-b)/(2*a); const k = a*h*h + b*h + c;
          const qa=`함수 y = ${a!==1? (a===-1?'-':'')+Math.abs(a):''}x${htmlSup(2)} ${b<0?'-':'+'} ${Math.abs(b)}x ${c<0?'-':'+'} ${Math.abs(c)} 의 꼭짓점 좌표는?`;
          const opts=[ [h,k], [h,-k], [-h,k], [h/2,k] ].map(p=>`(${(Math.round(p[0]*100)/100)}, ${(Math.round(p[1]*100)/100)})`);
          const ans=0, expl=`꼭짓점 x = -b/(2a) = ${-b}/${2*a}, y = f(x)`;
          return {q:qa, choices:mix(opts.slice()), ans:opts.indexOf(opts[ans]), expl};
    },
    // System of equations
    ()=>{ const a=rand(1,6),b=rand(1,6),c=rand(1,6),d=rand(1,6),x=rand(-5,5),y=rand(-5,5);
          const e=a*x+b*y, f=c*x+d*y;
          const qa=`연립방정식 ${a}x + ${b}y = ${e}, ${c}x + ${d}y = ${f} 의 x 값은?`;
          const ans=x; const ch=choiceVariants(ans,[-3,-2,-1,1,2,3]);
          const expl=`가감법/행렬식으로 풀이 가능. 실제 해: x=${x}, y=${y}`;
          return {q:qa, choices:ch, ans:ch.indexOf(String(ans)), expl};
    },
    // Inequality
    ()=>{ const p=rand(1,8), q=rand(1,8), r=rand(1,8); const qa=`부등식 ${p}x - ${q} > ${r} 를 만족하는 x의 범위는?`;
          const ans=(r+q)/p; const opts=[`x > ${(r+q)/p}`, `x ≥ ${(r+q)/p}`, `x < ${(r+q)/p}`, `x ≤ ${(r+q)/p}`];
          const expl=`${p}x > ${r+q} → x > ${(r+q)}/${p}`;
          const choices=mix(opts.slice()); return {q:qa, choices, ans:choices.indexOf(`x > ${(r+q)/p}`), expl};
    },
    // Sequence nth term
    ()=>{ const a1=rand(-5,10), d=rand(1,9); const n0=rand(5,12);
          const qa=`등차수열 a<sub>n</sub>= a<sub>1</sub> + (n-1)d 에서 a<sub>1</sub>=${a1}, d=${d}. a<sub>${n0}</sub>의 값은?`;
          const ans= a1+(n0-1)*d; const ch=choiceVariants(ans,[-2*d,-d,d,2*d]);
          const expl=`a_n = ${a1} + (${n0}-1)×${d} = ${ans}`;
          return {q:qa, choices:ch, ans:ch.indexOf(String(ans)), expl};
    },
    // Probability simple
    ()=>{ const red=rand(1,5), blue=rand(1,5), green=rand(1,5);
          const total=red+blue+green; const qa=`상자에 빨강 ${red}개, 파랑 ${blue}개, 초록 ${green}개 공이 있다. 임의로 1개 뽑을 때 빨강이 나올 확률은?`;
          const ans = `${red}/${total}`; const choices=mix([ans, `${blue}/${total}`, `${green}/${total}`, `${red}/${total-1}`]);
          const expl=`전체 ${total} 중 빨강 ${red} → ${red}/${total}`;
          return {q:qa, choices, ans:choices.indexOf(ans), expl};
    },
  ];
  let tries=0;
  while(out.length<n && tries< n*10){
    tries++;
    const t = pick(T)();
    const qtext=t.q.replace(/\s+/g,' ').trim();
    const sig='M|'+qtext;
    if(!seen.has(sig)){
      out.push({ id:'m'+Date.now()+out.length, category:'수학', level:6, type:'mcq', q:t.q, choices:t.choices, answer:t.ans, explanation:t.expl });
      pushSeen(sig);
    }
  }
  return out;
}

// ENGLISH — HS templates
function genEnglishHS(scale,n){
  const out=[]; const seen=seenSet();
  const passages=[
    {txt:"Online classes offer flexibility, but they also demand strong self-discipline. Without regular reminders, many students struggle to keep up with deadlines.", q:[
      {type:'main', stem:'The main idea of the passage is that online classes...', options:['provide flexibility but require self-discipline','are easier than traditional classes','guarantee better grades','have no deadlines'], ans:0},
      {type:'vocab', stem:'The word “flexibility” is closest in meaning to:', options:['strictness','freedom to choose','punishment','silence'], ans:1}
    ]},
    {txt:"Photosynthesis allows plants to convert light energy into chemical energy stored in glucose. This process is essential for most life on Earth.", q:[
      {type:'detail', stem:'According to the passage, photosynthesis stores energy in:', options:['oxygen','glucose','water','carbon dioxide'], ans:1},
      {type:'inference', stem:'It can be inferred that without photosynthesis,', options:['plants would still grow normally','most life would be affected','animals would not need oxygen','the sun would be cooler'], ans:1}
    ]},
  ];
  const grammar=[
    {stem:'Choose the grammatically correct sentence.', options:['He don’t like math.','He doesn’t likes math.','He doesn’t like math.','He not like math.'], ans:2, expl:'3인칭 단수 + do 동사: does + 동사원형'},
    {stem:'Choose the best word to complete: “If it ____ tomorrow, we will stay home.”', options:['rains','rained','is rain','has rained'], ans:0, expl:'조건절: If + 주어 + 현재동사, 주절 will + 동사원형'},
    {stem:'Choose the correct preposition: “She is good ___ solving puzzles.”', options:['at','in','on','for'], ans:0, expl:'be good at ~ing'},
  ];
  const vocab=[
    {stem:'Which word means “to make something better”?', options:['improve','decline','ignore','delay'], ans:0},
    {stem:'Which is the opposite of “scarce”?', options:['plentiful','rare','absent','little'], ans:0},
  ];
  let i=0;
  while(out.length<n && i<200){
    i++;
    const typ = pick(['passage','grammar','vocab','grammar']);
    if(typ==='passage'){
      const p=pick(passages);
      const pickQ=pick(p.q);
      const sig='E|P|'+p.txt.slice(0,50)+'|'+pickQ.stem;
      if(seen.has(sig)) continue;
      const choices=mix(pickQ.options.slice());
      const ans=choices.indexOf(pickQ.options[pickQ.ans]);
      out.push({ id:'e'+Date.now()+out.length, category:'영어', level:6, type:'mcq', q:`<div class="text-base md:text-lg leading-relaxed mb-3 text-slate-700">${p.txt}</div><div>${pickQ.stem}</div>`, choices:choices, answer:ans, explanation: pickQ.expl || null });
      pushSeen(sig);
    }else if(typ==='grammar'){
      const g=pick(grammar); const sig='E|G|'+g.stem;
      if(seen.has(sig)) continue;
      const choices=mix(g.options.slice()); const ans=choices.indexOf(g.options[g.ans]);
      out.push({ id:'e'+Date.now()+out.length, category:'영어', level:6, type:'mcq', q:g.stem, choices, answer:ans, explanation:g.expl||null });
      pushSeen(sig);
    }else{
      const v=pick(vocab); const sig='E|V|'+v.stem;
      if(seen.has(sig)) continue;
      const choices=mix(v.options.slice()); const ans=choices.indexOf(v.options[v.ans]);
      out.push({ id:'e'+Date.now()+out.length, category:'영어', level:6, type:'mcq', q:v.stem, choices, answer:ans, explanation:null });
      pushSeen(sig);
    }
  }
  return out;
}

// Lower-grade generators (short)
function genMath(scale,n){
  if(scale>=5) return genMathHS(scale,n);
  const out=[]; for(let i=0;i<n;i++){ const a=rand(1,10*scale), b=rand(1,10*scale); const ans=a+b; const choices=choiceVariants(ans,[-2,-1,1,2]); out.push({id:'m_l_'+i+Date.now(),category:'수학',level:scale,type:'mcq',q:`${a} + ${b} = ?`,choices,answer:choices.indexOf(String(ans)), image: unsplashFor('수학','초'+scale)}); } return out;
}
function genEnglish(scale,n){
  if(scale>=5) return genEnglishHS(scale,n);
  const bank=[['apple','사과'],['book','책'],['dog','개'],['water','물'],['school','학교'],['red','빨강'],['yesterday','어제']];
  const out=[]; for(let i=0;i<n;i++){ const [w,kr]=bank[i%bank.length]; const wrongs=bank.filter(x=>x[0]!==w).slice(0,3).map(x=>x[0]); const choices=mix([w,...wrongs]); out.push({id:'e_l_'+i+Date.now(),category:'영어',level:scale,type:'mcq',q:`‘${kr}’의 영어는?`,choices,answer:choices.indexOf(w), image: unsplashFor('영어','초'+scale)}); } return out;
}
function genKorean(scale,n){ const pairs=[['밝다','어둡다'],['빠르다','느리다'],['높다','낮다'],['크다','작다']]; const out=[]; for(let i=0;i<n;i++){ const [a,b]=pairs[i%pairs.length]; const wrongs=sample(pairs.filter(p=>p[1]!==b).map(p=>p[1]),3); const choices=mix([b,...wrongs]); out.push({id:'k_'+i+Date.now(),category:'국어',level:scale,type:'mcq',q:`‘${a}’의 반댓말은?`,choices,answer:choices.indexOf(b), image: unsplashFor('국어','초'+scale)});} return out; }
function genScience(scale,n){ const f=[['태양은?', ['별','행성','위성','구름'],0],['광합성은?', ['식물 에너지 저장','비행','연소','증발'],0]]; const out=[]; for(let i=0;i<n;i++){const b=f[i%f.length]; out.push({id:'s_'+i+Date.now(),category:'과학',level:scale,type:'mcq',q:b[0],choices:b[1],answer:b[2], image: unsplashFor('과학','초'+scale)});} return out; }
function genSocial(scale,n){ const f=[['대한민국 수도?', ['서울','부산','대구','인천'],0],['지구본은?', ['지구 축소 모형','태양 모형','달 모형','화산 모형'],0]]; const out=[]; for(let i=0;i<n;i++){const b=f[i%f.length]; out.push({id:'h_'+i+Date.now(),category:'사회/역사',level:scale,type:'mcq',q:b[0],choices:b[1],answer:b[2], image: unsplashFor('사회/역사','초'+scale)});} return out; }
async function genTrivia(n){ // OpenTDB
  try{ const res=await fetch(`https://opentdb.com/api.php?amount=${n}&type=multiple&encode=url3986`,{cache:'no-store'}); if(!res.ok) return []; const data=await res.json(); return (data.results||[]).map((r,i)=>{ const opts=[...r.incorrect_answers, r.correct_answer].map(s=>decodeURIComponent(s)); mix(opts); const ans=opts.indexOf(decodeURIComponent(r.correct_answer)); return { id:'t_'+i+Date.now(), category:'상식', level:3, type:'mcq', q:decodeURIComponent(r.question), choices:opts, answer:ans }; }); }catch(e){ return []; }
}

// Timer
const state={ deck:[], idx:0, right:0, streak:0, revealed:false, reviewMode:false, sessionWrongs:[], timer:0, timerId:null };
function startTimer(){stopTimer();const secs=+$('#timerSelect').value;const badge=$('#timerBadge');if(!secs){badge.classList.add('hidden');return;}state.timer=secs;badge.classList.remove('hidden');$('#timerText').textContent=state.timer+'s';state.timerId=setInterval(()=>{state.timer--;$('#timerText').textContent=Math.max(0,state.timer)+'s';if(state.timer<=0){stopTimer();const nodes=$$('#choices .choice');nodes.forEach(n=>n.disabled=true);const q=state.deck[state.idx];nodes[q.answer]?.classList.add('correct');$('#feedback').textContent='시간 초과! 정답: '+q.choices[q.answer];storeWrong(q);state.revealed=true;setTimeout(()=>{if(state.idx<state.deck.length-1){state.idx++;renderQuestion();}else{showResult();}},900);}},1000);}
function stopTimer(){if(state.timerId){clearInterval(state.timerId);state.timerId=null;}}
function storeWrong(q){if(!state.sessionWrongs.some(w=>w.id===q.id))state.sessionWrongs.push(q);}

// UI binds
document.getElementById('startBtn').addEventListener('click',()=>{state.reviewMode=false;startQuiz();});
document.getElementById('btnReviewWrong').addEventListener('click',()=>{state.reviewMode=true;startQuiz();});
document.getElementById('btnReveal').addEventListener('click',()=>{const q=state.deck[state.idx];const nodes=$$('#choices .choice');nodes[q.answer]?.classList.add('correct');$('#feedback').innerHTML=q.explanation?`정답: <b>${q.choices[q.answer]}</b> — <span class="text-slate-600">${q.explanation}</span>`:`정답: <b>${q.choices[q.answer]}</b>`;state.revealed=true;nodes.forEach(n=>n.disabled=true);stopTimer();});
document.getElementById('btnNext').addEventListener('click',()=>{if(state.idx<state.deck.length-1){state.idx++;renderQuestion();}else{showResult();}});
document.getElementById('btnRetry').addEventListener('click',startQuiz);
document.getElementById('btnHome').addEventListener('click',()=>{$('#result').classList.add('hidden');$('#idle').classList.remove('hidden');});

function renderQuestion(){const q=state.deck[state.idx];const tag=document.createElement('span');tag.className='tag';tag.textContent=q.category;$('#tagCat').replaceWith(tag);$('#tagLvl').textContent=$('#grade').value;$('#qIndex').textContent=state.idx+1;$('#qText').innerHTML=q.q;const wrap=$('#qImageWrap');if(q.image){$('#qImage').src=q.image;wrap.classList.remove('hidden');}else{wrap.classList.add('hidden');}const box=$('#choices');box.innerHTML='';q.choices.forEach((c,i)=>{const btn=document.createElement('button');btn.className='choice';btn.innerHTML=`<span class="mr-2">${String.fromCharCode(65+i)}.</span> ${c}`;btn.addEventListener('click',()=>selectChoice(i));box.appendChild(btn);});$('#feedback').innerHTML='&nbsp;';state.revealed=false;startTimer();}
function selectChoice(i){if(state.revealed)return;stopTimer();const q=state.deck[state.idx];const nodes=$$('#choices .choice');nodes.forEach(n=>n.disabled=true);if(i===q.answer){nodes[i].classList.add('correct');$('#feedback').textContent='정답! 잘했어요 ✨';}else{nodes[i].classList.add('wrong');nodes[q.answer]?.classList.add('correct');$('#feedback').textContent='오답! 해설을 확인해요';storeWrong(q);}state.revealed=true;}
function showResult(){$('#quiz').classList.add('hidden');$('#result').classList.remove('hidden');$('#scoreRight').textContent=state.deck.filter((q,i)=>{const btns=$$('#choices .choice');return true;}).length;$('#scoreTotal').textContent=state.deck.length;$('#scorePct').textContent=Math.round((state.deck.length? (state.right/state.deck.length):0)*100); if(state.sessionWrongs.length){ const cur=loadWrongs(); saveWrongs(cur.concat(state.sessionWrongs).slice(-400)); state.sessionWrongs=[]; }}

// Build deck
async function pickDeck(){
  const grade=$('#grade').value; const subject=$('#subject').value; const n=+$('#numQ').value;
  if(state.reviewMode){ const wrongs=loadWrongs(); if(wrongs.length===0){ alert('오답노트가 비어 있어요.'); return []; } return wrongs.slice().sort(()=>Math.random()-0.5).slice(0,n); }
  const scale=gradeScale[grade]||2;
  let pool=[];
  if(subject==='수학'){ pool = scale>=5 ? genMathHS(scale, n*3) : genMath(scale, n*2); }
  else if(subject==='영어'){ pool = scale>=5 ? genEnglishHS(scale, n*3) : genEnglish(scale, n*2); }
  else if(subject==='국어'){ pool = genKorean(scale, n*2); }
  else if(subject==='과학'){ pool = genScience(scale, n*2); }
  else if(subject==='사회/역사'){ pool = genSocial(scale, n*2); }
  else if(subject==='상식'){ pool = await genTrivia(Math.min(50, n*3)); }
  // fill images for non-HS only
  if(!grade.startsWith('고')) pool.forEach(q=>{ if(!q.image) q.image=unsplashFor(subject, grade); });
  // final sample unique (by signature)
  const s=seenSet(); const out=[]; for(const q of pool){ const sig=makeSig(q); if(out.length>=n) break; if(!s.has(sig)){ out.push(q); pushSeen(sig); } }
  return out;
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
  // bump base font for HS readability
  const qEl=document.getElementById('qText'); qEl && (qEl.style.lineHeight='1.5');
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
console.log('[KidsQuiz] v1.5.0 HS upgrade ready');
