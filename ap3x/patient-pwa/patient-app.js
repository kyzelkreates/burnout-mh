/* ═══════════════════════════════════════════════════════
   FOUR PAWS TRAINING COMPANION — Portal App JS
   Portal home + slide-up screens + dog onboarding
════════════════════════════════════════════════════════ */
'use strict';

// ── Helpers ───────────────────────────────────────────
function $ (id)  { return document.getElementById(id); }
function qs(s)   { return document.querySelector(s); }
function qsa(s)  { return document.querySelectorAll(s); }
function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function load(k,d){ try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):d; }catch(e){ return d; } }

// ── Curriculum ────────────────────────────────────────
const CURRICULUM = [
  { id:1, name:'Module 1 — Foundations', emoji:'🌱', xp:500, lessons:[
    {id:'l1_1',name:'Understanding Puppy Psychology',   desc:'How dogs learn, critical periods and building trust',              tip:'Puppies learn through association — make every interaction positive.', xp:50},
    {id:'l1_2',name:'Marker Word Training',             desc:'Introducing the clicker or verbal marker cue',                   tip:'Your marker word must always be followed by a reward — no exceptions.', xp:50},
    {id:'l1_3',name:'Focus & Attention Building',       desc:'Teaching your dog to check in with you voluntarily',             tip:'Reward every eye contact your dog offers. Capture it, don\'t prompt it.', xp:60},
    {id:'l1_4',name:'Reward Timing Fundamentals',       desc:'Mark the exact moment of the behaviour you want',                tip:'The reward must land within 1.5 seconds of the behaviour.', xp:60},
    {id:'l1_5',name:'Calmness Foundations',             desc:'Building a settle cue and reducing arousal at home',             tip:'Reward any moment of stillness — even accidental.', xp:80},
  ]},
  { id:2, name:'Module 2 — Core Obedience', emoji:'🎯', xp:600, lessons:[
    {id:'l2_1',name:'Sit & Down Reliability',           desc:'Building 20+ successful reps in multiple environments',          tip:'A reliable sit means 9/10 responses anywhere before moving on.', xp:60},
    {id:'l2_2',name:'Recall Foundations',               desc:'Building "come" as the most rewarding thing in the world',       tip:'Never call your dog to something unpleasant. Protect that recall cue.', xp:80},
    {id:'l2_3',name:'Loose Lead Walking',               desc:'Teaching your dog that a loose lead keeps the walk going',       tip:'Reward placement matters — treat at your hip, not out front.', xp:80},
    {id:'l2_4',name:'Calm Door Behaviour',              desc:'No rushing, no jumping — a controlled exit routine',             tip:'Your dog only gets what they want when all four paws are on the floor.', xp:60},
    {id:'l2_5',name:'Polite Greeting Skills',           desc:'Four paws on the floor when meeting people and dogs',            tip:'End the greeting the moment jumping begins.', xp:70},
  ]},
  { id:3, name:'Module 3 — Socialisation', emoji:'🌍', xp:700, lessons:[
    {id:'l3_1',name:'Environmental Confidence',         desc:'Exposing your dog to novel sounds, surfaces and environments',   tip:'Never force interaction. Let your dog choose to approach.', xp:70},
    {id:'l3_2',name:'Positive Social Exposure',         desc:'Structured introductions to other dogs and people',             tip:'One calm positive interaction beats 20 chaotic ones.', xp:80},
    {id:'l3_3',name:'Reducing Overstimulation',         desc:'Managing and lowering arousal in high-distraction environments', tip:'A sniff walk is the best pre-session warm-up.', xp:80},
    {id:'l3_4',name:'New Experience Handling',          desc:'Vets, groomers, car travel — positive conditioning',            tip:'Work at the lowest intensity your dog is comfortable with.', xp:70},
    {id:'l3_5',name:'Confidence Building Games',        desc:'Wobble boards, novel objects and exploration games',             tip:'Reward every moment of brave investigation, no matter how small.', xp:80},
  ]},
  { id:4, name:'Module 4 — Home Life', emoji:'🏠', xp:650, lessons:[
    {id:'l4_1',name:'Toilet Training System',           desc:'A consistent routine that ends accidents fast',                  tip:'Take outside every 45 mins, after every meal, sleep and play.', xp:60},
    {id:'l4_2',name:'Crate Confidence',                 desc:'Building a safe, voluntary retreat your dog loves',             tip:'Never lock the crate until your dog enters willingly.', xp:70},
    {id:'l4_3',name:'Alone Time Training',              desc:'Preventing separation distress through gradual independence',    tip:'Start with 10 seconds. Build to 5 mins before increasing to 15.', xp:80},
    {id:'l4_4',name:'Reducing Destructive Behaviour',   desc:'Management, enrichment and appropriate outlets',                tip:'Management first — remove the opportunity. Then provide a better alternative.', xp:70},
    {id:'l4_5',name:'Calm Household Behaviour',         desc:'Settle on mat, calm greetings and relaxed mealtimes',          tip:'Reward all calm moments — even accidental ones.', xp:70},
  ]},
  { id:5, name:'Module 5 — Enrichment & Development', emoji:'🧩', xp:800, lessons:[
    {id:'l5_1',name:'Mental Stimulation Games',         desc:'Puzzle feeders, snuffle mats and problem-solving',              tip:'10 mins of mental work beats 30 mins of walking.', xp:80},
    {id:'l5_2',name:'Structured Play Systems',          desc:'Using play as reinforcement — tug, chase and retrieve',         tip:'Make yourself more fun than the environment.', xp:80},
    {id:'l5_3',name:'Scent Work Foundations',           desc:'Introducing nose work games and hide-and-seek',                 tip:'A dog who sniffs is a calm and happy dog.', xp:90},
    {id:'l5_4',name:'Long-Term Habit Reinforcement',    desc:'Maintaining skills under distraction, distance and duration',  tip:'The 3 Ds: duration, distance, distraction — only work on one at a time.', xp:80},
    {id:'l5_5',name:'Advanced Enrichment Planning',     desc:'Designing a weekly enrichment schedule for your dog',          tip:'Aim for: 1 scent, 1 puzzle, 1 confidence, 1 play every 48 hours.', xp:90},
  ]},
];

