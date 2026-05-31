/* ═══════════════════════════════════════════════════════
   RECHARGE RECOVERY — Patient PWA App JS
   Burnout recovery self-monitoring + guided program portal
════════════════════════════════════════════════════════ */
'use strict';

// ── Helpers ───────────────────────────────────────────
function $ (id)  { return document.getElementById(id); }
function qs(s)   { return document.querySelector(s); }
function qsa(s)  { return document.querySelectorAll(s); }
function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
function load(k,d){ try{ const v=localStorage.getItem(k); return v!==null?JSON.parse(v):d; }catch(e){ return d; } }

// ── Recovery Curriculum ───────────────────────────────
const CURRICULUM = [
  { id:1, name:'Phase 1 — Foundation Reset', emoji:'🌱', xp:500, lessons:[
    {id:'l1_1',name:'Understanding Burnout',          desc:'The neuroscience of chronic stress and how burnout develops',               tip:'Burnout is not weakness — it\'s your nervous system\'s response to sustained overload.', xp:50},
    {id:'l1_2',name:'The Stress Response Cycle',      desc:'Completing the biological stress cycle to release stored tension',           tip:'The stress cycle must be completed — otherwise tension stays locked in the body.', xp:50},
    {id:'l1_3',name:'Nervous System Basics',          desc:'Understanding your autonomic nervous system and its recovery signals',       tip:'Your rest-and-digest system can only activate when your threat-detection system quiets.', xp:60},
    {id:'l1_4',name:'Sleep as Medicine',              desc:'Why sleep is the single most powerful recovery intervention available',      tip:'One night of poor sleep impairs prefrontal cortex function more than alcohol.', xp:60},
    {id:'l1_5',name:'Boundaries as Biology',          desc:'The physiological case for limits — not as luxury, but survival',           tip:'Saying no to one thing is saying yes to your nervous system\'s recovery capacity.', xp:80},
  ]},
  { id:2, name:'Phase 2 — Body First', emoji:'🫁', xp:600, lessons:[
    {id:'l2_1',name:'Breathwork Foundations',         desc:'Using the breath to activate your parasympathetic nervous system',          tip:'A slow exhale (longer than your inhale) directly stimulates the vagus nerve.', xp:60},
    {id:'l2_2',name:'Movement as Regulation',         desc:'How physical movement completes the stress cycle and restores homeostasis', tip:'20 minutes of moderate movement reduces cortisol by up to 48%.', xp:80},
    {id:'l2_3',name:'Somatic Grounding',              desc:'Body-based techniques to interrupt a dysregulated stress state',            tip:'The 5-4-3-2-1 technique redirects your nervous system from threat to environment.', xp:80},
    {id:'l2_4',name:'Rest That Actually Restores',    desc:'The difference between collapse and genuine nervous system restoration',    tip:'Passive rest (TV, scrolling) does not restore — active rest (breathwork, nature) does.', xp:60},
    {id:'l2_5',name:'Nutrition & Energy Depletion',   desc:'How chronic stress depletes critical nutrients and what to prioritise',     tip:'Magnesium, B vitamins and omega-3s are the first casualties of sustained cortisol elevation.', xp:70},
  ]},
  { id:3, name:'Phase 3 — Mind Rewiring', emoji:'🧠', xp:700, lessons:[
    {id:'l3_1',name:'Cognitive Distortions in Burnout',desc:'Identifying thought patterns that sustain the burnout cycle',             tip:'All-or-nothing thinking and catastrophising are neurological symptoms, not character flaws.', xp:70},
    {id:'l3_2',name:'Regulated Response Training',    desc:'Practising pause and respond — not react — in high-pressure moments',      tip:'One conscious breath before responding changes your entire stress trajectory.', xp:80},
    {id:'l3_3',name:'Values Realignment',             desc:'Reconnecting with what actually matters — not what feels urgent',          tip:'Busyness and productivity are not the same as meaning.', xp:80},
    {id:'l3_4',name:'Mindfulness as Medicine',        desc:'Evidence-based mindfulness for nervous system recovery — not spirituality', tip:'8 weeks of mindfulness practice measurably shrinks the amygdala\'s threat response.', xp:70},
    {id:'l3_5',name:'Letting Go of Guilt',            desc:'Addressing the shame and self-blame that sustains exhaustion',             tip:'Rest is not earned — it is required. Your worth is not your output.', xp:80},
  ]},
  { id:4, name:'Phase 4 — Life Redesign', emoji:'🏗️', xp:650, lessons:[
    {id:'l4_1',name:'Workload Audit',                 desc:'Mapping and reducing your cognitive and emotional load systematically',     tip:'Start with what to remove, not what to optimise.', xp:60},
    {id:'l4_2',name:'Recovery Rituals',               desc:'Building restorative routines that anchor your nervous system',             tip:'Consistency matters more than duration — 5 minutes daily beats 2 hours once a week.', xp:70},
    {id:'l4_3',name:'Social Recovery',                desc:'Navigating relationships during burnout — who restores, who depletes',      tip:'Connection is medicine. But not all connection — choose carefully.', xp:80},
    {id:'l4_4',name:'Digital Detox Protocols',        desc:'Reducing the neurological cost of constant connectivity',                   tip:'Each notification is a micro cortisol spike. 47 per day adds up.', xp:70},
    {id:'l4_5',name:'Energy Accounting',              desc:'Treating your energy like money — budgeting, not just spending',            tip:'Track what fills you, what drains you. Reduce the ratio of drain to fill.', xp:70},
  ]},
  { id:5, name:'Phase 5 — Long-Term Resilience', emoji:'🌿', xp:800, lessons:[
    {id:'l5_1',name:'Resilience vs. Resistance',      desc:'Why pushing through is the opposite of resilience',                        tip:'Resilience is the capacity to return to baseline — not the ability to ignore it.', xp:80},
    {id:'l5_2',name:'Early Warning Signals',          desc:'Recognising your personal burnout indicators before crisis point',          tip:'Your body always warns you first. Learning to read it is the practice.', xp:80},
    {id:'l5_3',name:'Recovery Identity',              desc:'Building a self-concept that includes rest as a core value',                tip:'You are not what you produce. Rest is not a reward — it is who you are becoming.', xp:90},
    {id:'l5_4',name:'Sustainable Performance',        desc:'Returning to work without returning to burnout',                           tip:'The goal is not to maximise output — it is to sustain it across years, not months.', xp:80},
    {id:'l5_5',name:'Maintenance Planning',           desc:'Designing your long-term recovery maintenance system',                      tip:'Never miss twice. The minimum viable practice is the floor, not the standard.', xp:90},
  ]},
];

