/* ═══════════════════════════════════════════════
   RECHARGE — Burnout Recovery Companion — Shared JS
   State, data, utilities — loaded on every page
════════════════════════════════════════════════ */
'use strict';

// ── Helpers ───────────────────────────────────────────
function $ (id)       { return document.getElementById(id); }
function qs(sel)      { return document.querySelector(sel); }
function qsa(sel)     { return document.querySelectorAll(sel); }
function save(k,v)    { try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function load(k,def)  { try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):def; }catch(e){ return def; } }

// ── Recovery Program curriculum (SSOT) ───────────────
const CURRICULUM = [
  { id:1, name:'Phase 1 — Foundations of Recovery', emoji:'🌱', xp:500, lessons:[
    {id:'l1_1',name:'Understanding Burnout',               desc:'Recognising the stages of burnout and what your nervous system needs',         tip:'Burnout is a physiological state — not a personal failure. Rest is the first medicine.',         xp:50},
    {id:'l1_2',name:'The Stress Response Cycle',           desc:'How stress builds and how to complete the cycle to release it',               tip:'Completing the stress cycle (movement, breath, connection) is essential — not optional.',         xp:50},
    {id:'l1_3',name:'Attention & Presence',                desc:'Training your focus back to the present moment to reduce overload',           tip:'Five minutes of deliberate presence rewires your attention more than an hour of passive rest.',   xp:60},
    {id:'l1_4',name:'Rest vs. Recovery',                   desc:'Why passive rest often isn\'t enough — and what true recovery looks like',      tip:'Sleep refuels you. Active recovery restores you. Both are non-negotiable.',                       xp:60},
    {id:'l1_5',name:'Nervous System Basics',               desc:'Sympathetic vs parasympathetic — learning to regulate your own state',        tip:'Your exhale activates the parasympathetic system. Slow it down intentionally.',                  xp:80},
  ]},
  { id:2, name:'Phase 2 — Energy Restoration', emoji:'🎯', xp:600, lessons:[
    {id:'l2_1',name:'Energy Audit',                        desc:'Identifying what drains vs. restores your energy across all life areas',      tip:'What depletes and what restores is deeply personal. Track it honestly for 7 days.',              xp:60},
    {id:'l2_2',name:'Boundary Setting Foundations',        desc:'Building the ability to say no without guilt',                               tip:'Every boundary you hold protects a piece of your energy that you cannot replace.',               xp:80},
    {id:'l2_3',name:'Recovery Pacing',                     desc:'Structuring your days around energy capacity, not task lists',               tip:'Pace yourself like a long-distance runner — sustainable rhythm beats sprinting.',                xp:80},
    {id:'l2_4',name:'Micro-Recovery Habits',               desc:'Small daily practices that prevent energy depletion from accumulating',       tip:'A 3-minute decompression break every 90 minutes protects your energy better than one long rest.',xp:60},
    {id:'l2_5',name:'Sleep Optimisation',                  desc:'Evidence-based sleep hygiene tailored for those in burnout',                  tip:'Consistent sleep and wake times matter more than total hours for nervous system recovery.',      xp:70},
  ]},
  { id:3, name:'Phase 3 — Stress Resilience', emoji:'🌍', xp:700, lessons:[
    {id:'l3_1',name:'Identifying Stress Triggers',         desc:'Mapping your personal stress landscape — people, situations, thoughts',       tip:'Triggers aren\'t problems to fix immediately. Start by noticing them without reaction.',          xp:70},
    {id:'l3_2',name:'Regulated Response Training',         desc:'Practising pause and respond — not react — in high-pressure moments',        tip:'One conscious breath before responding changes your entire stress trajectory.',                  xp:80},
    {id:'l3_3',name:'Reducing Cognitive Overload',         desc:'Decluttering mental load: decisions, commitments and information noise',      tip:'Every open loop in your mind costs energy. Write it down — clear the RAM.',                    xp:80},
    {id:'l3_4',name:'Social Recovery',                     desc:'Navigating relationships and communication during burnout recovery',          tip:'Protect your energy in social contexts. One honest conversation beats ten performative ones.',   xp:70},
    {id:'l3_5',name:'Confidence & Self-Trust Rebuilding',  desc:'Reclaiming your sense of capability after burnout erosion',                  tip:'Start with tiny wins. Confidence returns through action, not through waiting to feel ready.',   xp:80},
  ]},
  { id:4, name:'Phase 4 — Sustainable Wellbeing', emoji:'🏠', xp:650, lessons:[
    {id:'l4_1',name:'Recovery Routine Architecture',       desc:'Designing a morning and evening routine that supports healing',               tip:'Bookend your day. What you do in the first and last 30 minutes shapes everything in between.',   xp:60},
    {id:'l4_2',name:'Safe Space Creation',                 desc:'Building a physical and mental environment that supports your nervous system', tip:'Your environment either supports recovery or disrupts it. Audit it with fresh eyes.',            xp:70},
    {id:'l4_3',name:'Independent Recovery Practice',       desc:'Building self-guided habits that work even when you\'re feeling low',         tip:'Start with what takes less than 2 minutes. Habit stacking makes recovery sustainable.',         xp:80},
    {id:'l4_4',name:'Reducing Burnout Relapse Risks',      desc:'Recognising early warning signs and building your personal prevention plan',  tip:'Know your early signals. Burnout rarely arrives suddenly — it builds in layers.',               xp:70},
    {id:'l4_5',name:'Calm Life Architecture',              desc:'Redesigning commitments, environment and habits for long-term calm',          tip:'Simplify before you optimise. Less is almost always more during recovery.',                     xp:70},
  ]},
  { id:5, name:'Phase 5 — Long-Term Energy Mastery', emoji:'🧩', xp:800, lessons:[
    {id:'l5_1',name:'Joyful Activity Planning',            desc:'Reintroducing purpose, pleasure and play into daily life',                    tip:'Joy isn\'t a luxury — it\'s a recovery input. Schedule it as seriously as sleep.',              xp:80},
    {id:'l5_2',name:'Restorative Movement',                desc:'Using body-based practices to complete stress cycles and restore energy',     tip:'Even a 5-minute slow walk or gentle stretch shifts your nervous system state.',                 xp:80},
    {id:'l5_3',name:'Mindfulness Foundations',             desc:'Introducing present-moment awareness practices into your recovery plan',      tip:'Mindfulness isn\'t about emptying the mind — it\'s about noticing without judgment.',           xp:90},
    {id:'l5_4',name:'Long-Term Habit Reinforcement',       desc:'Maintaining recovery habits under pressure, setbacks and life changes',       tip:'Consistency over intensity. One small action every day beats seven big ones on Sundays.',       xp:80},
    {id:'l5_5',name:'Advanced Recovery Planning',          desc:'Designing a personalised weekly recovery schedule that actually fits your life',tip:'Plan for low-energy days. A recovery plan that only works when you feel good isn\'t a plan.',  xp:90},
  ]},
];