// ── Enrichment ────────────────────────────────────────
const ENRICHMENT = [
  {id:'sniff',   cat:'scent',      icon:'👃', name:'Sniff Walk Timer',      desc:'Let your dog lead and sniff freely on a long lead',  time:'10 min', level:'Beginner',     tip:'Sniffing is 40× more tiring than walking.',  phases:[{l:'Walk & sniff freely',d:60,c:'inhale'},{l:'Pause & jackpot!',d:5,c:'exhale'}], cycles:4},
  {id:'scatter', cat:'scent',      icon:'🌿', name:'Scatter Feeding',        desc:'Scatter kibble in grass — activates nose instinct',  time:'5 min',  level:'Beginner',     tip:'Use meal kibble. Slows eating, reduces stress.', phases:[{l:'Scatter kibble in grass',d:10,c:'hold'},{l:'Let them search!',d:60,c:'inhale'},{l:'Jackpot last piece',d:5,c:'exhale'}], cycles:2},
  {id:'muffin',  cat:'puzzle',     icon:'🧁', name:'Muffin Tin Game',        desc:'Hide treats under tennis balls in a tin',            time:'5 min',  level:'Beginner',     tip:'Start with all cups visible, then hide some empty.', phases:[{l:'Hide treats under balls',d:10,c:'hold'},{l:'Release — let them find!',d:30,c:'inhale'},{l:'Jackpot the find!',d:5,c:'exhale'}], cycles:3},
  {id:'lickmat', cat:'calm',       icon:'😋', name:'Lick Mat Calm-Down',     desc:'Spread food paste — promotes calm licking',          time:'10 min', level:'Beginner',     tip:'Licking releases serotonin. Use before training.', phases:[{l:'Dog licking calmly',d:120,c:'inhale'},{l:'Refill if needed',d:10,c:'hold'}], cycles:2},
  {id:'kong',    cat:'calm',       icon:'❄️', name:'Frozen Kong',            desc:'Stuff and freeze for extended mental stimulation',    time:'2 min',  level:'Beginner',     tip:'Freeze 2+ hours. Perfect for alone time.', instant:'❄️ Stuff your Kong now and pop it in the freezer for 2+ hours!'},
  {id:'tug',     cat:'play',       icon:'🪢', name:'Structured Tug Play',    desc:'Controlled tug builds drive and impulse control',    time:'5 min',  level:'Intermediate', tip:'Always end with you holding the toy.', phases:[{l:'Offer the tug toy',d:5,c:'inhale'},{l:'Active tug!',d:8,c:'inhale'},{l:'"Drop it" cue',d:3,c:'hold'},{l:'Reward & reset',d:5,c:'exhale'}], cycles:4},
  {id:'boxes',   cat:'confidence', icon:'📦', name:'Confidence Box Game',    desc:'Novel objects on ground — explore and reward',       time:'8 min',  level:'Intermediate', tip:'Never force interaction. Jackpot all brave moments.', phases:[{l:'Place object on floor',d:5,c:'hold'},{l:'Let dog investigate freely',d:15,c:'inhale'},{l:'Jackpot any contact!',d:5,c:'exhale'}], cycles:3},
  {id:'wobble',  cat:'confidence', icon:'🪨', name:'Wobble Board',           desc:'Build body awareness on unstable surfaces',          time:'8 min',  level:'Advanced',     tip:'Start flat, not wobbling. Reward 4 paws on.', phases:[{l:'Lure all 4 paws on board',d:10,c:'hold'},{l:'Jackpot stillness',d:5,c:'exhale'},{l:'Gentle wobble',d:8,c:'inhale'},{l:'Reward calm!',d:5,c:'exhale'}], cycles:3},
  {id:'snuffle', cat:'scent',      icon:'🌀', name:'Snuffle Mat Feeding',    desc:'Feed entire meal through a snuffle mat',             time:'5 min',  level:'Beginner',     tip:'Jackpot when they persist past frustration.', phases:[{l:'Spread food in mat',d:10,c:'hold'},{l:'Let them snuffle!',d:60,c:'inhale'},{l:'Reward persistence',d:5,c:'exhale'}], cycles:2},
  {id:'flirt',   cat:'play',       icon:'🎣', name:'Flirt Pole Chase',       desc:'Physical exercise + impulse control',                time:'5 min',  level:'Intermediate', tip:'Short bursts only. Stop before they lose impulse control.', instant:'🎣 Move the flirt pole in 5–8 sec bursts. Stop before your dog loses impulse control. Reward calm stops!'},
];

// ── Tips (personalised below) ─────────────────────────
const TIPS = [
  'Short, frequent sessions (5 min × 3) beat one long 30-minute session every time.',
  'Always end on a success — even a simple sit. It leaves your dog feeling confident.',
  'Your dog reads your energy. Calm owner = calm dog. Take a breath before you start.',
  'Jackpot rewards (5–10 treats) on brilliant moments teach your dog they absolutely nailed it.',
  'Sniffing is 40× more mentally tiring than walking. A sniff walk is a full brain workout.',
  'Luring is fine to start — fade the food lure by rep 5 so the dog learns the cue.',
  'Never call your dog to something unpleasant — protect that recall cue with your life.',
  'Enrichment before training = a calmer, more focused dog. Scatter feeding works brilliantly.',
  'If your dog doesn\'t respond in 3 seconds, reset and try in an easier environment.',
  'Consistency beats intensity. 5 minutes every day beats 2 hours on a Sunday.',
  'Confidence is built one tiny brave step at a time. Never rush socialisation.',
  'A tired dog is not a trained dog — mental exercise creates the calmest, most biddable dog.',
];