// ── Restorative Activities ────────────────────────────
const ENRICHMENT = [
  {id:'boxbreath',  cat:'breathwork', icon:'🌬️', name:'Box Breathing',        desc:'4-4-4-4 breath pattern for immediate nervous system reset',  time:'4 min',  level:'Beginner',     tip:'Used by military and first responders — genuinely effective.',  phases:[{l:'Inhale for 4',d:4,c:'inhale'},{l:'Hold for 4',d:4,c:'hold'},{l:'Exhale for 4',d:4,c:'exhale'},{l:'Hold for 4',d:4,c:'hold'}], cycles:4},
  {id:'478breath',  cat:'breathwork', icon:'💨', name:'4-7-8 Breath',          desc:'Extended exhale technique — the fastest way to activate rest mode', time:'5 min',  level:'Beginner',  tip:'The long exhale stimulates the vagus nerve directly.',           phases:[{l:'Inhale for 4',d:4,c:'inhale'},{l:'Hold for 7',d:7,c:'hold'},{l:'Exhale for 8',d:8,c:'exhale'}], cycles:5},
  {id:'grounding',  cat:'grounding',  icon:'🌿', name:'5-4-3-2-1 Grounding',  desc:'Sensory anchoring to interrupt stress spirals',              time:'3 min',  level:'Beginner',     tip:'Names 5 things you see, 4 you hear, 3 you feel, 2 you smell, 1 you taste.', phases:[{l:'Name 5 things you can see',d:20,c:'inhale'},{l:'Notice 4 things you can hear',d:20,c:'hold'},{l:'Feel 3 physical sensations',d:20,c:'exhale'},{l:'Identify 2 smells / 1 taste',d:15,c:'hold'}], cycles:1},
  {id:'lickmat',    cat:'calm',       icon:'☕', name:'Slow Sensory Wind-Down', desc:'Mindful warm drink ritual to shift into parasympathetic mode', time:'10 min', level:'Beginner',    tip:'Warming your hands on a mug activates your body\'s calming response.',  phases:[{l:'Prepare your warm drink mindfully',d:60,c:'hold'},{l:'Hold the mug — breathe in the warmth',d:60,c:'inhale'},{l:'Sip slowly and notice the taste',d:60,c:'exhale'}], cycles:3},
  {id:'bodyscan',   cat:'calm',       icon:'🧘', name:'Body Scan',             desc:'Progressive attention to body sensation — releases held tension', time:'8 min', level:'Beginner',   tip:'Tension you can name is tension you can release.',               phases:[{l:'Scan from feet upward — breathe into any tension',d:60,c:'inhale'},{l:'Release each muscle group on the exhale',d:60,c:'exhale'},{l:'Rest in full body awareness',d:30,c:'hold'}], cycles:3},
  {id:'walkout',    cat:'movement',   icon:'🚶', name:'Regulation Walk',       desc:'Deliberate outdoor walk focused on sensory input, not speed',  time:'15 min', level:'Beginner',   tip:'Walking at your own pace in nature reduces cortisol measurably.', instant:'🚶 Step outside now. Walk slowly. Notice what you see and hear — not your phone.'},
  {id:'journal',    cat:'reflection', icon:'📓', name:'Reflective Journalling', desc:'Structured self-enquiry to process and release stored stress', time:'10 min', level:'Beginner',   tip:'Writing externalises rumination — the page holds it so you don\'t have to.', instant:'📓 Open a notebook. Write: What am I carrying today? What would help? What can I release?'},
  {id:'coldwater',  cat:'movement',   icon:'🚿', name:'Cold Water Reset',      desc:'Brief cold water exposure to shift your autonomic state fast', time:'2 min',  level:'Intermediate', tip:'30 seconds of cold water on the face/wrists triggers a vagal reset.',  instant:'🚿 Splash cold water on your face and wrists for 30 seconds. Breathe slowly as you do it.'},
  {id:'nature',     cat:'grounding',  icon:'🌳', name:'Nature Immersion',      desc:'Deliberate sensory immersion in a natural environment',         time:'20 min', level:'Beginner',    tip:'20 minutes in green space measurably reduces stress hormones.',   instant:'🌳 Find any green space — even a park or garden. Sit or walk. No phone. Just notice.'},
  {id:'progressive',cat:'calm',       icon:'🛋️', name:'Progressive Muscle Relaxation', desc:'Systematic tension and release through the body',     time:'12 min', level:'Beginner',    tip:'Deliberately tensing before releasing teaches the body what "let go" actually feels like.', phases:[{l:'Tense your feet for 5s — then release',d:10,c:'hold'},{l:'Tense your legs — then release',d:10,c:'hold'},{l:'Tense your core — then release',d:10,c:'hold'},{l:'Tense your shoulders — then release fully',d:10,c:'exhale'}], cycles:3},
];

// ── Daily Recovery Tips ───────────────────────────────
const TIPS = [
  'Recovery is not a reward for hard work — it is the condition that makes hard work sustainable.',
  'You cannot think your way out of a physiological state. You have to move through it.',
  'Rest is not laziness. Restoration is the work.',
  'The most productive thing you can do today might be to sleep early.',
  'Burnout recovery is not linear. A hard day is not a relapse.',
  'Breathe out slowly. The exhale activates the system that calms you.',
  'Your nervous system does not distinguish between a real threat and a deadline. Treat it accordingly.',
  'One minute of stillness costs nothing. Its returns are disproportionate.',
  'Say no to one thing today — not as avoidance, but as an act of self-respect.',
  'Completion matters. Whatever you started, finish it or formally close it. Open loops drain energy.',
  'Walk slowly today. Speed is a stress signal.',
  'You are allowed to not know how you are. Sit with the uncertainty.',
  'Chronic stress is a whole-body condition. Recovery must be too.',
  'What you resist persists. Acknowledge the exhaustion — do not fight it.',
  'Small consistent acts of restoration outperform grand recovery gestures every time.',
  'The body recovers. The mind follows. Start with the body.',
  'Your worth is not your output. Rest is not something you earn.',
  'One good breath is always available to you, in any situation.',
  'Notice what is quiet today. Attend to it before it becomes loud.',
  'Recovery is a practice, not a destination.',
  'Do less. Mean it more.',
  'What fills you? Do that thing today — even for five minutes.',
  'Sleep is the most powerful cognitive enhancer available — and it\'s free.',
  'You are not behind. You are recovering.',
  'Stillness is not emptiness. It is the ground from which restoration grows.',
  'Ask for help. Isolation amplifies burnout.',
  'The goal is not to eliminate stress — it is to complete the cycle.',
  'Gentle movement is not exercise — it is medicine.',
  'Notice the tension in your shoulders right now. Breathe it out.',
  'One boundary today. Just one.',
  'You have survived every hard day so far. This one too.',
];