// ── Restorative Activities (replaces Enrichment) ──────
const ENRICHMENT = [
  {id:'breath',  cat:'breathwork',  icon:'🌬️', name:'Box Breathing Reset',       desc:'A structured breathing pattern that regulates the nervous system',  time:'5 min',  level:'Beginner',     tip:'Box breathing activates your parasympathetic system within 60 seconds.',                   phases:[{l:'Breathe in slowly',d:4,c:'inhale'},{l:'Hold gently',d:4,c:'hold'},{l:'Breathe out slowly',d:4,c:'exhale'},{l:'Hold gently',d:4,c:'hold'}], cycles:5},
  {id:'grounding',cat:'grounding', icon:'🌿', name:'5-4-3-2-1 Grounding',        desc:'Sensory anchoring to break the stress cycle and return to now',     time:'5 min',  level:'Beginner',     tip:'Grounding works fastest when you name things out loud, even in a whisper.',                phases:[{l:'Find 5 things you can see',d:15,c:'inhale'},{l:'Find 4 things you can touch',d:15,c:'hold'},{l:'Find 3 sounds you can hear',d:10,c:'exhale'},{l:'Take one slow breath',d:6,c:'hold'}], cycles:2},
  {id:'journal', cat:'reflection',  icon:'📓', name:'Free-Write Journal',         desc:'Unfiltered writing to process thoughts and reduce mental load',     time:'10 min', level:'Beginner',     tip:'Don\'t edit yourself. Just let thoughts flow onto the page for the full time.',            instant:'📓 Open a notebook (or notes app) and write freely for 10 minutes — no editing, no rereading.'},
  {id:'lickmat', cat:'calm',        icon:'☕', name:'Slow Sensory Wind-Down',     desc:'Mindful tea or warm drink ritual to shift into parasympathetic mode',time:'10 min', level:'Beginner',     tip:'Warming your hands on a mug activates your body\'s calming response.',                      phases:[{l:'Prepare your warm drink mindfully',d:60,c:'hold'},{l:'Hold the mug — breathe in the warmth',d:60,c:'inhale'},{l:'Sip slowly and notice the taste',d:60,c:'exhale'}], cycles:3},
  {id:'reset',   cat:'calm',        icon:'🛁', name:'Recovery Reset Ritual',      desc:'A 10-minute self-care anchor you can return to daily',             time:'2 min',  level:'Beginner',     tip:'Consistency makes this more powerful — same time, same sequence.',                         instant:'🛁 Set a timer for 10 minutes, close your eyes, lie down or sit comfortably, and do nothing intentionally.'},
  {id:'move',    cat:'movement',    icon:'🚶', name:'Mindful Walk',               desc:'A slow, sensory-focused walk that completes the stress cycle',     time:'10 min', level:'Intermediate', tip:'Leave your phone behind or on silent. This walk is for your nervous system.',               phases:[{l:'Walk slowly, focus on your feet',d:60,c:'inhale'},{l:'Notice sounds around you',d:60,c:'hold'},{l:'Pause and breathe deeply',d:15,c:'exhale'},{l:'Continue walking with soft eyes',d:60,c:'inhale'}], cycles:3},
  {id:'social',  cat:'connection',  icon:'💬', name:'Connection Check-In',        desc:'A brief, honest connection with someone safe — no performance',    time:'10 min', level:'Intermediate', tip:'You don\'t have to be okay to reach out. "I\'m tired" is a complete sentence.',              phases:[{l:'Choose one safe person to contact',d:10,c:'hold'},{l:'Send a message or make a call',d:15,c:'inhale'},{l:'Be present and honest',d:120,c:'exhale'}], cycles:2},
  {id:'wobble',  cat:'movement',    icon:'🧘', name:'Gentle Body Scan',           desc:'Progressive muscle awareness to release stored tension',           time:'8 min',  level:'Intermediate', tip:'Stored tension is stress that never completed its cycle. This releases it.',                phases:[{l:'Notice tension in your face and jaw',d:15,c:'inhale'},{l:'Soften your shoulders consciously',d:15,c:'exhale'},{l:'Breathe into your chest and belly',d:15,c:'inhale'},{l:'Relax your hands and feet',d:15,c:'exhale'}], cycles:4},
  {id:'nature',  cat:'grounding',   icon:'🌳', name:'Nature Immersion',           desc:'Spending time in nature to lower cortisol and restore attention',  time:'20 min', level:'All levels',   tip:'Even looking at trees for 10 minutes measurably reduces cortisol.',                        phases:[{l:'Find a natural space (park, garden, window)',d:30,c:'hold'},{l:'Look without a goal — just observe',d:120,c:'inhale'},{l:'Breathe in and out slowly',d:15,c:'exhale'}], cycles:3},
  {id:'art',     cat:'reflection',  icon:'🎨', name:'Expressive Creativity',      desc:'Unstructured creative play — drawing, colouring or making',        time:'15 min', level:'All levels',   tip:'The goal isn\'t good output. The goal is being absorbed in something non-demanding.',       instant:'🎨 Spend 15 minutes on any creative activity — drawing, colouring, writing — with zero pressure to produce anything worth keeping.'},
];

