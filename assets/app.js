// Kids Quiz v1.2.2 — fix generateQuestions syntax + robust init
const themeMap={sky:'#f8fbff',forest:'#f6fff8',candy:'#fff7fb',space:'#f7f9ff',dino:'#fcfff6'};
const statsKey='kidquiz_stats_v1';
const stats=(()=>{let s={today:0,bestStreak:0,theme:localStorage.getItem('theme')||'sky'};try{s=Object.assign(s,JSON.parse(localStorage.getItem(statsKey)||'{}'));}catch{}function persist(){localStorage.setItem(statsKey,JSON.stringify(s));localStorage.setItem('theme',s.theme);}return{get:()=>s,incToday(){s.today++;persist();},setBest(n){if(n>s.bestStreak){s.bestStreak=n;persist();}},setTheme(t){s.theme=t;persist();}}})();
document.documentElement.style.setProperty('--bg',themeMap[stats.get().theme]||'#f8fbff');
document.addEventListener('click',ev=>{const t=ev.target.closest('button[data-theme]');if(!t)return;const th=t.dataset.theme;document.body.dataset.theme=th;document.documentElement.style.setProperty('--bg',themeMap[th]||'#f8fbff');stats.setTheme(th);});
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>Array.from(c.querySelectorAll(s));
const sample=(arr,n)=>arr.slice().sort(()=>Math.random()-0.5).slice(0,n);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function tagFor(cat){const el=document.createElement('span');el.className='tag';el.textContent=cat;if(cat==='국어')el.classList.add('tag-kr');if(cat==='수학')el.classList.add('tag-math');if(cat==='영어')el.classList.add('tag-en');if(cat==='상식')el.classList.add('tag-gk');return el;}
function confettiLite(){const c=document.createElement('div');c.className='fixed inset-0 pointer-events-none z-50';document.body.appendChild(c);const N=80;const colors=['#60a5fa','#34d399','#f472b6','#fbbf24','#a78bfa'];for(let i=0;i<N;i++){const p=document.createElement('div');p.style.position='absolute';p.style.left=Math.random()*100+'%';p.style.top='-10px';p.style.width='8px';p.style.height='14px';p.style.background=colors[(Math.random()*colors.length)|0];p.style.opacity='0.9';p.style.borderRadius='2px';p.style.transform=`rotate(${(Math.random()*60-30)|0}deg)`;p.style.transition='transform 1.2s linear, top 1.2s linear, opacity 1.2s';c.appendChild(p);requestAnimationFrame(()=>{p.style.top='110%';p.style.transform=`translateY(${(Math.random()*80+30)|0}vh) rotate(${(Math.random()*360)|0}deg)`;p.style.opacity='0.2';});}setTimeout(()=>c.remove(),1400);}
function confettiDino(){const layer=document.createElement('div');layer.className='dino-confetti';document.body.appendChild(layer);const imgs=['https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f43e.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9b4.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f995.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f996.svg'];const N=42;for(let i=0;i<N;i++){const img=document.createElement('img');img.src=imgs[i%imgs.length];img.style.left=Math.random()*100+'%';img.style.top='-10%';layer.appendChild(img);const dy=110+Math.random()*10;const dx=(Math.random()*40-20);const rot=(Math.random()*360)|0;requestAnimationFrame(()=>{img.style.transform=`translate(${dx}vw, ${dy}vh) rotate(${rot}deg) scale(${0.6+Math.random()*0.7})`;img.style.opacity='0';});}setTimeout(()=>layer.remove(),1300);}
const STICKERS=[{id:'dino1',name:'초식 공룡',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f995.svg'},{id:'dino2',name:'티라노',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f996.svg'},{id:'egg',name:'알',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f423.svg'},{id:'bone',name:'뼈',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f9b4.svg'},{id:'foot',name:'발자국',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f43e.svg'},{id:'leaf',name:'잎사귀',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f332.svg'},{id:'star',name:'별',url:'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f31f.svg'}];
const STK_KEY='kidquiz_stickers_v1';function getStickers(){try{return JSON.parse(localStorage.getItem(STK_KEY)||'[]')}catch{return[]}}function saveStickers(a){localStorage.setItem(STK_KEY,JSON.stringify(a));}
function renderStickers(){const grid=$('#stickerGrid');const owned=new Set(getStickers());grid.innerHTML='';$('#stickerTotal').textContent=STICKERS.length;$('#stickerCount').textContent=owned.size;STICKERS.forEach(s=>{const img=new Image();img.alt=s.name;img.title=owned.has(s.id)?s.name:`${s.name} (잠금)`;img.src=s.url;if(!owned.has(s.id))img.classList.add('sticker-locked');grid.appendChild(img);});}
function toastSticker(s){const wrap=document.createElement('div');wrap.className='sticker-toast';wrap.innerHTML=`<div class="sticker-badge"><img alt="sticker" src="${s.url}"/><span>스티커 획득! ${s.name}</span></div>`;document.body.appendChild(wrap);setTimeout(()=>wrap.remove(),1400);}
function awardSticker(){const owned=new Set(getStickers());if(owned.size===STICKERS.length)return;if(Math.random()<0.45){const c=STICKERS.filter(x=>!owned.has(x.id));if(c.length){const s=c[(Math.random()*c.length)|0];saveStickers([...owned,s.id]);renderStickers();toastSticker(s);}}}
const WRONGS_KEY='kidquiz_wrongs_v1';const loadWrongs=()=>{try{return JSON.parse(localStorage.getItem(WRONGS_KEY)||'[]')}catch{return[]}}, saveWrongs=(a)=>localStorage.setItem(WRONGS_KEY,JSON.stringify(a));
function generateQuestions(){
  const imagePool=['https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f34e.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f52e.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f436.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f984.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f332.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f31f.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f422.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4a1.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f955.svg','https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f41f.svg'];
  const out=[]; const cats=['국어','수학','영어','상식']; const counts={1:27,2:27,3:26};
  const pushQ=(o,expl,image)=>{ if(expl) o.explanation=expl; if(image) o.image=image; out.push(o); };
  const mc=(cat,level,i,q,choices,ans,expl,img)=>pushQ({id:`${cat[0]}${level}_${i}`,category:cat,level,type:'mcq',q,choices,answer:ans},expl,img);
  const tf=(cat,level,i,q,ok,expl,img)=>pushQ({id:`${cat[0]}${level}_tf_${i}`,category:cat,level,type:'tf',q,choices:['O','X'],answer:ok?0:1},expl,img);
  cats.forEach(cat=>{for(const level of[1,2,3]){for(let i=0;i<counts[level];i++){
    let img=(i%5===(cat==='국어'?0:cat==='수학'?1:cat==='영어'?2:3))? imagePool[(i*3+level)%imagePool.length]:undefined;
    if(cat==='국어'){
      if(level===1){
        const b=[
          ['다음 중 자음은?', ['ㅏ','ㅗ','ㅂ','ㅣ'],2,'ㅂ은 자음이에요.'],
          ['빈칸에 알맞은 말은? “하늘에서 비가 ___.”', ['와요','먹어요','웃어요','놀아요'],0],
          ['다음 중 동물 이름이 아닌 것은?', ['호랑이','사자','학교','토끼'],2],
          ['‘밝다’의 반댓말은?', ['어둡다','빠르다','길다','차갑다'],0],
          ['‘물고기’의 맞는 띄어쓰기는?', ['물 고기','물고기','물 고 기','무 르고기'],1],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      } else if(level===2){
        const b=[
          ['속담 ‘고래 싸움에 새우 등 터진다’의 뜻은?', ['강한 이들 싸움에 약한 이가 피해 본다','새우가 고래를 이긴다','고래는 새우를 좋아한다','고래 등이 딱딱하다'],0],
          ['맞는 표기는?', ['어린이 집','어린 이집','어린이집','어 린이집'],2],
          ['의성어는 무엇?', ['졸졸','예쁘다','활짝','크다'],0,'‘졸졸’은 물 흐르는 소리를 흉내 낸 말이에요.'],
          ['다음 중 뜻이 가장 다른 것은? ‘산’', ['높이 솟은 땅','많이 쌓인 더미','힘든 일','바다 위 배'],3],
          ['다음 중 띄어쓰기가 맞는 것은?', ['초 등학교','초등학교','초등 학 교','초 등 학교'],1],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      } else {
        const b=[
          ['다음 중 비유적 표현이 들어간 문장은?', ['바람이 분다','마음이 얼음처럼 차갑다','비가 온다','하늘이 맑다'],1],
          ['‘감쪽같이’의 뜻과 가까운 것은?', ['아주 티 나게','매우 어색하게','아주 깔끔하게 속여서','느릿느릿하게'],2],
          ['다음 중 맞는 맞춤법은?', ['옷이 맞아요','옷이 맛아요','옷이 맛아요?','옷이 맟아요'],0],
          ['다음 중 속담이 아닌 것은?', ['호랑이 굴에 가야 호랑이를 잡는다','티끌 모아 태산','바위가 밥을 먹는다','돌다리도 두들겨 보고 건너라'],2],
          ['문장의 종류로 알맞지 않은 것은?', ['평서문','감탄문','명령문','계산문'],3],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      }
    } else if(cat==='수학'){
      if(level===1){
        const a=1+((i*3)%9), b=1+((i*5)%9);
        if(i%2===0){ const ans=a+b; mc(cat,level,i,`${a} + ${b} = ?`,[String(ans-1),String(ans),String(ans+1),String(ans+2)],1,undefined,img); }
        else { const a2=a+b; mc(cat,level,i,`${a2} - ${a} = ?`,[String(b-1),String(b),String(b+1),String(b+2)],1,undefined,img); }
      } else if(level===2){
        const b=[
          ['가장 큰 수는?', ['203','230','032','123'],1],
          ['삼각형의 변은 몇 개?', ['2','3','4','5'],1],
          ['짝수는?', ['11','13','16','17'],2],
          ['한 시간은 몇 분?', ['30','60','90','120'],1],
          ['직사각형의 꼭짓점 개수는?', ['2','3','4','8'],2],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      } else {
        const A=10+(i%21), B=1+(i%9); const add=i%3===0; const q= add?`${A} + ${B} = ?`:`${A} - ${B} = ?`; const ans= add?A+B:A-B; mc(cat,level,i,q,[String(ans-2),String(ans-1),String(ans),String(ans+1)],2,undefined,img);
      }
    } else if(cat==='영어'){
      if(level===1){
        const b=[
          ['“사과”는 영어로?', ['banana','apple','grape','peach'],1],
          ['인사말로 알맞은 것은?', ['Hello','See you (인사 시작)','Sorry','Good night(낮 인사)'],0],
          ['“물”은?', ['milk','water','juice','tea'],1],
          ['“빵”은?', ['bread','rice','noodle','soup'],0],
          ['“강아지”는?', ['cat','dog','bird','fish'],1],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      } else if(level===2){
        const b=[
          ['색깔 ‘파랑’은?', ['blue','red','green','yellow'],0],
          ['‘학교’는?', ['school','home','park','store'],0],
          ['‘책’은?', ['desk','book','bag','pen'],1],
          ['숫자 8은?', ['one','five','eight','ten'],2],
          ['‘의자’는?', ['table','chair','window','door'],1],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      } else {
        const b=[
          ['“How are you?”에 맞는 대답은?', ['I am fine.','I am apple.','Open the door.','See you!'],0],
          ['다음 대화에 이어질 말은? A: Thank you. B: ___', ['Good bye.','You’re welcome.','I am fine.','OK.'],1],
          ['그림(shadow)과 관련 없는 것은?', ['dark','light','cat','sun'],2,'cat은 그림자와 직접 관련이 없어요.'],
          ['다음 중 명사인 것은?', ['run','blue','book','fast'],2],
          ['다음 중 동사가 맞는 것은?', ['sleep','green','bag','happy'],0],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      }
    } else if(cat==='상식'){
      if(level===1){
        if(i%4===0){ tf(cat,level,i,'“사과”는 과일이다.',true,undefined,img); }
        const b=[
          ['태양은 어떤 것일까요?', ['별','행성','달','돌'],0],
          ['비 온 뒤 하늘에 보이는 일곱 색은?', ['무지개','번개','폭풍','구름'],0],
          ['아침에 해가 뜨는 방향은?', ['동쪽','서쪽','남쪽','북쪽'],0],
          ['다음 중 날 수 있는 동물은?', ['펭귄','닭','독수리','타조'],2],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      } else if(level===2){
        const b=[
          ['우리 몸에서 피를 보내는 기관은?', ['간','심장','위','폐'],1],
          ['쓰레기를 줄이는 방법이 아닌 것은?', ['재활용','다회용 사용','아무 데나 버리기','필요한 것만 사기'],2],
          ['나침반은 어느 쪽을 가리키나요?', ['남쪽','동쪽','북쪽','서쪽'],2],
          ['바닷물은 어떤 맛일까요?', ['달다','맵다','짜다','맛이 없다'],2],
          ['식물의 뿌리는 주로 무엇을 하나요?', ['햇빛 만들기','물과 양분 흡수','소리 듣기','열 만들기'],1],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      } else {
        const b=[
          ['지구에서 가장 큰 바다는?', ['태평양','대서양','인도양','북극해'],0],
          ['기온을 재는 도구는?', ['저울','온도계','줄자','망원경'],1],
          ['구름이 모여 비가 오기 쉬운 하늘은?', ['맑은 하늘','짙은 회색 구름','햇살 가득','무지개'],1],
          ['바람이 매우 세게 부는 현상은?', ['빗방울','태풍','이슬','안개'],1],
          ['밤하늘에서 북쪽을 찾을 때 도움 되는 별은?', ['북극성','금성','목성','달'],0],
        ]; const a=b[i%b.length]; mc(cat,level,i,a[0],a[1],a[2],a[3],img);
      }
    }
  }}});
  const want=Math.round(out.length*0.2), has=out.filter(q=>q.image).length;
  if(has<want){ const idxs=out.map((_,i)=>i).filter(i=>!out[i].image); for(let k=0;k<want-has && k<idxs.length;k++){ out[idxs[k]].image=imagePool[k%imagePool.length]; } }
  if(has>want){ const idxs=out.map((_,i)=>i).filter(i=>out[i].image); for(let k=0;k<has-want && k<idxs.length;k++){ delete out[idxs[k]].image; } }
  return out;
}
const LS_KEY='kidquiz_custom_questions_v1';const loadCustom=()=>{try{return JSON.parse(localStorage.getItem(LS_KEY)||'[]')}catch{return[]}}, saveCustom=(a)=>localStorage.setItem(LS_KEY,JSON.stringify(a));
const state={deck:[],idx:0,right:0,streak:0,revealed:false,reviewMode:false,sessionWrongs:[],timer:0,timerId:null};
function stopTimer(){if(state.timerId){clearInterval(state.timerId);state.timerId=null;}}
function startTimer(){stopTimer();const secs=+$('#timerSelect').value;const badge=$('#timerBadge');if(!secs||secs<=0){badge.classList.add('hidden');return;}state.timer=secs;badge.classList.remove('hidden');$('#timerText').textContent=state.timer+'s';state.timerId=setInterval(()=>{state.timer--;$('#timerText').textContent=Math.max(0,state.timer)+'s';if(state.timer<=0){stopTimer();const nodes=$$('#choices .choice');nodes.forEach(n=>n.disabled=true);const q=state.deck[state.idx];nodes[q.answer]?.classList.add('correct');$('#feedback').textContent='시간 초과! 정답: '+q.choices[q.answer];storeWrong(q);state.revealed=true;updateProgress();setTimeout(()=>{if(state.idx<state.deck.length-1){state.idx++;renderQuestion();updateProgress();}else{showResult();}},900);}},1000);}
function storeWrong(q){if(!state.sessionWrongs.some(w=>w.id===q.id))state.sessionWrongs.push(q);}
const numQ=$('#numQ'), numQVal=$('#numQVal');numQ.addEventListener('input',()=>numQVal.textContent=numQ.value);
let selectedCats=new Set(['국어']);$$('.cat').forEach(b=>{const update=()=>{if(selectedCats.has(b.dataset.cat)){b.classList.add('ring-2','ring-offset-2');}else{b.classList.remove('ring-2','ring-offset-2');}};b.addEventListener('click',()=>{if(selectedCats.has(b.dataset.cat))selectedCats.delete(b.dataset.cat);else selectedCats.add(b.dataset.cat);if(selectedCats.size===0)selectedCats.add(b.dataset.cat);update();});update();});
function renderStats(){$('#todayCount')&&($('#todayCount').textContent=stats.get().today);$('#bestStreak')&&($('#bestStreak').textContent=stats.get().bestStreak);}
renderStats();renderStickers();
function pickDeck(){const level=+$('#level').value;const n=+$('#numQ').value;if(state.reviewMode){const wrongs=loadWrongs();if(wrongs.length===0){alert('오답노트가 비어 있어요. 먼저 일반 퀴즈를 풀어주세요.');return [];}return wrongs.slice().sort(()=>Math.random()-0.5).slice(0,n);}else{const mix=$('#mixCats').checked;let pool=[...generateQuestions(),...loadCustom()].filter(q=>selectedCats.has(q.category)&&q.level<=level);if(!mix){const c=Array.from(selectedCats)[0];pool=pool.filter(q=>q.category===c);}if(pool.length===0){alert('해당 조건의 문제가 없습니다.');return [];}return sample(pool,Math.min(n,pool.length));}}
function startQuiz(){const deck=pickDeck();if(deck.length===0)return;stopTimer();Object.assign(state,{deck,idx:0,right:0,streak:0,revealed:false,sessionWrongs:[]});$('#qTotal').textContent=deck.length;$('#idle').classList.add('hidden');$('#result').classList.add('hidden');$('#quiz').classList.remove('hidden');renderQuestion();updateProgress();}
function bindUI(){document.getElementById('startBtn').addEventListener('click',()=>{state.reviewMode=false;startQuiz();});document.getElementById('btnReviewWrong').addEventListener('click',()=>{state.reviewMode=true;startQuiz();});document.getElementById('btnReveal').addEventListener('click',()=>{const q=state.deck[state.idx];const nodes=$$('#choices .choice');nodes[q.answer]?.classList.add('correct');$('#feedback').textContent=q.explanation?`정답: ${q.choices[q.answer]} — ${q.explanation}`:`정답: ${q.choices[q.answer]}`;state.revealed=true;nodes.forEach(n=>n.disabled=true);stopTimer();});document.getElementById('btnNext').addEventListener('click',()=>{if(state.idx<state.deck.length-1){state.idx++;renderQuestion();updateProgress();}else{showResult();}});document.getElementById('btnRetry').addEventListener('click',startQuiz);document.getElementById('btnHome').addEventListener('click',()=>{stopTimer();state.reviewMode=false;$('#result').classList.add('hidden');$('#idle').classList.remove('hidden');$('#progressBar')&&($('#progressBar').style.width='0%');$('#progressPct')&&($('#progressPct').textContent='0');});}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',bindUI);}else{bindUI();}
function renderQuestion(){const q=state.deck[state.idx];const tag=tagFor(q.category);tag.id='tagCat';$('#tagCat').replaceWith(tag);$('#tagLvl').textContent=`난이도 ${q.level}`;$('#qIndex').textContent=state.idx+1;$('#qText').textContent=q.q;const wrap=$('#qImageWrap');if(q.image){$('#qImage').src=q.image;wrap.classList.remove('hidden');}else{wrap.classList.add('hidden');}const box=$('#choices');box.innerHTML='';q.choices.forEach((c,i)=>{const btn=document.createElement('button');btn.className='choice';btn.innerHTML=`<span class="mr-2">${String.fromCharCode(65+i)}.</span> ${c}`;btn.addEventListener('click',()=>selectChoice(i));box.appendChild(btn);});$('#feedback').textContent='\\u00A0';state.revealed=false;startTimer();}
function selectChoice(i){if(state.revealed)return;stopTimer();const q=state.deck[state.idx];const nodes=$$('#choices .choice');nodes.forEach(n=>n.disabled=true);if(i===q.answer){nodes[i].classList.add('correct');$('#feedback').textContent='정답! 잘했어요 ✨';state.right++;state.streak++;stats.incToday();stats.setBest(state.streak);confettiDino();awardSticker();}else{nodes[i].classList.add('wrong');nodes[q.answer]?.classList.add('correct');$('#feedback').textContent='아쉬워요! 다음 문제에 도전!';state.streak=0;storeWrong(q);}renderStats();state.revealed=true;updateProgress();}
function updateProgress(){const pct=Math.round((state.idx/Math.max(1,state.deck.length))*100);$('#progressBar')&&($('#progressBar').style.width=pct+'%');$('#progressPct')&&($('#progressPct').textContent=pct);}
function showResult(){stopTimer();$('#quiz').classList.add('hidden');$('#result').classList.remove('hidden');$('#scoreRight').textContent=state.right;$('#scoreTotal').textContent=state.deck.length;$('#scorePct').textContent=Math.round((state.right/state.deck.length)*100);confettiLite();const existing=loadWrongs();const map=new Map(existing.map(x=>[x.id,x]));state.sessionWrongs.forEach(w=>{if(!map.has(w.id))map.set(w.id,w);});saveWrongs(Array.from(map.values()));state.sessionWrongs=[];renderStats();}
console.log('[KidsQuiz] v1.2.2 loaded');