// ── AI Coach Responses ────────────────────────────────
const AI_RESP = {
  'breathwork':  'Breathwork directly engages your autonomic nervous system. The key is the exhale — make it longer than the inhale. Try 4 counts in, 6 counts out, for 2 minutes. Do it now if you can.',
  'sleep':       'Sleep is non-negotiable in recovery. Prioritise: no screens 60 mins before bed, keep the room cool and dark, same wake time every day. Consistency matters more than duration.',
  'anxiety':     'Burnout often presents as anxiety because your threat-detection system is chronically activated. Grounding (5-4-3-2-1) and breathwork interrupt the cycle. The feeling will pass — your nervous system is not broken.',
  'stress':      'Stress itself is not the problem — incomplete stress cycles are. Your body needs to physically complete the response: breathwork, movement, shaking, crying. These are not weaknesses — they\'re the solution.',
  'energy':      'Low energy in burnout is physiological, not motivational. Check: sleep quality, hydration, whether you\'re getting outside, and whether you\'re completing stress cycles. Willpower won\'t fix a depleted nervous system.',
  'motivation':  'Loss of motivation is a symptom of burnout, not a character flaw. The dopamine system is depleted. Start with tiny, meaningful acts — not productivity. What felt good before burnout? Start there.',
  'work':        'Returning to work during recovery requires a managed re-entry. Reduce load before you think you need to. Your capacity is lower than it feels on good days — plan for the average, not the peak.',
  'boundaries':  'Boundaries in recovery are not about saying no to people — they\'re about saying yes to your nervous system\'s recovery capacity. What one thing, if removed this week, would create the most space?',
  'focus':       'Difficulty concentrating is a core burnout symptom — your prefrontal cortex is under-resourced. Single-tasking, brief focus blocks (15–20 mins max), and rest between them is the prescription — not more effort.',
  'eating':      'Chronic stress depletes magnesium, B vitamins, and omega-3s. Prioritise whole foods, reduce caffeine after noon, and eat breakfast — blood sugar stability is a nervous system issue.',
  'social':      'Burnout can make social contact feel draining, even with people you love. That\'s normal. Identify who restores you vs. who depletes you. Limit the latter, protect time with the former.',
  'exercise':    '20–30 minutes of moderate movement is one of the most evidence-based burnout recovery interventions available. It completes the stress cycle. Walking counts. It does not need to be intense.',
  'meditation':  'Mindfulness in burnout recovery is not about achieving calm — it\'s about noticing what\'s present without being overwhelmed by it. Start with 3 minutes. Just notice the breath. Distraction is normal.',
  'relapse':     'A bad day or week during recovery is not failure — it is information. It tells you something about your current capacity or triggers. Rest, reduce, and begin again. The path is not linear.',
  'default':     'That\'s a really important question in the context of your recovery. The core principle is always: nervous system first, productivity second. What does your body need right now — more rest, more movement, or more connection?',
};

const QUICK_TOPICS = [
  'I can\'t sleep',
  'Feeling overwhelmed',
  'Low energy today',
  'Can\'t focus',
  'Feeling anxious',
  'Need a quick reset',
  'How to set a boundary',
  'What should I do now?',
];

// ── APP State ─────────────────────────────────────────
const APP = {
  get sessions()           { return load('rc_sessions', []); },
  get completedLessons()   { return load('rc_lessons', []); },
  get completedActivities(){ return load('rc_acts', []); },
  get streak()             { return load('rc_streak', 0); },
  get ep()                 { return load('rc_ep', 0); },          // Energy Points
  get userName()           { return load('rc_user_name', 'Recovery User'); },
  get phase()              { return load('rc_phase', 1); },
  get goals()              { return load('rc_goals', []); },
  get experience()         { return load('rc_exp', 'new'); },
  get onboarded()          { return load('rc_onboarded', false); },
  addLesson(id) { const a=this.completedLessons; if(!a.includes(id)){a.push(id);save('rc_lessons',a);return true;}return false; },
  removeLesson(id){ save('rc_lessons',this.completedLessons.filter(x=>x!==id)); },
  addActivity(id){ const a=this.completedActivities; if(!a.includes(id)){a.push(id);save('rc_acts',a);return true;}return false; },
  addSession(s){ const a=this.sessions; a.unshift(s); save('rc_sessions',a); },
  get dailyTasks(){ return load('rc_tasks_'+new Date().toDateString(),[false,false,false]); },
  saveTask(i,v){ const t=this.dailyTasks; t[i]=v; save('rc_tasks_'+new Date().toDateString(),t); },
};