// ── Tips (daily wisdom for burnout recovery) ──────────
const TIPS = [
  'Recovery is not a reward for productivity — it\'s a precondition for it.',
  'You cannot think your way out of burnout. You have to rest your way through it.',
  'Doing less is not laziness. It is precision.',
  'Your body kept the score. Your recovery returns it.',
  'Small consistent actions create nervous system safety over time.',
  'One slow breath is never nothing.',
  'Saying no to one thing is saying yes to your energy.',
  'Fatigue is a signal, not a weakness. Listen to it early.',
  'Recovery is not linear. A bad day is data, not failure.',
  'The version of you on the other side of burnout is worth protecting.',
  'Rest deeply enough and clarity returns on its own.',
  'You don\'t have to earn rest.',
  'Compassion for yourself is the fastest path through.',
  'Energy invested in your recovery pays compound interest.',
  'What needs less of your attention today?',
  'Presence is the most restorative state available to you.',
  'You are allowed to not be at full capacity.',
  'Progress in recovery often looks like nothing from the outside.',
  'Protect your mornings like they matter — because they do.',
  'Burnout doesn\'t arrive suddenly. Neither does recovery.',
  'The goal today is not peak performance. It is sustainable.',
  'Connection, sleep, movement — in that order if you\'re unsure.',
  'Your nervous system is on your side. Help it help you.',
  'One kind action toward yourself changes your entire trajectory.',
  'You already know what you need. Trust that.',
  'What can be simplified today?',
  'Completion feels better than perfection.',
  'You are recovering. That is enough.',
  'Let go of the timeline.',
  'Gentle progress is still progress.',
  'Choose calm over correct whenever possible.',
];

