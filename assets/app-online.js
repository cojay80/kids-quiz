// Kids Quiz v1.3.0 — Online question loader
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const sample=(arr,n)=>arr.slice().sort(()=>Math.random()-0.5).slice(0,n);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const themeMap={sky:'#f8fbff',forest:'#f6fff8',candy:'#fff7fb',space:'#f7f9ff',dino:'#fcfff6'};

function tagFor(cat){const el=document.createElement('span');el.className='tag';el.textContent=cat;if(cat==='국어')el.classList.add('tag-kr');if(cat==='수학')el.classList.add('tag-math');if(cat==='영어')el.classList.add('tag-en');if(cat==='상식')el.classList.add('tag-gk');return el;}

const STICKERS=[
  {id:'leaf',name:'Leaf',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f332.svg'},
  {id:'star',name:'Star',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f31f.svg'},
  {id:'book',name:'Book',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4d6.svg'},
  {id:'pencil',name:'Pencil',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/270f.svg'},
];
const STK_KEY='kidquiz_stickers_v1';const getStickers=()=>{try{return JSON.parse(localStorage.getItem(STK_KEY)||'[]')}catch{return[]}};const saveStickers=a=>localStorage.setItem(STK_KEY,JSON.stringify(a));
function renderStickers(){const grid=$('#stickerGrid');const owned=new Set(getStickers());grid.innerHTML='';$('#stickerTotal').textContent=STICKERS.length;$('#stickerCount').textContent=owned.size;STICKERS.forEach(s=>{const img=new Image();img.alt=s.name;img.title=owned.has(s.id)?s.name:`${s.name} (locked)`;img.src=s.url;if(!owned.has(s.id))img.classList.add('sticker-locked');grid.appendChild(img);});}
function awardSticker(){const owned=new Set(getStickers());if(owned.size===STICKERS.length)return;if(Math.random()<0.35){const c=STICKERS.filter(x=>!owned.has(x.id));if(c.length){const s=c[(Math.random()*c.length)|0];saveStickers([...owned,s.id]);renderStickers();const wrap=document.createElement('div');wrap.className='sticker-toast';wrap.innerHTML=`<div class="sticker-badge"><img alt="sticker" src="${s.url}"/><span>Sticker! ${s.name}</span></div>`;document.body.appendChild(wrap);setTimeout(()=>wrap.remove(),1400);}}}

const WRONGS_KEY='kidquiz_wrongs_v1';const loadWrongs=()=>{try{return JSON.parse(localStorage.getItem(WRONGS_KEY)||'[]')}catch{return[]}};const saveWrongs=a=>localStorage.setItem(WRONGS_KEY,JSON.stringify(a));

// Offline fallback basic questions
function offlineQuestions(){
  const out=[]; const cats=['국어','수학','영어','상식']; const counts={1:10,2:10,3:10};
  const mc=(cat,level,i,q,choices,ans,expl,img)=>out.push({id:`${cat[0]}${level}_${i}`,category:cat,level,type:'mcq',q,choices,answer:ans, ...(expl?{explanation:expl}:{}) , ...(img?{image:img}:{})});
  cats.forEach(cat=>{for(const level of[1,2,3]){for(let i=0;i<counts[level];i++){
    if(cat==='수학'){ const a=1+((i*3)%9), b=1+((i*5)%9); const ans=a+b; mc(cat,level,i,`${a}+${b}=?`,[String(ans-1),String(ans),String(ans+1),String(ans+2)],1); }
    else if(cat==='영어'){ const b=[['apple?', ['apple','banana','grape','peach'],0],['water?', ['milk','water','juice','tea'],1],['dog?', ['cat','dog','bird','fish'],1]][i%3]; mc(cat,level,i,b[0],b[1],b[2]); }
    else if(cat==='국어'){ const b=[['자음은?', ['ㅏ','ㅗ','ㅂ','ㅣ'],2],['반댓말(밝다)?', ['어둡다','빠르다','길다','차갑다'],0]][i%2]; mc(cat,level,i,b[0],b[1],b[2]); }
    else { const b=[['태양은?', ['별','행성','달','돌'],0],['무지개 색?', ['7','5','3','1'],0]][i%2]; mc(cat,level,i,b[0],b[1],b[2]); }
  }}}); return out;
}

// Unsplash source image (no key) — randomized
function unsplashFor(q){
  if(!window.KQ_CONFIG?.ENABLE_UNSPLASH) return null;
  const map={ '국어':'korean,letters,illustration', '수학':'math,worksheet,illustration', '영어':'english,alphabet,illustration', '상식':'kids,science,illustration' };
  const kw = q.image_query || map[q.category] || 'kids,education,illustration';
  // Use Source Unsplash (random) — safe for static sites
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(kw)}`;
}

// Google Sheets CSV (publish to web) loader
async function loadFromSheet(selectedCats, level){
  const id = window.KQ_CONFIG?.SHEET_ID;
  if(!id) return [];
  const tab = encodeURIComponent(window.KQ_CONFIG?.SHEET_TAB || 'questions');
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${tab}`;
  const res = await fetch(url, {cache:'no-store'});
  if(!res.ok) throw new Error('sheet fetch '+res.status);
  const csv = await res.text();
  // Parse CSV: category,level,type,q,choice1,choice2,choice3,choice4,answer,explanation,image,image_query
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const header = lines.shift().split(',');
  const idx = (name)=> header.findIndex(h => h.trim().toLowerCase()===name);
  const out=[];
  for(const line of lines){
    const cols = line.split(','); // simple CSV; for commas inside values user should wrap in quotes
    const get = (k)=> cols[idx(k)]?.trim();
    const cat = get('category')||get('카테고리')||'상식';
    const lvl = parseInt(get('level')||get('난이도')||'1',10);
    if(!selectedCats.has(cat) || lvl>level) continue;
    const choices=[get('choice1'),get('choice2'),get('choice3'),get('choice4')].filter(Boolean);
    if(!get('q') || choices.length<2) continue;
    let img = get('image'); const iq = get('image_query');
    if(!img) img = unsplashFor({category:cat,image_query:iq});
    const ans = Math.max(0, Math.min(choices.length-1, (parseInt(get('answer')||'1',10)-1)));
    out.push({ id:'s_'+out.length, category:cat, level:lvl, type:get('type')||'mcq', q:get('q'), choices, answer:ans, ...(get('explanation')?{explanation:get('explanation')}:{}) , ...(img?{image:img}:{}) });
  }
  return out;
}

// Open Trivia DB fallback loader (General Knowledge only)
async function loadFromOpenTDB(amount=20){
  if(!window.KQ_CONFIG?.ENABLE_OPENTDB) return [];
  try{
    const url=`https://opentdb.com/api.php?amount=${amount}&type=multiple&encode=url3986`;
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok) return [];
    const data=await res.json();
    const arr=(data.results||[]).map((r,i)=>{
      const opts=[...r.incorrect_answers, r.correct_answer].map(s=>decodeURIComponent(s));
      for(let i=opts.length-1;i>0;i--){const j=(Math.random()* (i+1))|0; [opts[i],opts[j]]=[opts[j],opts[i]];}
      const answer = opts.indexOf(decodeURIComponent(r.correct_answer));
      return { id:'t_'+i, category:'상식', level:2, type:'mcq', q:decodeURIComponent(r.question), choices:opts, answer, image: unsplashFor({category:'상식', image_query: r.category}) };
    });
    return arr;
  }catch(e){ return []; }
}

// state
const state={ deck:[], idx:0, right:0, streak:0, revealed:false, reviewMode:false, sessionWrongs:[], timer:0, timerId:null };
const statsKey='kidquiz_stats_v1'; const stats=(()=>{let s={today:0,bestStreak:0,theme:localStorage.getItem('theme')||'sky'};try{s=Object.assign(s,JSON.parse(localStorage.getItem(statsKey)||'{}'));}catch{}function persist(){localStorage.setItem(statsKey,JSON.stringify(s));localStorage.setItem('theme',s.theme);}return{get:()=>s,incToday(){s.today++;persist();},setBest(n){if(n>s.bestStreak){s.bestStreak=n;persist();}},setTheme(t){s.theme=t;persist();}}})();

function renderStats(){$('#todayCount')&&($('#todayCount').textContent=stats.get().today);$('#bestStreak')&&($('#bestStreak').textContent=stats.get().bestStreak);}
function startTimer(){stopTimer();const secs=+$('#timerSelect').value;const badge=$('#timerBadge');if(!secs){badge.classList.add('hidden');return;}state.timer=secs;badge.classList.remove('hidden');$('#timerText').textContent=state.timer+'s';state.timerId=setInterval(()=>{state.timer--;$('#timerText').textContent=Math.max(0,state.timer)+'s';if(state.timer<=0){stopTimer();const nodes=$$('#choices .choice');nodes.forEach(n=>n.disabled=true);const q=state.deck[state.idx];nodes[q.answer]?.classList.add('correct');$('#feedback').textContent='시간 초과! 정답: '+q.choices[q.answer];storeWrong(q);state.revealed=true;updateProgress();setTimeout(()=>{if(state.idx<state.deck.length-1){state.idx++;renderQuestion();updateProgress();}else{showResult();}},900);}},1000);}
function stopTimer(){if(state.timerId){clearInterval(state.timerId);state.timerId=null;}}
function storeWrong(q){if(!state.sessionWrongs.some(w=>w.id===q.id))state.sessionWrongs.push(q);}
function tag(cat){const t=tagFor(cat);t.id='tagCat';$('#tagCat').replaceWith(t);}

// UI binds
const numQ=$('#numQ'), numQVal=$('#numQVal');numQ.addEventListener('input',()=>numQVal.textContent=numQ.value);
let selectedCats=new Set(['국어']);$$('.cat').forEach(b=>{const update=()=>{if(selectedCats.has(b.dataset.cat)){b.classList.add('ring-2','ring-offset-2');}else{b.classList.remove('ring-2','ring-offset-2');}};b.addEventListener('click',()=>{if(selectedCats.has(b.dataset.cat))selectedCats.delete(b.dataset.cat);else selectedCats.add(b.dataset.cat);if(selectedCats.size===0) selectedCats.add(b.dataset.cat); update();});update();});
document.addEventListener('click',ev=>{const t=ev.target.closest('button[data-theme]');if(!t)return;const th=t.dataset.theme;document.body.dataset.theme=th;document.documentElement.style.setProperty('--bg',themeMap[th]||'#f8fbff');stats.setTheme(th);});
document.getElementById('btnConfig').addEventListener('click',()=>{alert('데이터 연결 설정\\n\\n1) Google Sheets를 “웹에 게시” 후, SHEET_ID를 assets/config.js에 붙여넣으세요.\\n  - 컬럼: category, level, type, q, choice1..4, answer(1~), explanation, image(선택), image_query(선택)\\n2) 상식 카테고리는 OpenTDB에서 자동 보충됩니다.');});

document.getElementById('startBtn').addEventListener('click',()=>{state.reviewMode=false;startQuiz();});
document.getElementById('btnReviewWrong').addEventListener('click',()=>{state.reviewMode=true;startQuiz();});
document.getElementById('btnReveal').addEventListener('click',()=>{const q=state.deck[state.idx];const nodes=$$('#choices .choice');nodes[q.answer]?.classList.add('correct');$('#feedback').textContent=q.explanation?`정답: ${q.choices[q.answer]} — ${q.explanation}`:`정답: ${q.choices[q.answer]}`;state.revealed=true;nodes.forEach(n=>n.disabled=true);stopTimer();});
document.getElementById('btnNext').addEventListener('click',()=>{if(state.idx<state.deck.length-1){state.idx++;renderQuestion();updateProgress();}else{showResult();}});
document.getElementById('btnRetry').addEventListener('click',startQuiz);
document.getElementById('btnHome').addEventListener('click',()=>{stopTimer();state.reviewMode=false;$('#result').classList.add('hidden');$('#idle').classList.remove('hidden');$('#progressBar')&&($('#progressBar').style.width='0%');$('#progressPct')&&($('#progressPct').textContent='0');});

function renderQuestion(){const q=state.deck[state.idx];tag(q.category);$('#tagLvl').textContent=`난이도 ${q.level}`;$('#qIndex').textContent=state.idx+1;$('#qText').textContent=q.q;const wrap=$('#qImageWrap');if(q.image){$('#qImage').src=q.image;wrap.classList.remove('hidden');}else{wrap.classList.add('hidden');}const box=$('#choices');box.innerHTML='';q.choices.forEach((c,i)=>{const btn=document.createElement('button');btn.className='choice';btn.innerHTML=`<span class="mr-2">${String.fromCharCode(65+i)}.</span> ${c}`;btn.addEventListener('click',()=>selectChoice(i));box.appendChild(btn);});$('#feedback').textContent='\\u00A0';state.revealed=false;startTimer();}
function selectChoice(i){if(state.revealed)return;stopTimer();const q=state.deck[state.idx];const nodes=$$('#choices .choice');nodes.forEach(n=>n.disabled=true);if(i===q.answer){nodes[i].classList.add('correct');$('#feedback').textContent='정답! 잘했어요 ✨';state.right++;state.streak++;awardSticker();}else{nodes[i].classList.add('wrong');nodes[q.answer]?.classList.add('correct');$('#feedback').textContent='아쉬워요! 다음 문제에 도전!';state.streak=0;storeWrong(q);}renderStats();state.revealed=true;updateProgress();}
function updateProgress(){const pct=Math.round((state.idx/Math.max(1,state.deck.length))*100);$('#progressBar')&&($('#progressBar').style.width=pct+'%');$('#progressPct')&&($('#progressPct').textContent=pct);}
function showResult(){stopTimer();$('#quiz').classList.add('hidden');$('#result').classList.remove('hidden');$('#scoreRight').textContent=state.right;$('#scoreTotal').textContent=state.deck.length;$('#scorePct').textContent=Math.round((state.right/state.deck.length)*100);}

// Deck picker mixes: Sheet → OpenTDB → Offline fallback
async function pickDeck(){
  const level=+$('#level').value;const n=+$('#numQ').value;
  if(state.reviewMode){ const wrongs=loadWrongs(); if(wrongs.length===0){ alert('오답노트가 비어 있어요. 먼저 일반 퀴즈를 풀어주세요.'); return []; } return wrongs.slice().sort(()=>Math.random()-0.5).slice(0,n); }
  const online = $('#useOnline').checked;
  const cats=selectedCats;
  let pool=[];
  if(online){
    try{ const s=await loadFromSheet(cats, level); pool=pool.concat(s); }catch(e){ console.warn('sheet error',e); }
    if(cats.has('상식')){ const t=await loadFromOpenTDB(30); pool=pool.concat(t); }
  }
  if(pool.length<n){ pool = pool.concat(offlineQuestions().filter(q=>cats.has(q.category)&&q.level<=level)); }
  if(pool.length===0){ alert('문제가 없습니다. 설정을 바꿔 보세요.'); return []; }
  // ensure images filled when missing
  pool.forEach(q=>{ if(!q.image) q.image=unsplashFor(q); });
  return sample(pool, Math.min(n, pool.length));
}

async function startQuiz(){
  const deck = await pickDeck();
  if(deck.length===0) return;
  Object.assign(state,{deck,idx:0,right:0,streak:0,revealed:false,sessionWrongs:[]});
  $('#qTotal').textContent=deck.length;$('#idle').classList.add('hidden');$('#result').classList.add('hidden');$('#quiz').classList.remove('hidden');renderQuestion();updateProgress();
}

function init(){
  document.documentElement.style.setProperty('--bg', themeMap[localStorage.getItem('theme')||'sky']);
  renderStats(); renderStickers();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
console.log('[KidsQuiz] v1.3.0 online loader ready');