// ── Seed demo data ────────────────────────────────────
(function seed(){
  if(load('rc_seeded2',false)) return;
  const now=Date.now(), D=86400000;

  // Recovery check-in sessions (rc_sessions)
  save('rc_sessions',[
    {date:now-D*13,score:8,anxietyScore:8,mood:['Exhausted','Overwhelmed'],duration:5,  note:'First check-in. Feeling completely depleted.',       sleep:4},
    {date:now-D*12,score:7,anxietyScore:7,mood:['Anxious','Tense'],         duration:8,  note:'Breathwork helped a little. Still very wired.',        sleep:5},
    {date:now-D*11,score:7,anxietyScore:7,mood:['Exhausted'],               duration:6,  note:'Hard to concentrate on anything.',                     sleep:4},
    {date:now-D*10,score:6,anxietyScore:6,mood:['Low','Tense'],             duration:10, note:'Tried the body scan — fell asleep. That\'s probably fine.', sleep:6},
    {date:now-D*9, score:6,anxietyScore:6,mood:['Anxious'],                 duration:8,  note:'Meeting at work was tough. Boundaries still hard.',    sleep:5},
    {date:now-D*8, score:5,anxietyScore:5,mood:['Tired','Calm'],            duration:10, note:'Box breathing before bed — slept better.',             sleep:7},
    {date:now-D*7, score:5,anxietyScore:5,mood:['Flat','Tired'],            duration:8,  note:'Still low energy but less anxious.',                   sleep:6},
    {date:now-D*6, score:4,anxietyScore:4,mood:['Calm'],                    duration:12, note:'Grounding walk helped. Actually noticed things.',       sleep:7},
    {date:now-D*5, score:4,anxietyScore:4,mood:['Tired','Calm'],            duration:10, note:'Finished Phase 1. Feels meaningful.',                  sleep:7},
    {date:now-D*4, score:3,anxietyScore:3,mood:['Calm','Reflective'],       duration:10, note:'Said no to something today. Actually felt okay.',       sleep:7},
    {date:now-D*3, score:3,anxietyScore:3,mood:['Calm'],                    duration:12, note:'Morning breathwork becoming habit.',                    sleep:8},
    {date:now-D*2, score:2,anxietyScore:2,mood:['Calm','Motivated'],        duration:15, note:'Best day in weeks. Walked for 30 mins. Felt human.',    sleep:8},
    {date:now-D,   score:2,anxietyScore:2,mood:['Calm','Reflective'],       duration:12, note:'Journalled. Identified main drain at work.',            sleep:8},
    {date:now-0.4*D,score:2,anxietyScore:2,mood:['Calm'],                   duration:10, note:'Checked in this morning. Breathing before meetings.',  sleep:7},
  ]);
  save('rc_streak',7); save('rc_ep',680);
  save('rc_lessons',['l1_1','l1_2','l1_3','l1_4','l1_5','l2_1','l2_2']);

  // ── CRITICAL: seed ap3x_anxiety_logs for clinician dashboard ──
  // Maps rc_sessions → ap3x_anxiety_logs format
  const anxietyLogs = [
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:8,sleep_hours:4,note:'First check-in. Completely depleted.',                created_at:new Date(now-D*13).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:7,sleep_hours:5,note:'Breathwork helped a little. Still very wired.',         created_at:new Date(now-D*12).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:7,sleep_hours:4,note:'Hard to concentrate on anything.',                      created_at:new Date(now-D*11).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:6,sleep_hours:6,note:'Body scan — fell asleep. Probably fine.',               created_at:new Date(now-D*10).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:6,sleep_hours:5,note:'Meeting at work was tough.',                            created_at:new Date(now-D*9).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:5,sleep_hours:7,note:'Box breathing before bed — slept better.',              created_at:new Date(now-D*8).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:5,sleep_hours:6,note:'Still low energy but less anxious.',                    created_at:new Date(now-D*7).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:4,sleep_hours:7,note:'Grounding walk helped. Noticed things.',                created_at:new Date(now-D*6).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:4,sleep_hours:7,note:'Finished Phase 1.',                                     created_at:new Date(now-D*5).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:3,sleep_hours:7,note:'Said no to something. Actually felt okay.',             created_at:new Date(now-D*4).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:3,sleep_hours:8,note:'Morning breathwork becoming habit.',                    created_at:new Date(now-D*3).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:2,sleep_hours:8,note:'Best day in weeks. Walked 30 mins.',                    created_at:new Date(now-D*2).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:2,sleep_hours:8,note:'Journalled. Identified main drain at work.',             created_at:new Date(now-D).toISOString()},
    {id:crypto.randomUUID(),user_id:'demo-patient-local',anxiety_score:2,sleep_hours:7,note:'Breathing before meetings.',                            created_at:new Date(now-0.4*D).toISOString()},
  ];
  save('ap3x_anxiety_logs', anxietyLogs);

  // Also seed a demo provision + lifecycle for this local patient
  const prov = load('ap3x_provisions', {});
  if (!prov['demo-patient-local']) {
    prov['demo-patient-local'] = {
      patientId:    'demo-patient-local',
      name:         'Demo Recovery User',
      clinicianId:  'local',
      accessToken:  'demo-token-local',
      createdAt:    new Date(now - D*14).toISOString(),
      deliveryUrl:  window.location.href,
      onboardingState: { step: 'active', startedAt: new Date(now-D*14).toISOString(), completedAt: new Date(now-D*13).toISOString() }
    };
    save('ap3x_provisions', prov);
  }
  const lc = load('ap3x_lifecycle', {});
  if (!lc['demo-patient-local']) {
    lc['demo-patient-local'] = {
      status:             'active',
      deployedAt:         new Date(now - D*14).toISOString(),
      lastSync:           new Date(now - 0.4*D).toISOString(),
      onboardingComplete: true,
      firstEngagement:    new Date(now - D*13).toISOString()
    };
    save('ap3x_lifecycle', lc);
  }

  // Profile
  if(!load('rc_onboarded',false)){
    save('rc_user_name','Recovery User');
    save('rc_goals',['Reduce anxiety and daily stress','Improve sleep quality','Build sustainable boundaries']);
    save('rc_exp','mild'); save('rc_onboarded',true);
  }
  save('rc_seeded2',true);
})();

// ── Theme ─────────────────────────────────────────────
let isDark=load('rc_theme',false);
function applyTheme(){ document.body.className=isDark?'theme-dark':'theme-light'; const b=$('theme-toggle'); if(b) b.textContent=isDark?'☀️':'🌙'; }
function toggleTheme(){ isDark=!isDark; save('rc_theme',isDark); applyTheme(); }

function updateEP(){   const c=$('xp-chip'); if(c) c.textContent=`⚡ ${APP.ep} EP`; }
function updateStreak(){ const b=$('streak-banner'),t=$('streak-text'); if(!b) return; if(APP.streak>0){b.style.display='flex';t.textContent=`${APP.streak}-day recovery streak — keep going!`;}else b.style.display='none'; }

// ── Toast ─────────────────────────────────────────────
let _tt;
function showToast(msg){ const old=$('fp-toast'); if(old) old.remove(); const t=document.createElement('div'); t.id='fp-toast'; t.className='fp-toast'; t.textContent=msg; document.body.appendChild(t); clearTimeout(_tt); _tt=setTimeout(()=>{if(t.parentNode)t.remove();},3000); }