// ── AI responses ──────────────────────────────────────
const AI_RESP = {
  'ankle biting':  'Ankle biting is play/mouthing behaviour. Yelp, freeze and turn away immediately. Offer a tug toy or chew as redirect. Every person in the household must respond the same way.',
  'barking':       'Barking at visitors: manage first (baby gate), teach a "go to mat" behaviour, then desensitise the doorbell from a distance. Never greet visitors until your dog is calm.',
  'recall':        'Build a "recall bank" — 20+ rewarded recalls daily in low-distraction environments before proofing outside. Jackpot every single return. Never call your dog to anything unpleasant.',
  'enrichment':    'Today: scatter feeding at breakfast, lick mat before training, and a 10-minute sniff walk. These build focus, lower arousal and improve recall motivation.',
  'crate':         'Crate training fails when you go too fast. Start with door open, feed all meals inside. Only close once your dog enters willingly. Build in 10-second increments.',
  'pulling':       'Reward at your hip, not out front. Use high-value treats. Reward every 3–5 steps without tension. Stop the instant the lead tightens.',
  'confidence':    'Confidence builds one tiny brave step at a time. Novel objects — your dog chooses to approach. Never force. Jackpot all brave investigative behaviour.',
  'biting':        'Puppy biting: yelp, freeze, turn away. Redirect to a chew or tug. Reward gentle mouth. Ensure 16–18 hours sleep daily — tiredness dramatically increases biting.',
  'socialisation': 'Quality over quantity. Watch body language — lip licking, yawning, looking away all mean stress. Give space and reward all calm behaviour.',
  'focus':         'Reward check-ins — every time your dog glances at you voluntarily, mark and reward. Work in boring environments first.',
  'sit':           'For a reliable sit: 20+ reps in different locations. Fade the lure by rep 5. Proof garden → street → park. 9/10 response rate before moving on.',
  'stay':          'Build stay with 3 Ds: duration first, then distance, then distraction. Only ONE D at a time. Never leave on a failed stay.',
  'toilet':        'Take outside every 45 minutes, after every meal, sleep and play session. Use a specific toilet cue word, mark and jackpot the moment they go. No punishment for accidents.',
  'jumping':       'Turn away the instant four paws leave the floor. Reward all four-on-the-floor. Ask every visitor to do the same — consistency is everything.',
  'separation':    'Start with 10 seconds of alone time behind a closed door. Build in tiny increments. Never leave on a cry. Frozen Kongs and lick mats help massively.',
  'reactivity':    'Work below threshold — the distance at which your dog notices but stays calm. Build a "look at that" game. Counter-condition the trigger before trying to walk past it.',
};

const QUICK_TOPICS = [
  'How do I stop ankle biting?',
  'Why is recall breaking down outside?',
  'What enrichment should I do today?',
  'How do I build crate confidence?',
  'How do I stop lead pulling?',
  'How do I stop my dog jumping up?',
  'Tips for toilet training?',
  'How do I teach a reliable stay?',
];

// ── App state ─────────────────────────────────────────
const APP = {
  get sessions()           { return load('fp_sessions', []); },
  get completedLessons()   { return load('fp_lessons', []); },
  get completedActivities(){ return load('fp_acts', []); },
  get streak()             { return load('fp_streak', 0); },
  get xp()                 { return load('fp_xp', 0); },
  // Dog profile
  get dogName()   { return load('fp_dog_name', 'Your Dog'); },
  get dogBreed()  { return load('fp_dog_breed', ''); },
  get dogAge()    { return load('fp_dog_age', ''); },
  get ownerName() { return load('fp_owner_name', ''); },
  get goals()     { return load('fp_goals', []); },
  get experience(){ return load('fp_exp', 'new'); },
  get onboarded() { return load('fp_onboarded', false); },
  addLesson(id) { const a=this.completedLessons; if(!a.includes(id)){a.push(id);save('fp_lessons',a);return true;}return false; },
  removeLesson(id){ save('fp_lessons',this.completedLessons.filter(x=>x!==id)); },
  addActivity(id){ const a=this.completedActivities; if(!a.includes(id)){a.push(id);save('fp_acts',a);return true;}return false; },
  addSession(s){ const a=this.sessions; a.unshift(s); save('fp_sessions',a); },
  get dailyTasks(){ return load('fp_tasks_'+new Date().toDateString(),[false,false,false]); },
  saveTask(i,v){ const t=this.dailyTasks; t[i]=v; save('fp_tasks_'+new Date().toDateString(),t); },
};

// Seed demo data once
(function seed(){
  if(load('fp_seeded2',false)) return;
  const now=Date.now(), D=86400000;
  save('fp_sessions',[
    {date:now-D*13,score:5,skills:['Recall','Sit / Down'],mood:['Excitable / bouncy'],duration:8, note:'First session — very excited!'},
    {date:now-D*12,score:4,skills:['Sit / Down'],mood:['Easily distracted'],duration:6, note:'Sit getting more reliable'},
    {date:now-D*11,score:6,skills:['Recall','Focus'],mood:['Excitable / bouncy'],duration:10, note:'Recall in garden — 60% success'},
    {date:now-D*10,score:3,skills:['Loose lead'],mood:['Calm & relaxed'],duration:8, note:'Better lead walking!'},
    {date:now-D*9, score:4,skills:['Sit / Down','Stay'],mood:['Focused & engaged'],duration:10, note:'5-second stay achieved!'},
    {date:now-D*8, score:3,skills:['Recall','Polite greeting'],mood:['Calm & relaxed'],duration:12, note:'Lovely calm greeting'},
    {date:now-D*7, score:5,skills:['Loose lead'],mood:['Excitable / bouncy'],duration:8, note:'Tricky near other dogs'},
    {date:now-D*6, score:3,skills:['Recall','Sit / Down'],mood:['Focused & engaged'],duration:10, note:'Best recall session yet!'},
    {date:now-D*5, score:2,skills:['Confidence games','Enrichment'],mood:['Calm & relaxed'],duration:15, note:'Loved the muffin tin game'},
    {date:now-D*4, score:3,skills:['Stay','Polite greeting'],mood:['Focused & engaged'],duration:10, note:'10-second stay!'},
    {date:now-D*3, score:2,skills:['Recall','Loose lead'],mood:['Calm & relaxed'],duration:12, note:'Near-perfect park recall'},
    {date:now-D*2, score:3,skills:['Socialisation'],mood:['Calm & relaxed'],duration:15, note:'Met 3 new dogs calmly'},
    {date:now-D,   score:2,skills:['Recall','Stay'],mood:['Focused & engaged'],duration:12, note:'Everything clicking today'},
    {date:now-0.3*D,score:2,skills:['Confidence games'],mood:['Calm & relaxed'],duration:10, note:'Wobble board intro — loved it'},
  ]);
  save('fp_streak',7); save('fp_xp',680);
  save('fp_lessons',['l1_1','l1_2','l1_3','l1_4','l1_5','l2_1','l2_2']);
  // Demo dog profile
  if(!load('fp_onboarded',false)){
    save('fp_dog_name','Luna'); save('fp_dog_breed','Labrador Retriever');
    save('fp_dog_age','4–6 months'); save('fp_owner_name','Sarah');
    save('fp_goals',['Recall & coming when called','Loose lead walking','Stopping jumping up']);
    save('fp_exp','new'); save('fp_onboarded',true);
  }
  save('fp_seeded2',true);
})();