// ── Quick topics for AI Recovery Guide ───────────────
const QUICK_TOPICS = [
  'I\'m exhausted but can\'t sleep — what helps?',
  'How do I know if I\'m actually recovering?',
  'I feel guilty when I rest. What do I do?',
  'What should I do on a low-energy day?',
  'How long does burnout recovery actually take?',
  'I\'ve relapsed into burnout — where do I start again?',
  'How do I set limits with work without feeling bad?',
  'What\'s the most important thing I can do today?',
  'I can\'t focus on anything — is that normal?',
  'How do I tell the difference between burnout and depression?',
  'What does a good recovery routine look like?',
  'I feel numb and disconnected — is this burnout?',
];

// ── AI Recovery Guide responses ───────────────────────
const AI_RESP = {
  'sleep':      'Sleep disruption is one of the most common burnout symptoms. The key is consistency over duration — same wake time daily, dim lights after 8pm, no screens 30 minutes before bed. Your nervous system needs signal stability before deep sleep returns.',
  'exhausted':  'Exhausted but unable to rest is a classic burnout paradox — your nervous system is stuck in high-alert. Start with breath work (box breathing, 5 minutes) before trying to sleep. The goal isn\'t sleep yet — it\'s signalling safety to your body first.',
  'guilty':     'The guilt around resting is one of burnout\'s most insidious symptoms — it keeps the cycle going. Rest is not a reward; it\'s maintenance. You would not feel guilty for charging your phone. You are not more expendable than your devices.',
  'relapse':    'Returning to burnout doesn\'t erase your progress — it just gives you more information. Start with Phase 1 practices only. Sleep, gentle movement, and one honest conversation with someone safe. Don\'t try to recover faster this time.',
  'recover':    'Signs of recovery include: sleep improving, occasional moments of genuine enjoyment, decision-making feeling slightly less overwhelming, and physical energy returning in short windows. Progress is rarely dramatic — look for subtle shifts.',
  'focus':      'Difficulty concentrating is a direct symptom of burnout — your prefrontal cortex is under-resourced. Don\'t push through it. Short sessions (15–20 minutes) with deliberate breaks will restore focus faster than forcing longer ones.',
  'depress':    'Burnout and depression share symptoms but differ in cause. Burnout typically lifts when the source of chronic stress is removed and recovery is supported. Depression often persists without that change. If you\'re unsure, please consult a mental health professional — this matters.',
  'boundary':   'Setting limits is a skill, not a personality trait. Start small: one no per day, unapologetically. You don\'t need to justify it. The discomfort of saying no is temporary. The cost of not saying it is ongoing.',
  'routine':    'A recovery routine doesn\'t have to be elaborate. Morning: 5 minutes of breath work or slow movement before checking anything. Evening: a consistent wind-down signal 30 minutes before bed. Bookend your day and protect those windows.',
  'low':        'On low-energy days: do the minimum. One micro-practice. One small act of self-care. One honest acknowledgment of where you are. This is not failure — this is the day requiring less. Let it.',
  'numb':       'Emotional numbness is your nervous system\'s protective response to sustained overwhelm. It will pass as you recover. Gentle sensory experiences — warmth, nature, slow movement — help reconnect you to feeling without forcing it.',
  'how long':   'Recovery timelines vary. Mild burnout: 3–6 months of intentional practice. Moderate: 6–12 months. Severe: 1–2+ years. The most important thing is consistent daily action — not pushing for speed. Trying to recover faster often delays it.',
};