// ══════════════════════════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════════════════════════
let obExp='mild', obGoals=[];

function obNext(currentStep) {
  if(currentStep===1){ obShowStep(2); return; }
  if(currentStep===2){
    const name=($('ob-user-name').value||'').trim();
    if(!name){showToast('⚠️ Please enter your name'); return;}
    obShowStep(3); return;
  }
  if(currentStep===3){
    if(obGoals.length===0){showToast('⚠️ Please select at least one recovery goal'); return;}
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
  const name=($('ob-user-name').value||'').trim()||'Recovery User';
  save('rc_user_name', name);
  save('rc_goals', obGoals);
  save('rc_exp', obExp);
  const goals=obGoals.slice(0,3).join(', ')+(obGoals.length>3?` +${obGoals.length-3} more`:'');
  $('ob-summary').innerHTML=`
    <div class="ob-summary-row"><span class="ob-summary-key">Name</span><span class="ob-summary-val">${name}</span></div>
    <div class="ob-summary-row"><span class="ob-summary-key">Goals</span><span class="ob-summary-val">${goals}</span></div>
    <div class="ob-summary-row"><span class="ob-summary-key">Experience</span><span class="ob-summary-val">${obExp}</span></div>`;
  obShowStep(5);
  $('ob-launch-btn').onclick=()=>finishOnboarding();
}
function finishOnboarding(){
  save('rc_onboarded',true);
  $('onboarding').style.display='none';
  launchPortal();
}

function initOnboarding(){
  qsa('.ob-goal-btn').forEach(b=>b.addEventListener('click',()=>{
    b.classList.toggle('active');
    const g=b.getAttribute('data-g');
    const i=obGoals.indexOf(g); i===-1?obGoals.push(g):obGoals.splice(i,1);
  }));
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
  applyTheme(); updateEP(); updateStreak();
  const tb=$('theme-toggle');
  if(tb && !tb._bound){ tb._bound=true; tb.addEventListener('click',toggleTheme); }
  renderPortal();
}

function renderPortal(){
  const h=new Date().getHours();
  const greeting=(h<12?'Good morning':h<17?'Good afternoon':'Good evening');
  const user=APP.userName;
  $('hero-greeting').textContent = `${greeting}, ${user} 👋`;
  $('hero-dog-name').textContent = 'Your Recovery Dashboard';
  $('hero-sub').textContent      = 'Recharge Recovery · Building sustainable wellbeing 🌿';
  $('portal-brand-sub').textContent = 'Recovery Companion';

  // Status chips
  const chips=[`Phase ${APP.phase}`,`🔥 ${APP.streak} day streak`];
  $('hero-dog-chips').innerHTML=chips.map(c=>`<span class="hero-chip">${c}</span>`).join('');

  // Tile meta
  const prog=getLessonProgress(), cur=getCurrentModule();
  const el=$('tile-course-meta'); if(el) el.textContent=`${prog.pct}% complete`;
  const el2=$('tile-progress-meta'); if(el2) el2.textContent=`${APP.sessions.length} check-ins`;
  const el3=$('tile-coach-meta'); if(el3) el3.textContent='Ask about your recovery';
  const tasks=APP.dailyTasks; const done=tasks.filter(Boolean).length;
  const el4=$('tile-today-meta'); if(el4) el4.textContent=`${done}/3 done today`;

  // Today snapshot
  const s=APP.sessions, total=s.length;
  const latest7=s.slice(0,7);
  const avgAnxiety=latest7.length?(latest7.reduce((a,c)=>a+(c.anxietyScore||c.score||5),0)/latest7.length).toFixed(1):'–';
  const trend=s.length>=2
    ? (s[0].anxietyScore||s[0].score)<(s[1].anxietyScore||s[1].score) ? '↓ Improving' : '→ Stable'
    : '–';
  $('today-snapshot').innerHTML=`
    <div class="today-snap-card"><div class="tsn-val">${total}</div><div class="tsn-lbl">Check-ins</div></div>
    <div class="today-snap-card"><div class="tsn-val">${avgAnxiety}</div><div class="tsn-lbl">Avg Anxiety</div></div>
    <div class="today-snap-card"><div class="tsn-val">🔥 ${APP.streak}</div><div class="tsn-lbl">Streak</div></div>
    <div class="today-snap-card"><div class="tsn-val">${prog.pct}%</div><div class="tsn-lbl">Program</div></div>
    <div class="today-snap-card"><div class="tsn-val">${trend}</div><div class="tsn-lbl">Trend</div></div>`;

  // Tip
  $('portal-tip-text').textContent=TIPS[new Date().getDate()%TIPS.length];

  // Goals
  const goals=APP.goals;
  $('goals-strip').innerHTML=goals.length
    ? goals.map(g=>`<span class="goal-chip">${g}</span>`).join('')
    : '<span class="goal-chip" style="opacity:.5">No goals set yet</span>';

  // Log labels
  const ls=$('log-sub'); if(ls) ls.textContent='Record your check-in — your recovery guide sees this';
  const ml=$('mood-label'); if(ml) ml.textContent='How are you feeling today?';

  setTimeout(()=>renderPortalChart(), 80);
}

function renderPortalChart(){
  const c=$('portal-chart'); if(!c) return;
  const slice=APP.sessions.slice(0,7).reverse();
  const labels=slice.map(s=>['Su','Mo','Tu','We','Th','Fr','Sa'][new Date(s.date).getDay()]);
  const data=slice.map(s=>s.anxietyScore||s.score||5);
  drawChart(c,labels,data,'#4a7c7e','rgba(74,124,126,.14)',72);
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
//  LOG CHECK-IN
// ══════════════════════════════════════════════════════
let _score=null, _mood=[], _practices=[];
function initLogForm(){
  const scaleEl=$('score-scale');
  if(scaleEl && !scaleEl.childElementCount){
    for(let i=0;i<=10;i++){
      const b=document.createElement('button'); b.className='scale-btn'; b.textContent=i;
      b.addEventListener('click',()=>{
        qsa('#score-scale .scale-btn').forEach(x=>x.classList.remove('sel'));
        b.classList.add('sel'); _score=i;
        $('score-display').textContent=i;
        const ctx={0:'🌟 Excellent',1:'🌟 Very low anxiety',2:'✅ Good recovery',3:'✅ Feeling solid',4:'🟡 Moderate',5:'🟡 Some tension',6:'🟠 Elevated stress',7:'🟠 High anxiety',8:'🔴 Very high',9:'🔴 Extremely stressed',10:'🔴 Overwhelmed'};
        $('score-ctx').textContent=ctx[i]||'';
      });
      scaleEl.appendChild(b);
    }
  }
  qsa('#mood-tags .tag').forEach(t=>t.addEventListener('click',()=>{ t.classList.toggle('active'); const v=t.getAttribute('data-v'); const i=_mood.indexOf(v); i===-1?_mood.push(v):_mood.splice(i,1); }));
  const btn=$('submit-session');
  if(btn && !btn._bound){ btn._bound=true; btn.addEventListener('click',submitLog); }
}

function submitLog(){
  if(_score===null){showToast('⚠️ Please rate your anxiety level first');return;}
  const s=_score;
  const lvl=s<=3?'low':s<=6?'mid':'high';
  const sleep=parseInt(($('duration-input')||{}).value)||7;
  const note=($('session-note')||{}).value||'';

  // ── Write to rc_sessions (patient app state) ──────────
  APP.addSession({
    date:       Date.now(),
    score:      s,
    anxietyScore: s,
    mood:       [..._mood],
    duration:   sleep,
    sleep:      sleep,
    note:       note.trim()
  });

  // ── Write to ap3x_anxiety_logs (clinician dashboard reads this) ──
  const patientId = sessionStorage.getItem('ap3x_patient_id') || 'demo-patient-local';
  const newLog = {
    id:            crypto.randomUUID(),
    user_id:       patientId,
    anxiety_score: s,
    sleep_hours:   sleep,
    note:          note.trim(),
    created_at:    new Date().toISOString()
  };
  const logs = JSON.parse(localStorage.getItem('ap3x_anxiety_logs')||'[]');
  logs.unshift(newLog);
  localStorage.setItem('ap3x_anxiety_logs', JSON.stringify(logs.slice(0,500)));

  // ── Update lifecycle lastSync ─────────────────────────
  try {
    const lc = JSON.parse(localStorage.getItem('ap3x_lifecycle')||'{}');
    if(lc[patientId]){ lc[patientId].lastSync=new Date().toISOString(); lc[patientId].status='active'; }
    localStorage.setItem('ap3x_lifecycle', JSON.stringify(lc));
  } catch(e){}

  // ── EP + streak ───────────────────────────────────────
  save('rc_ep',APP.ep+50); save('rc_streak',APP.streak+1);
  updateEP(); updateStreak();

  // ── Feedback ──────────────────────────────────────────
  const msgs={
    low:`Great check-in. Your scores are showing real improvement — the consistency is working.`,
    mid:`Noted. Elevated stress days are part of recovery, not a setback. A 5-minute breathwork session now will help.`,
    high:`This is a hard day. That's valid. Please try a grounding practice now and be gentle with yourself today.`
  };
  const tips={
    low:'💡 Momentum is building. Protect the practices that are working — especially sleep and breathwork.',
    mid:'💡 Box breathing for 4 minutes before any stressful interaction today.',
    high:'💡 5-4-3-2-1 grounding right now: name 5 things you can see. Bring yourself back to the present.'
  };
  const bgs={low:'#d1fae5',mid:'#fef3c7',high:'#fee2e2'};
  const cols={low:'#065f46',mid:'#92400e',high:'#991b1b'};
  const txts={low:'🌟 Excellent check-in',mid:'✅ Logged',high:'💙 Tough day — logged'};
  const badge=$('fb-badge');
  if(badge){ badge.textContent=txts[lvl]; badge.style.background=bgs[lvl]; badge.style.color=cols[lvl]; }
  if($('fb-msg')) $('fb-msg').textContent=msgs[lvl];
  if($('fb-tip')) $('fb-tip').textContent=tips[lvl];
  if($('log-form-wrap')) $('log-form-wrap').style.display='none';
  if($('log-feedback'))  $('log-feedback').style.display='block';
  showToast(`✅ Check-in saved! +50 EP 🌿`);
}

function resetLog(){
  _score=null; _mood=[];
  qsa('#score-scale .scale-btn').forEach(b=>b.classList.remove('sel'));
  qsa('#mood-tags .tag').forEach(t=>t.classList.remove('active'));
  if($('score-display')) $('score-display').textContent='–';
  if($('score-ctx'))     $('score-ctx').textContent='';
  if($('duration-input'))$('duration-input').value='';
  if($('session-note'))  $('session-note').value='';
  if($('log-form-wrap')) $('log-form-wrap').style.display='block';
  if($('log-feedback'))  $('log-feedback').style.display='none';
}

// ══════════════════════════════════════════════════════
//  COURSES / PROGRAM
// ══════════════════════════════════════════════════════
function getLessonProgress(){
  const total=CURRICULUM.reduce((s,m)=>s+m.lessons.length,0);
  const done=APP.completedLessons.length;
  const modsDone=CURRICULUM.filter(m=>m.lessons.every(l=>APP.completedLessons.includes(l.id))).length;
  return {total,done,modsDone,pct:Math.round(done/total*100)};
}
function getCurrentModule(){ for(const m of CURRICULUM){if(!m.lessons.every(l=>APP.completedLessons.includes(l.id))) return m;} return CURRICULUM[CURRICULUM.length-1]; }

function renderCourses(){
  const prog=getLessonProgress(), cur=getCurrentModule();
  $('course-hero-wrap').innerHTML=`
    <div class="course-hero-card">
      <div class="ch-title">🌿 Recovery Program — Phase ${APP.phase}</div>
      <div class="ch-sub">${prog.done} of ${prog.total} sessions complete · ${prog.modsDone} phases finished</div>
      <div class="ch-bar-track"><div class="ch-bar-fill" style="width:${prog.pct}%"></div></div>
      <div class="ch-stats">
        <div><div class="ch-sv">${prog.pct}%</div><div class="ch-sl">Complete</div></div>
        <div><div class="ch-sv">${prog.done}</div><div class="ch-sl">Sessions</div></div>
        <div><div class="ch-sv">${prog.modsDone}/5</div><div class="ch-sl">Phases</div></div>
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
          <div class="mod-meta">${doneCnt}/${mod.lessons.length} sessions · ${mod.xp} EP</div>
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
            <span class="lesson-xp">+${l.xp} EP</span>
          </div>
          ${(done||isNext)?`<div class="lesson-tip">💡 ${l.tip}</div>`:''}`;
        }).join('')}
      </div>`;
    list.appendChild(card);
  });
}
function toggleLesson(id,locked){
  if(locked){showToast('🔒 Complete earlier phases first');return;}
  const done=APP.completedLessons.includes(id);
  if(done){ APP.removeLesson(id); const l=CURRICULUM.flatMap(m=>m.lessons).find(x=>x.id===id); if(l) save('rc_ep',Math.max(0,APP.ep-l.xp)); showToast('↩ Session marked incomplete'); }
  else { APP.addLesson(id); const l=CURRICULUM.flatMap(m=>m.lessons).find(x=>x.id===id); if(l){ save('rc_ep',APP.ep+l.xp); showToast(`🎉 Session complete! +${l.xp} EP`); const mod=CURRICULUM.find(m=>m.lessons.some(x=>x.id===id)); if(mod&&mod.lessons.every(x=>APP.completedLessons.includes(x.id))){ setTimeout(()=>showToast(`🏅 Phase ${mod.id} done! +${mod.xp} bonus EP 🎉`),1200); save('rc_ep',APP.ep+mod.xp); } } }
  updateEP(); renderCourses();
}

// ══════════════════════════════════════════════════════
//  PROGRESS
// ══════════════════════════════════════════════════════
function getMilestones(){
  const s=APP.sessions;
  return [
    {icon:'🎉',label:'First check-in logged',                             unlocked:s.length>=1,   xp:50 },
    {icon:'🔥',label:'3-day recovery streak',                             unlocked:APP.streak>=3, xp:100},
    {icon:'🌟',label:'7-day recovery streak',                             unlocked:APP.streak>=7, xp:200},
    {icon:'📋',label:'10 check-ins completed',                            unlocked:s.length>=10,  xp:150},
    {icon:'🌬️',label:'Used breathwork practice',                          unlocked:APP.completedActivities.includes('boxbreath')||APP.completedActivities.includes('478breath'), xp:100},
    {icon:'🧘',label:'Completed a grounding session',                     unlocked:APP.completedActivities.includes('grounding')||APP.completedActivities.includes('bodyscan'), xp:100},
    {icon:'🎓',label:'Phase 1 — Foundation Reset complete',               unlocked:CURRICULUM[0].lessons.every(l=>APP.completedLessons.includes(l.id)), xp:500},
    {icon:'🏅',label:'Phase 2 — Body First complete',                     unlocked:CURRICULUM[1].lessons.every(l=>APP.completedLessons.includes(l.id)), xp:600},
    {icon:'🌿',label:'Restorative activity completed',                    unlocked:APP.completedActivities.length>=1, xp:50 },
    {icon:'📉',label:'Anxiety trend improving (last 7 days)',              unlocked:s.length>=7&&(s[0].anxietyScore||s[0].score)<(s[6].anxietyScore||s[6].score), xp:200},
    {icon:'🏆',label:'25 check-ins logged',                               unlocked:s.length>=25,  xp:500},
  ];
}
function renderProgress(){
  const sessions=APP.sessions, total=sessions.length, prog=getLessonProgress();
  const avg=total?(sessions.reduce((s,c)=>s+(c.anxietyScore||c.score||5),0)/total).toFixed(1):'0';
  const r7=sessions.slice(0,7).reduce((s,c)=>s+(c.anxietyScore||c.score||5),0)/Math.min(7,total||1);
  const p7=sessions.slice(7,14); const pAvg=p7.length?p7.reduce((s,c)=>s+(c.anxietyScore||c.score||5),0)/p7.length:r7;
  const trend=Math.round((r7-pAvg)/(pAvg||1)*100);
  $('progress-stats').innerHTML=`
    <div class="stat-card"><div class="stat-val">${avg}</div><div class="stat-lbl">Avg Anxiety</div></div>
    <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Check-ins</div></div>
    <div class="stat-card"><div class="stat-val">🔥 ${APP.streak}</div><div class="stat-lbl">Streak</div></div>
    <div class="stat-card"><div class="stat-val" style="color:${trend<=0?'var(--low)':'var(--high)'}">${trend<=0?'↓ +':'↑ '}${Math.abs(trend)}%</div><div class="stat-lbl">Trend</div></div>
    <div class="stat-card"><div class="stat-val">${prog.done}</div><div class="stat-lbl">Sessions</div></div>
    <div class="stat-card"><div class="stat-val">${prog.pct}%</div><div class="stat-lbl">Program</div></div>`;
  $('milestones-list').innerHTML=getMilestones().map(m=>`
    <div class="milestone-row">
      <span class="ms-icon">${m.unlocked?m.icon:'🔒'}</span>
      <span class="ms-label" style="${m.unlocked?'':'opacity:.5'}">${m.label}</span>
      ${m.unlocked?`<span class="ms-xp">+${m.xp} EP</span>`:`<span class="ms-lock">Locked</span>`}
    </div>`).join('');
  if(!sessions.length){$('history-list').innerHTML='<p class="empty-msg">No check-ins yet — log your first one 🌿</p>';return;}
  $('history-list').innerHTML=sessions.slice(0,15).map(s=>{
    const d=new Date(s.date), score=s.anxietyScore||s.score||5;
    const bg=score<=3?'#d1fae5':score<=6?'#fef3c7':'#fee2e2', col=score<=3?'#065f46':score<=6?'#92400e':'#991b1b';
    return `<div class="h-item">
      <div class="h-score-dot" style="background:${bg};color:${col}">${score}/10</div>
      <div class="h-meta">
        <div class="h-date">${d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})} · Sleep: ${s.sleep||s.duration||'?'}h</div>
        <div class="h-tags">${(s.mood||[]).map(m=>`<span class="h-tag">${m}</span>`).join('')}</div>
        ${s.note?`<div class="h-note">${s.note}</div>`:''}
      </div>
    </div>`;
  }).join('');
}
let _pct='score';
function switchProgressChart(type,btn){ _pct=type; qsa('#screen-progress .mini-tab').forEach(b=>b.classList.remove('active')); if(btn) btn.classList.add('active'); renderProgressChart(type); }
function renderProgressChart(type){
  const c=$('progress-chart'); if(!c) return;
  const slice=APP.sessions.slice(0,14).reverse();
  const labels=slice.map(s=>{const d=new Date(s.date);return `${d.getDate()}/${d.getMonth()+1}`;});
  const data=type==='sleep'?slice.map(s=>s.sleep||s.duration||7):slice.map(s=>s.anxietyScore||s.score||5);
  drawChart(c,labels,data,type==='sleep'?'#4a7c7e':'#e05555',type==='sleep'?'rgba(74,124,126,.13)':'rgba(224,85,85,.13)',120);
}

// ══════════════════════════════════════════════════════
//  RESTORATIVE ACTIVITIES
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
  $('runner-stop-btn').onclick=()=>{clearInterval(tmr);$('activity-runner').style.display='none';markActivityDone(act.id);showToast('🎉 Activity done! +30 EP');};
}
function finishActivity(id){$('activity-runner').style.display='none';markActivityDone(id);showToast('🎉 Activity done! +30 EP');}
function markActivityDone(id){ if(APP.addActivity(id)){save('rc_ep',APP.ep+30);updateEP();} renderEnrichment(_enrichCat); }

// ══════════════════════════════════════════════════════
//  AI RECOVERY COACH
// ══════════════════════════════════════════════════════
let _coachInited=false;
function initCoach(){
  if(_coachInited) return; _coachInited=true;
  const goals=APP.goals;
  const intro=goals.length
    ? `Hi there 👋 I'm your Recharge Recovery Coach. I can see you're working on: ${goals.slice(0,3).join(', ')}. Ask me anything about your recovery.`
    : `Hi there 👋 I'm your Recharge Recovery Coach. Ask me anything about your recovery, wellbeing, or what to focus on next.`;
  addMsg('bot',intro);
  $('coach-quick').innerHTML=QUICK_TOPICS.slice(0,5).map(q=>`<button class="coach-quick-btn" onclick="askCoach(${JSON.stringify(q)})">⚡ ${q}</button>`).join('');
  const send=$('coach-send'),inp=$('coach-input');
  if(send&&!send._bound){send._bound=true;send.addEventListener('click',sendCoach);}
  if(inp&&!inp._bound){inp._bound=true;inp.addEventListener('keydown',e=>{if(e.key==='Enter')sendCoach();});}
}
function addMsg(role,text){ const chat=$('coach-chat'); const d=document.createElement('div'); d.className=`chat-msg ${role==='user'?'chat-user':'chat-bot'}`; d.textContent=text; chat.appendChild(d); chat.scrollTop=chat.scrollHeight; }
function sendCoach(){ const inp=$('coach-input'); const q=(inp.value||'').trim(); if(!q) return; inp.value=''; askCoach(q); }
function askCoach(q){
  addMsg('user',q);
  const lq=q.toLowerCase();
  let key='default';
  for(const k of Object.keys(AI_RESP)){
    if(lq.includes(k)){ key=k; break; }
  }
  const latest=APP.sessions[0];
  let prefix='';
  if(latest){
    const sc=latest.anxietyScore||latest.score||5;
    if(sc>=7) prefix='I can see your recent anxiety scores have been high — that context matters. ';
    else if(sc<=3) prefix='Your recent check-ins are looking better. Building on that: ';
  }
  setTimeout(()=>addMsg('bot', prefix+AI_RESP[key]), 400);
}