// ── Theme ─────────────────────────────────────────────
let isDark=load('fp_theme',false);
function applyTheme(){ document.body.className=isDark?'theme-dark':'theme-light'; const b=$('theme-toggle'); if(b) b.textContent=isDark?'☀️':'🌙'; }
function toggleTheme(){ isDark=!isDark; save('fp_theme',isDark); applyTheme(); }

function updateXP(){   const c=$('xp-chip'); if(c) c.textContent=`⚡ ${APP.xp} XP`; }
function updateStreak(){ const b=$('streak-banner'),t=$('streak-text'); if(!b) return; if(APP.streak>0){b.style.display='flex';t.textContent=`${APP.streak}-day training streak — keep it up!`;}else b.style.display='none'; }

// ── Toast ─────────────────────────────────────────────
let _tt;
function showToast(msg){ const old=$('fp-toast'); if(old) old.remove(); const t=document.createElement('div'); t.id='fp-toast'; t.className='fp-toast'; t.textContent=msg; document.body.appendChild(t); clearTimeout(_tt); _tt=setTimeout(()=>{if(t.parentNode)t.remove();},3000); }

// ══════════════════════════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════════════════════════
let obAge='8–16 weeks', obExp='new', obGoals=[];

function obNext(currentStep) {
  if(currentStep===1){
    obShowStep(2); return;
  }
  if(currentStep===2){
    const name=($('ob-dog-name').value||'').trim();
    if(!name){showToast('⚠️ Please enter your dog\'s name'); return;}
    obShowStep(3); return;
  }
  if(currentStep===3){
    if(obGoals.length===0){showToast('⚠️ Please select at least one goal'); return;}
    obShowStep(4); return;
  }
}
function obBack(step){ obShowStep(step-1); }
function obShowStep(n){
  qsa('.ob-step').forEach(s=>s.classList.remove('active'));
  const el=$('ob-step-'+n); if(el) el.classList.add('active');
  qs('.ob-inner').scrollTop=0;
}
function obSkip(){ finishOnboarding(); }
function obFinish(){
  // Save profile
  const name=($('ob-dog-name').value||'').trim()||'Your Dog';
  const breed=($('ob-breed').value||'').trim();
  const owner=($('ob-owner-name').value||'').trim();
  save('fp_dog_name', name); save('fp_dog_breed', breed);
  save('fp_dog_age', obAge); save('fp_owner_name', owner);
  save('fp_goals', obGoals); save('fp_exp', obExp);
  // Build summary
  const goals=obGoals.slice(0,3).join(', ')+(obGoals.length>3?` +${obGoals.length-3} more`:'');
  $('ob-summary').innerHTML=`
    <div class="ob-summary-row"><span class="ob-summary-key">Dog's name</span><span class="ob-summary-val">${name}</span></div>
    ${breed?`<div class="ob-summary-row"><span class="ob-summary-key">Breed</span><span class="ob-summary-val">${breed}</span></div>`:''}
    <div class="ob-summary-row"><span class="ob-summary-key">Age</span><span class="ob-summary-val">${obAge}</span></div>
    ${owner?`<div class="ob-summary-row"><span class="ob-summary-key">Owner</span><span class="ob-summary-val">${owner}</span></div>`:''}
    <div class="ob-summary-row"><span class="ob-summary-key">Goals</span><span class="ob-summary-val">${goals}</span></div>`;
  obShowStep(5);
  $('ob-launch-btn').onclick=()=>finishOnboarding();
}
function finishOnboarding(){
  save('fp_onboarded',true);
  $('onboarding').style.display='none';
  launchPortal();
}