// ── App State (localStorage SSOT) ────────────────────
const APP = {
  get userName()           { return load('rc_user_name', 'Recovering'); },
  get xp()                 { return load('rc_xp', 0); },
  get streak()             { return load('rc_streak', 0); },
  get sessions()           { return load('rc_sessions', []); },
  get completedLessons()   { return load('rc_done_lessons', []); },
  get completedActivities(){ return load('rc_done_activities', []); },
  get tasks()              { return load('rc_tasks', [false,false,false]); },
  get lastDate()           { return load('rc_last_date', null); },

  addSession(s) {
    const arr = this.sessions;
    arr.unshift(s);
    save('rc_sessions', arr.slice(0,200));
  },
  completeLesson(id) {
    const d = this.completedLessons;
    if (!d.includes(id)) { d.push(id); save('rc_done_lessons', d); }
  },
  saveTask(i, v) {
    const t = this.tasks;
    t[i] = v;
    save('rc_tasks', t);
  },
};

// ── Theme ──────────────────────────────────────────────
let isDark = load('rc_dark', false);
function applyTheme() { document.body.classList.toggle('theme-dark', isDark); if($('theme-toggle')) $('theme-toggle').textContent = isDark ? '☀️' : '🌙'; }
function toggleTheme() { isDark = !isDark; save('rc_dark', isDark); applyTheme(); }

// ── XP / Streak ────────────────────────────────────────
function updateXP()     { const el=$('xp-chip'); if(el) el.textContent='⚡ '+APP.xp+' EP'; }
function updateStreak() {
  const el=$('streak-text'), ban=$('streak-banner');
  if (!el||!ban) return;
  if (APP.streak>0) { el.textContent='🔥 '+APP.streak+'-day recovery streak — keep going!'; ban.style.display='flex'; }
  else ban.style.display='none';
}

// ── Toast ──────────────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  const old = $('fp-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'fp-toast'; t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { if(t.parentNode) t.remove(); }, 3000);
}

// ── Chart ──────────────────────────────────────────────
function drawChart(canvas, labels, data, color, fill, height) {
  if (!canvas || !data.length) return;
  const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 340;
  const H = height || 90;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,W,H);
  const pad = {t:14,r:16,b:20,l:28};
  const cw = W-pad.l-pad.r, ch = H-pad.t-pad.b;
  const mx = Math.max(...data,10), mn = 0;
  const sx = i => pad.l + i*(cw/(data.length-1||1));
  const sy = v => pad.t + ch - ((v-mn)/(mx-mn||1))*ch;
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)';
  ctx.lineWidth = 1;
  for (let g=0;g<=3;g++) { const gy=pad.t+ch*(g/3); ctx.beginPath(); ctx.moveTo(pad.l,gy); ctx.lineTo(pad.l+cw,gy); ctx.stroke(); }
  ctx.beginPath();
  data.forEach((v,i)=>{ i===0?ctx.moveTo(sx(i),sy(v)):ctx.lineTo(sx(i),sy(v)); });
  ctx.lineTo(sx(data.length-1),pad.t+ch); ctx.lineTo(sx(0),pad.t+ch); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.lineJoin='round';
  data.forEach((v,i)=>{ i===0?ctx.moveTo(sx(i),sy(v)):ctx.lineTo(sx(i),sy(v)); }); ctx.stroke();
  data.forEach((v,i)=>{
    ctx.beginPath(); ctx.arc(sx(i),sy(v),4,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
    ctx.beginPath(); ctx.arc(sx(i),sy(v),2,0,Math.PI*2); ctx.fillStyle=isDark?'#0f1a1a':'#fff'; ctx.fill();
  });
  ctx.fillStyle = isDark?'rgba(255,255,255,.35)':'rgba(0,0,0,.35)';
  ctx.font='10px system-ui'; ctx.textAlign='center'; ctx.textBaseline='bottom';
  labels.forEach((l,i)=>ctx.fillText(l,sx(i),H));
}