// ══════════════════════════════════════════════════════
//  TODAY
// ══════════════════════════════════════════════════════
function renderToday(){
  const d=new Date();
  if($('today-date')) $('today-date').textContent=d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  const tasks=[
    {label:'Morning breathwork (5 min)', icon:'🌬️'},
    {label:'Check-in logged today',       icon:'📊'},
    {label:'One restorative activity',    icon:'🌿'},
  ];
  const saved=APP.dailyTasks;
  $('today-tasks').innerHTML=tasks.map((t,i)=>`
    <div class="task-row ${saved[i]?'done':''}" onclick="toggleTask(${i})">
      <div class="task-check">${saved[i]?'✓':''}</div>
      <div class="task-info"><span class="task-icon">${t.icon}</span> ${t.label}</div>
    </div>`).join('');
  if($('today-tip')) $('today-tip').textContent=TIPS[(d.getDate()+7)%TIPS.length];
}
function toggleTask(i){ const t=APP.dailyTasks; t[i]=!t[i]; APP.saveTask(i,t[i]); renderToday(); }

// ══════════════════════════════════════════════════════
//  CHART
// ══════════════════════════════════════════════════════
function drawChart(canvas,labels,data,color,fillColor,maxH){
  const ctx=canvas.getContext('2d'); const W=canvas.offsetWidth||300, H=maxH||80;
  canvas.width=W; canvas.height=H;
  if(!data.length){ctx.clearRect(0,0,W,H);return;}
  const maxV=Math.max(...data,10), minV=0, padX=20, padY=8;
  const iW=W-padX*2, iH=H-padY*2;
  const pts=data.map((v,i)=>({x:padX+i/(data.length-1||1)*iW,y:padY+iH-(v-minV)/(maxV-minV||1)*iH}));
  ctx.clearRect(0,0,W,H);
  // Fill
  ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
  pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.lineTo(pts[pts.length-1].x,H); ctx.lineTo(pts[0].x,H); ctx.closePath();
  ctx.fillStyle=fillColor; ctx.fill();
  // Line
  ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
  pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
  ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.stroke();
  // Labels
  ctx.fillStyle='#607878'; ctx.font='10px system-ui';
  labels.forEach((l,i)=>{const p=pts[i];if(p)ctx.fillText(l,p.x-6,H-2);});
}

// ══════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded',()=>{
  // Read provisioned patientId from sessionStorage (set by bootstrap script)
  const provisionedId = sessionStorage.getItem('ap3x_patient_id');
  const provisionedName = sessionStorage.getItem('ap3x_patient_name');
  if(provisionedName && !load('rc_user_name','')) save('rc_user_name', provisionedName);

  if(!APP.onboarded){
    $('onboarding').style.display='flex';
    initOnboarding();
  } else {
    launchPortal();
  }
  applyTheme();
  if(typeof window!=='undefined' && 'serviceWorker' in navigator){
    navigator.serviceWorker.register('./ap3x-sw.js').catch(()=>{});
  }
});