function initOnboarding(){
  // Age buttons
  qsa('.ob-age-btn').forEach(b=>b.addEventListener('click',()=>{
    qsa('.ob-age-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); obAge=b.getAttribute('data-age');
  }));
  // Goal buttons
  qsa('.ob-goal-btn').forEach(b=>b.addEventListener('click',()=>{
    b.classList.toggle('active');
    const g=b.getAttribute('data-g');
    const i=obGoals.indexOf(g); i===-1?obGoals.push(g):obGoals.splice(i,1);
  }));
  // Exp buttons
  qsa('.ob-exp-btn').forEach(b=>b.addEventListener('click',()=>{
    qsa('.ob-exp-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); obExp=b.getAttribute('data-e');
  }));
}

// ══════════════════════════════════════════════════════
//  PORTAL HOME
// ══════════════════════════════════════════════════════
function launchPortal(){
  $('portal-root').style.display='block';
  applyTheme(); updateXP(); updateStreak();
  const tb=$('theme-toggle');
  if(tb && !tb._bound){ tb._bound=true; tb.addEventListener('click',toggleTheme); }
  renderPortal();
}

function renderPortal(){
  const h=new Date().getHours();
  const greeting=(h<12?'Good morning':h<17?'Good afternoon':'Good evening');
  const owner=APP.ownerName;
  $('hero-greeting').textContent = owner ? `${greeting}, ${owner} 👋` : `${greeting} 👋`;
  $('hero-dog-name').textContent = `${APP.dogName}'s Training Portal`;
  $('hero-sub').textContent = `${APP.dogBreed ? APP.dogBreed + ' · ' : ''}Building brilliant behaviour 🐕`;
  $('portal-brand-sub').textContent = `${APP.dogName}'s Companion`;

  // Dog chips
  const chips=[];
  if(APP.dogBreed) chips.push(APP.dogBreed);
  if(APP.dogAge)   chips.push(APP.dogAge);
  chips.push(`🔥 ${APP.streak} day streak`);
  $('hero-dog-chips').innerHTML=chips.map(c=>`<span class="hero-chip">${c}</span>`).join('');

  // Tile meta text
  const prog=getLessonProgress();
  const cur=getCurrentModule();
  const el=$('tile-course-meta'); if(el) el.textContent=`${prog.pct}% complete`;
  const el2=$('tile-progress-meta'); if(el2) el2.textContent=`${APP.sessions.length} sessions`;
  const el3=$('tile-coach-meta'); if(el3) el3.textContent=`Ask about ${APP.dogName}`;
  const tasks=APP.dailyTasks; const done=tasks.filter(Boolean).length;
  const el4=$('tile-today-meta'); if(el4) el4.textContent=`${done}/3 done today`;

  // Today snapshot strip
  const s=APP.sessions, total=s.length;
  const avg=total?(s.reduce((a,c)=>a+(10-c.score),0)/total).toFixed(1):'–';
  $('today-snapshot').innerHTML=`
    <div class="today-snap-card"><div class="tsn-val">${total}</div><div class="tsn-lbl">Sessions</div></div>
    <div class="today-snap-card"><div class="tsn-val">${avg}</div><div class="tsn-lbl">Avg Score</div></div>
    <div class="today-snap-card"><div class="tsn-val">🔥 ${APP.streak}</div><div class="tsn-lbl">Streak</div></div>
    <div class="today-snap-card"><div class="tsn-val">${prog.pct}%</div><div class="tsn-lbl">Course</div></div>
    <div class="today-snap-card"><div class="tsn-val">${APP.completedActivities.length}</div><div class="tsn-lbl">Enrichment</div></div>`;

  // Tip
  $('portal-tip-text').textContent=TIPS[new Date().getDate()%TIPS.length];

  // Goals
  const goals=APP.goals;
  $('goals-strip').innerHTML=goals.length
    ? goals.map(g=>`<span class="goal-chip">${g}</span>`).join('')
    : '<span class="goal-chip" style="opacity:.5">No goals set — tap ⚙️ to add</span>';

  // Log session sub-label
  const ls=$('log-sub'); if(ls) ls.textContent=`Record ${APP.dogName}'s session — your trainer sees this`;
  const ml=$('mood-label'); if(ml) ml.textContent=`How was ${APP.dogName}'s mood today?`;

  setTimeout(()=>renderPortalChart(), 80);
}

function renderPortalChart(){
  const c=$('portal-chart'); if(!c) return;
  const slice=APP.sessions.slice(0,7).reverse();
  const labels=slice.map(s=>['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(s.date).getDay()]);
  const data=slice.map(s=>10-(s.score||5));
  drawChart(c,labels,data,'#3a7d44','rgba(58,125,68,.14)',72);
}

// ══════════════════════════════════════════════════════
//  SCREEN SYSTEM
// ══════════════════════════════════════════════════════
let _currentScreen=null;
function openScreen(name){
  if(_currentScreen && _currentScreen!==name){
    const prev=$('screen-'+_currentScreen);
    if(prev){ prev.classList.remove('open'); prev.setAttribute('aria-hidden','true'); }
  }
  const el=$('screen-'+name); if(!el) return;
  el.classList.add('open'); el.setAttribute('aria-hidden','false');
  _currentScreen=name;
  const renders={courses:renderCourses,progress:renderProgress,enrichment:()=>renderEnrichment('all'),coach:initCoach,today:renderToday};
  if(renders[name]) renders[name]();
  if(name==='progress') setTimeout(()=>renderProgressChart('score'),80);
  if(name==='log') initLogForm();
}
function closeScreen(name){
  const el=$('screen-'+name); if(!el) return;
  el.classList.remove('open'); el.setAttribute('aria-hidden','true');
  _currentScreen=null;
}

// ══════════════════════════════════════════════════════
//  LOG SESSION
// ══════════════════════════════════════════════════════
let _score=null, _skills=[], _mood=[];
function initLogForm(){
  const scaleEl=$('score-scale');
  if(scaleEl && !scaleEl.childElementCount){
    for(let i=0;i<=10;i++){
      const b=document.createElement('button'); b.className='scale-btn'; b.textContent=i;
      b.addEventListener('click',()=>{
        qsa('#score-scale .scale-btn').forEach(x=>x.classList.remove('sel'));
        b.classList.add('sel'); _score=i;
        $('score-display').textContent=i;
        const ctx={0:'🌟 Perfect!',1:'🌟 Outstanding!',2:'✅ Brilliant',3:'✅ Great session',4:'🟡 Good effort',5:'🟡 Moderate',6:'🟠 Challenging',7:'🟠 Tough day',8:'🔴 Very hard',9:'🔴 Really tough',10:'🔴 Extremely difficult'};
        $('score-ctx').textContent=ctx[i]||'';
      });
      scaleEl.appendChild(b);
    }
  }
  qsa('#skills-tags .tag').forEach(t=>t.addEventListener('click',()=>{ t.classList.toggle('active'); const v=t.getAttribute('data-v'); const i=_skills.indexOf(v); i===-1?_skills.push(v):_skills.splice(i,1); }));
  qsa('#mood-tags .tag').forEach(t=>t.addEventListener('click',()=>{ t.classList.toggle('active'); const v=t.getAttribute('data-v'); const i=_mood.indexOf(v); i===-1?_mood.push(v):_mood.splice(i,1); }));
  const btn=$('submit-session');
  if(btn && !btn._bound){ btn._bound=true; btn.addEventListener('click',submitLog); }
}
function submitLog(){
  if(_score===null){showToast('⚠️ Please rate your session first');return;}
  const s=_score, lvl=s<=3?'low':s<=6?'mid':'high';
  const dog=APP.dogName;
  const msgs={low:`Brilliant session with ${dog}! 🌟 Short, consistent sessions like this build the best foundation.`,mid:`Good effort with ${dog}! Some challenges, but great persistence. Follow up with an enrichment activity.`,high:`Tough session — completely normal. Every dog has off days. Keep it short and always end on a win.`};
  const tips={low:'💡 Jackpot rewards (5–10 treats) on brilliant sessions signal to your dog they absolutely nailed it!',mid:'💡 Always end on something your dog can succeed at — even a simple sit restores confidence.',high:`💡 A 5-minute sniff walk on a long lead resets ${dog}'s arousal far better than drilling exercises again.`};
  const bgs={low:'#d1fae5',mid:'#fef3c7',high:'#fee2e2'};
  const cols={low:'#065f46',mid:'#92400e',high:'#991b1b'};
  const txts={low:`🌟 Excellent session with ${dog}`,mid:`✅ Good effort`,high:`💪 Tough one`};
  const badge=$('fb-badge'); badge.textContent=txts[lvl]; badge.style.background=bgs[lvl]; badge.style.color=cols[lvl];
  $('fb-msg').textContent=msgs[lvl]; $('fb-tip').textContent=tips[lvl];
  APP.addSession({date:Date.now(),score:s,skills:[..._skills],mood:[..._mood],duration:parseInt($('duration-input').value)||10,note:($('session-note').value||'').trim()});
  save('fp_xp',APP.xp+50); save('fp_streak',APP.streak+1);
  updateXP(); updateStreak();
  $('log-form-wrap').style.display='none'; $('log-feedback').style.display='block';
  showToast(`✅ ${dog}'s session saved! +50 XP 🔥`);
}
function resetLog(){
  _score=null; _skills=[]; _mood=[];
  qsa('#score-scale .scale-btn').forEach(b=>b.classList.remove('sel'));
  qsa('#skills-tags .tag,#mood-tags .tag').forEach(t=>t.classList.remove('active'));
  $('score-display').textContent='–'; $('score-ctx').textContent='';
  if($('duration-input')) $('duration-input').value='';
  if($('session-note')) $('session-note').value='';
  $('log-form-wrap').style.display='block'; $('log-feedback').style.display='none';
}

// ══════════════════════════════════════════════════════
//  COURSES
// ══════════════════════════════════════════════════════
function getLessonProgress(){
  const total=CURRICULUM.reduce((s,m)=>s+m.lessons.length,0);
  const done=APP.completedLessons.length;
  const modsDone=CURRICULUM.filter(m=>m.lessons.every(l=>APP.completedLessons.includes(l.id))).length;
  return {total,done,modsDone,pct:Math.round(done/total*100)};
}
function getCurrentModule(){ for(const m of CURRICULUM){if(!m.lessons.every(l=>APP.completedLessons.includes(l.id))) return m;} return CURRICULUM[CURRICULUM.length-1]; }

function renderCourses(){
  const prog=getLessonProgress(), cur=getCurrentModule(), dog=APP.dogName;
  $('course-hero-wrap').innerHTML=`
    <div class="course-hero-card">
      <div class="ch-title">🎓 ${dog}'s Puppy Masterclass</div>
      <div class="ch-sub">${prog.done} of ${prog.total} lessons complete · ${prog.modsDone} modules finished</div>
      <div class="ch-bar-track"><div class="ch-bar-fill" style="width:${prog.pct}%"></div></div>
      <div class="ch-stats">
        <div><div class="ch-sv">${prog.pct}%</div><div class="ch-sl">Complete</div></div>
        <div><div class="ch-sv">${prog.done}</div><div class="ch-sl">Lessons</div></div>
        <div><div class="ch-sv">${prog.modsDone}/5</div><div class="ch-sl">Modules</div></div>
      </div>
    </div>`;
  const list=$('modules-list'); list.innerHTML='';
  CURRICULUM.forEach(mod=>{
    const cl=APP.completedLessons;
    const doneCnt=mod.lessons.filter(l=>cl.includes(l.id)).length;
    const allDone=doneCnt===mod.lessons.length, isActive=mod.id===cur.id;
    const isLocked=!allDone&&!isActive&&mod.id>cur.id;
    const pct=Math.round(doneCnt/mod.lessons.length*100);
    const sc=allDone?'done':isActive?'current':'locked';
    const badge=allDone?'✅ Complete':isActive?'▶ In Progress':'🔒 Locked';
    const card=document.createElement('div');
    card.className='module-card'+(isActive||allDone?' open':'');
    card.innerHTML=`
      <div class="mod-header" onclick="this.closest('.module-card').classList.toggle('open')">
        <div class="mod-num ${sc}">${allDone?'✓':mod.id}</div>
        <div class="mod-info">
          <div class="mod-title">${mod.emoji} ${mod.name}</div>
          <div class="mod-meta">${doneCnt}/${mod.lessons.length} lessons · ${mod.xp} XP</div>
        </div>
        <span class="mod-status ${sc}">${badge}</span>
        <span class="mod-chevron">▼</span>
      </div>
      <div class="mod-prog-row">
        <div class="mod-prog-lbl">${pct}% complete</div>
        <div class="mod-bar-track"><div class="mod-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="mod-lessons">
        ${mod.lessons.map((l,li)=>{
          const done=cl.includes(l.id), isNext=!done&&li===doneCnt&&!isLocked;
          return `<div class="lesson-item" onclick="toggleLesson('${l.id}',${isLocked})">
            <div class="lesson-check ${done?'done':isNext?'next':''}">${done?'✓':isNext?'▶':''}</div>
            <div class="lesson-info">
              <div class="lesson-name ${done?'done':''}">${l.name}</div>
              <div class="lesson-desc">${l.desc}</div>
            </div>
            <span class="lesson-xp">+${l.xp} XP</span>
          </div>
          ${(done||isNext)?`<div class="lesson-tip">💡 ${l.tip}</div>`:''}`;
        }).join('')}
      </div>`;
    list.appendChild(card);
  });
}
function toggleLesson(id,locked){
  if(locked){showToast('🔒 Complete earlier modules first');return;}
  const done=APP.completedLessons.includes(id);
  if(done){ APP.removeLesson(id); const l=CURRICULUM.flatMap(m=>m.lessons).find(x=>x.id===id); if(l) save('fp_xp',Math.max(0,APP.xp-l.xp)); showToast('↩ Lesson marked incomplete'); }
  else { APP.addLesson(id); const l=CURRICULUM.flatMap(m=>m.lessons).find(x=>x.id===id); if(l){ save('fp_xp',APP.xp+l.xp); showToast(`🎉 Lesson complete! +${l.xp} XP`); const mod=CURRICULUM.find(m=>m.lessons.some(x=>x.id===id)); if(mod&&mod.lessons.every(x=>APP.completedLessons.includes(x.id))){ setTimeout(()=>showToast(`🏅 Module ${mod.id} done! +${mod.xp} bonus XP 🎉`),1200); save('fp_xp',APP.xp+mod.xp); } } }
  updateXP(); renderCourses();
}

// ══════════════════════════════════════════════════════
//  PROGRESS
// ══════════════════════════════════════════════════════
function getMilestones(){
  const s=APP.sessions, dog=APP.dogName;
  return [
    {icon:'🎉',label:`First session logged with ${dog}`,             unlocked:s.length>=1,   xp:50 },
    {icon:'🔥',label:'3-day training streak',                        unlocked:APP.streak>=3, xp:100},
    {icon:'🌟',label:'7-day training streak',                        unlocked:APP.streak>=7, xp:200},
    {icon:'📋',label:'10 sessions completed',                        unlocked:s.length>=10,  xp:150},
    {icon:'📣',label:`${dog} practised recall`,                      unlocked:s.some(x=>(x.skills||[]).includes('Recall')), xp:100},
    {icon:'⏸',label:`${dog} practised stay`,                        unlocked:s.some(x=>(x.skills||[]).includes('Stay')), xp:100},
    {icon:'🎓',label:'Module 1 — Foundations complete',              unlocked:CURRICULUM[0].lessons.every(l=>APP.completedLessons.includes(l.id)), xp:500},
    {icon:'🏅',label:'Module 2 — Core Obedience complete',          unlocked:CURRICULUM[1].lessons.every(l=>APP.completedLessons.includes(l.id)), xp:600},
    {icon:'🧩',label:'Enrichment activity completed',                unlocked:APP.completedActivities.length>=1, xp:50 },
    {icon:'🌱',label:'5 different skills practised',                  unlocked:new Set(s.flatMap(x=>x.skills||[])).size>=5, xp:200},
    {icon:'🏆',label:'25 sessions logged',                           unlocked:s.length>=25,  xp:500},
  ];
}
function renderProgress(){
  const sessions=APP.sessions, total=sessions.length, prog=getLessonProgress();
  const avg=total?(sessions.reduce((s,c)=>s+(10-c.score),0)/total).toFixed(1):'0';
  const r7=sessions.slice(0,7).reduce((s,c)=>s+(10-c.score),0)/Math.min(7,total||1);
  const p7=sessions.slice(7,14); const pAvg=p7.length?p7.reduce((s,c)=>s+(10-c.score),0)/p7.length:r7;
  const trend=Math.round((r7-pAvg)/(pAvg||1)*100);
  $('progress-stats').innerHTML=`
    <div class="stat-card"><div class="stat-val">${avg}</div><div class="stat-lbl">Avg Score</div></div>
    <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Sessions</div></div>
    <div class="stat-card"><div class="stat-val">🔥 ${APP.streak}</div><div class="stat-lbl">Streak</div></div>
    <div class="stat-card"><div class="stat-val" style="color:${trend>=0?'var(--low)':'var(--high)'}">${trend>=0?'↑':'↓'}${Math.abs(trend)}%</div><div class="stat-lbl">Trend</div></div>
    <div class="stat-card"><div class="stat-val">${prog.done}</div><div class="stat-lbl">Lessons</div></div>
    <div class="stat-card"><div class="stat-val">${prog.pct}%</div><div class="stat-lbl">Course</div></div>`;
  $('milestones-list').innerHTML=getMilestones().map(m=>`
    <div class="milestone-row">
      <span class="ms-icon">${m.unlocked?m.icon:'🔒'}</span>
      <span class="ms-label" style="${m.unlocked?'':'opacity:.5'}">${m.label}</span>
      ${m.unlocked?`<span class="ms-xp">+${m.xp} XP</span>`:`<span class="ms-lock">Locked</span>`}
    </div>`).join('');
  if(!sessions.length){$('history-list').innerHTML='<p class="empty-msg">No sessions yet — log your first one! 🐾</p>';return;}
  $('history-list').innerHTML=sessions.slice(0,15).map(s=>{
    const d=new Date(s.date), inv=10-s.score;
    const bg=inv>=8?'#d1fae5':inv>=5?'#fef3c7':'#fee2e2', col=inv>=8?'#065f46':inv>=5?'#92400e':'#991b1b';
    return `<div class="h-item">
      <div class="h-score-dot" style="background:${bg};color:${col}">${inv}/10</div>
      <div class="h-meta">
        <div class="h-date">${d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})} · ${s.duration}min</div>
        <div class="h-tags">${(s.skills||[]).map(sk=>`<span class="h-tag">${sk}</span>`).join('')}</div>
        ${s.note?`<div class="h-note">${s.note}</div>`:''}
      </div>
    </div>`;
  }).join('');
}
let _pct='score';
function switchProgressChart(type,btn){ _pct=type; qsa('#screen-progress .mini-tab').forEach(b=>b.classList.remove('active')); if(btn) btn.classList.add('active'); renderProgressChart(type); }
function renderProgressChart(type){ const c=$('progress-chart'); if(!c) return; const slice=APP.sessions.slice(0,14).reverse(); const labels=slice.map(s=>{const d=new Date(s.date);return `${d.getDate()}/${d.getMonth()+1}`;}); const data=type==='skills'?slice.map(s=>(s.skills||[]).length*20):slice.map(s=>10-(s.score||5)); drawChart(c,labels,data,type==='skills'?'#f4a435':'#3a7d44',type==='skills'?'rgba(244,164,53,.13)':'rgba(58,125,68,.13)',120); }

// ══════════════════════════════════════════════════════
//  ENRICHMENT
// ══════════════════════════════════════════════════════
let _enrichCat='all';
function filterEnrich(cat,btn){ _enrichCat=cat; qsa('#enrich-filters .filter-btn').forEach(b=>b.classList.remove('active')); if(btn) btn.classList.add('active'); renderEnrichment(cat); }
function renderEnrichment(cat){
  const list=cat==='all'?ENRICHMENT:ENRICHMENT.filter(e=>e.cat===cat);
  $('enrich-list').innerHTML='';
  list.forEach(e=>{
    const done=APP.completedActivities.includes(e.id);
    const d=document.createElement('div'); d.className=`enrich-item${done?' done':''}`;
    d.innerHTML=`<div class="ei-icon">${e.icon}</div><div class="ei-info"><div class="ei-name">${e.name}</div><div class="ei-desc">${e.desc}</div><div class="ei-meta"><span class="ei-pill">⏱ ${e.time}</span><span class="ei-pill">${e.level}</span></div><div class="ei-tip">${e.tip}</div></div><div class="ei-side">${done?`<div class="ei-done-badge">✅ Done</div>`:`<button class="ei-start" onclick="startActivity('${e.id}')">Start</button>`}</div>`;
    $('enrich-list').appendChild(d);
  });
}
function startActivity(id){ const act=ENRICHMENT.find(e=>e.id===id); if(!act) return; if(act.instant){showToast(act.instant);markActivityDone(id);return;} runActivity(act); }
function runActivity(act){
  $('runner-title').textContent=act.name; $('activity-runner').style.display='flex';
  let ci=0,pi=0,tmr=null; const max=act.cycles||3;
  function next(){ if(ci>=max){finishActivity(act.id);return;} const ph=act.phases[pi%act.phases.length]; $('runner-circle').className='runner-circle '+ph.c; $('runner-instruction').textContent=ph.l; $('runner-progress-txt').textContent=`Round ${ci+1} of ${max}`; let t=ph.d; $('runner-timer').textContent=t; clearInterval(tmr); tmr=setInterval(()=>{t--;$('runner-timer').textContent=t;if(t<=0){clearInterval(tmr);pi++;if(pi%act.phases.length===0)ci++;next();}},1000); }
  next();
  $('runner-stop-btn').onclick=()=>{clearInterval(tmr);$('activity-runner').style.display='none';markActivityDone(act.id);showToast('🎉 Activity done! +30 XP');};
}
function finishActivity(id){$('activity-runner').style.display='none';markActivityDone(id);showToast('🎉 Activity done! +30 XP');}
function markActivityDone(id){ if(APP.addActivity(id)){save('fp_xp',APP.xp+30);updateXP();} renderEnrichment(_enrichCat); }

// ══════════════════════════════════════════════════════
//  AI COACH
// ══════════════════════════════════════════════════════
let _coachInited=false;
function initCoach(){
  if(_coachInited) return; _coachInited=true;
  const dog=APP.dogName, breed=APP.dogBreed, goals=APP.goals;
  const intro=goals.length
    ? `Hi there! 👋 I'm your Four Paws AI Coach. I can see ${dog}${breed?' ('+breed+')':''} is working on: ${goals.slice(0,3).join(', ')}. Ask me anything!`
    : `Hi there! 👋 I'm your Four Paws AI Training Coach. Ask me anything about ${dog}'s training, behaviour or what to try next.`;
  addMsg('bot',intro);
  $('coach-quick').innerHTML=QUICK_TOPICS.slice(0,5).map(q=>`<button class="coach-quick-btn" onclick="askCoach(${JSON.stringify(q)})">⚡ ${q}</button>`).join('');
  const send=$('coach-send'),inp=$('coach-input');
  if(send&&!send._bound){send._bound=true;send.addEventListener('click',sendCoach);}
  if(inp&&!inp._bound){inp._bound=true;inp.addEventListener('keydown',e=>{if(e.key==='Enter')sendCoach();});}
}
function addMsg(role,text){ const chat=$('coach-chat'); const d=document.createElement('div'); d.className=`chat-msg ${role==='user'?'chat-user':'chat-bot'}`; d.textContent=text; chat.appendChild(d); chat.scrollTop=chat.scrollHeight; }
function sendCoach(){ const inp=$('coach-input'); const q=inp.value.trim(); if(!q) return; addMsg('user',q); inp.value=''; setTimeout(()=>{ const lq=q.toLowerCase(); let resp=`Keep sessions with ${APP.dogName} under 5 minutes, always end on success, and stay consistent.`; Object.entries(AI_RESP).forEach(([k,v])=>{if(lq.includes(k)) resp=v;}); addMsg('bot',resp); },700); }
function askCoach(q){ $('coach-input').value=q; sendCoach(); }

// ══════════════════════════════════════════════════════
//  TODAY'S PLAN
// ══════════════════════════════════════════════════════
function renderToday(){
  const dog=APP.dogName;
  $('today-sub').textContent=`${dog}'s personalised training tasks for today`;
  $('today-tip').textContent=TIPS[new Date().getDate()%TIPS.length];
  const cur=getCurrentModule();
  const taskLabels=cur
    ? cur.lessons.filter(l=>!APP.completedLessons.includes(l.id)).slice(0,3).map(l=>`📌 ${l.name}`)
    : ['🧠 10 marker word reps','📣 10 recall calls in garden','😌 5-min settle on mat'];
  if(taskLabels.length<3) taskLabels.push(...['📣 10 recall calls in garden','😌 Enrichment activity'].slice(0,3-taskLabels.length));
  const tasks=APP.dailyTasks;
  $('today-tasks-list').innerHTML=taskLabels.slice(0,3).map((t,i)=>`
    <div class="today-task">
      <button class="task-check${tasks[i]?' done':''}" onclick="toggleTodayTask(${i})">${tasks[i]?'✓':''}</button>
      <span class="task-lbl${tasks[i]?' done':''}">${t}</span>
    </div>`).join('');
  const next=getMilestones().filter(m=>!m.unlocked).slice(0,3);
  $('today-milestones').innerHTML=next.length
    ? next.map(m=>`<div class="milestone-row"><span class="ms-icon">🔒</span><span class="ms-label" style="opacity:.6">${m.label}</span><span class="ms-xp">+${m.xp} XP</span></div>`).join('')
    : '<p class="empty-msg">All milestones unlocked! 🏆</p>';
}
function toggleTodayTask(i){ const tasks=APP.dailyTasks; tasks[i]=!tasks[i]; APP.saveTask(i,tasks[i]); if(tasks[i]){save('fp_xp',APP.xp+10);updateXP();showToast('✅ Task done! +10 XP');} renderToday(); }

// ══════════════════════════════════════════════════════
//  CHART
// ══════════════════════════════════════════════════════
function drawChart(canvas,labels,data,color,fill,height){
  if(!canvas||!data.length) return;
  const W=canvas.offsetWidth||canvas.parentElement?.offsetWidth||340, H=height||90;
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,W,H);
  const pad={t:12,r:14,b:18,l:24}; const cw=W-pad.l-pad.r, ch=H-pad.t-pad.b;
  const mx=Math.max(...data,10), mn=0;
  const sx=i=>pad.l+i*(cw/(data.length-1||1));
  const sy=v=>pad.t+ch-((v-mn)/(mx-mn||1))*ch;
  ctx.strokeStyle=isDark?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)'; ctx.lineWidth=1;
  for(let g=0;g<=3;g++){const gy=pad.t+ch*(g/3);ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(pad.l+cw,gy);ctx.stroke();}
  ctx.beginPath(); data.forEach((v,i)=>{i===0?ctx.moveTo(sx(i),sy(v)):ctx.lineTo(sx(i),sy(v));}); ctx.lineTo(sx(data.length-1),pad.t+ch); ctx.lineTo(sx(0),pad.t+ch); ctx.closePath(); ctx.fillStyle=fill; ctx.fill();
  ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.lineJoin='round'; data.forEach((v,i)=>{i===0?ctx.moveTo(sx(i),sy(v)):ctx.lineTo(sx(i),sy(v));}); ctx.stroke();
  data.forEach((v,i)=>{ctx.beginPath();ctx.arc(sx(i),sy(v),4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.beginPath();ctx.arc(sx(i),sy(v),2,0,Math.PI*2);ctx.fillStyle=isDark?'#121f14':'#fff';ctx.fill();});
  ctx.fillStyle=isDark?'rgba(255,255,255,.35)':'rgba(0,0,0,.35)'; ctx.font='10px system-ui'; ctx.textAlign='center'; ctx.textBaseline='bottom'; labels.forEach((l,i)=>ctx.fillText(l,sx(i),H));
}

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', ()=>{
  applyTheme();
  if(!APP.onboarded){
    $('onboarding').style.display='block';
    initOnboarding();
  } else {
    launchPortal();
  }
});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./ap3x-sw.js').catch(()=>{});
}