// ── Milestones ────────────────────────────────────────
function getMilestones() {
  const s = APP.sessions;
  return [
    {id:'m1',  icon:'🌱', label:'First check-in logged',                    unlocked:s.length>=1,   xp:50 },
    {id:'m2',  icon:'🔥', label:'3-day recovery streak',                    unlocked:APP.streak>=3, xp:100},
    {id:'m3',  icon:'🌟', label:'7-day recovery streak',                    unlocked:APP.streak>=7, xp:200},
    {id:'m4',  icon:'📋', label:'10 check-ins completed',                   unlocked:s.length>=10,  xp:150},
    {id:'m5',  icon:'🌬️', label:'Breathwork practised',                    unlocked:s.some(x=>(x.skills||[]).includes('Breathwork')), xp:100},
    {id:'m6',  icon:'⏸',  label:'Mindfulness practised',                   unlocked:s.some(x=>(x.skills||[]).includes('Mindfulness')), xp:100},
    {id:'m7',  icon:'💬', label:'Social recovery practised',                unlocked:s.some(x=>(x.skills||[]).includes('Social recovery')), xp:100},
    {id:'m8',  icon:'🎓', label:'Phase 1 complete',                         unlocked:CURRICULUM[0].lessons.every(l=>APP.completedLessons.includes(l.id)), xp:500},
    {id:'m9',  icon:'🏅', label:'Phase 2 complete',                         unlocked:CURRICULUM[1].lessons.every(l=>APP.completedLessons.includes(l.id)), xp:600},
    {id:'m10', icon:'🧘', label:'Restorative activity completed',           unlocked:APP.completedActivities.length>=1, xp:50},
    {id:'m11', icon:'🌿', label:'5 different recovery practices used',      unlocked:new Set(s.flatMap(x=>x.skills||[])).size>=5, xp:200},
    {id:'m12', icon:'🏆', label:'25 check-ins logged',                      unlocked:s.length>=25,  xp:500},
  ];
}

// ── Nav HTML builder ──────────────────────────────────
function buildNav(active) {
  const pages = [
    {id:'home',       href:'./index.html',        icon:'home',     label:'Home'},
    {id:'log',        href:'./log.html',           icon:'log',      label:'Check-In'},
    {id:'courses',    href:'./course-picker.html', icon:'courses',  label:'Programs'},
    {id:'progress',   href:'./progress.html',      icon:'progress', label:'Progress'},
    {id:'enrichment', href:'./enrichment.html',    icon:'enrich',   label:'Restore'},
    {id:'coach',      href:'./coach.html',         icon:'coach',    label:'Guide'},
  ];
  const icons = {
    home:     '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    log:      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    courses:  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    progress: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    enrich:   '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
    coach:    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  };
  return `<nav class="bottom-nav">${pages.map(p=>`
    <a href="${p.href}" class="nav-btn${p.id===active?' active':''}" aria-label="${p.label}">
      ${icons[p.icon]}<span>${p.label}</span>
    </a>`).join('')}</nav>`;
}

// ── Init common ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  updateXP();
  updateStreak();
  const tb = $('theme-toggle');
  if (tb) tb.addEventListener('click', toggleTheme);
  const nav = $('fp-nav');
  if (nav) { const pg = document.body.getAttribute('data-page') || 'home'; nav.innerHTML = buildNav(pg); }
});
