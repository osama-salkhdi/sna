// =====================================================================
//  منصة متابعة الإيفاد — الواجهة
// =====================================================================
import { API, DEMO, hashPw, examPublic, resultFor, gradeAttempt } from './api.js';
import { importFile, parseText, sanitize } from './importer.js';
import { bars3D, pie3D, legend, cssv } from './charts.js';

/* ================= utilities ================= */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>iso(new Date());
const parseD=s=>{const[a,b,c]=String(s||today()).slice(0,10).split('-').map(Number);return new Date(a,(b||1)-1,c||1)};
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const addMonths=(d,n)=>new Date(d.getFullYear(),d.getMonth()+n,d.getDate());
const monthsDiff=(a,b)=>(b.getFullYear()-a.getFullYear())*12+(b.getMonth()-a.getMonth())-(b.getDate()<a.getDate()?1:0);
const MONTHS=['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول'];
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const fmtD=s=>{if(!s)return'—';const d=parseD(s);return d.getDate()+' '+MONTHS[d.getMonth()]+' '+d.getFullYear()};
const ago=t=>{const m=Math.round((Date.now()-new Date(t))/6e4);if(!(m>=0))return'';if(m<1)return'الآن';if(m<60)return'قبل '+m+' دقيقة';const h=Math.round(m/60);if(h<24)return'قبل '+h+' ساعة';const d=Math.round(h/24);return d<30?'قبل '+d+' يوم':fmtD(String(t).slice(0,10))};
const fsize=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1)+' MB';
const errMsg=e=>(e&&(e.message||e.error_description||e.msg))||String(e);

/* ================= icons ================= */
const IC={
home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.6c2.6.2 4.3 2 5 4.9"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.2 4.2-6.5 8-6.5s7 2.3 8 6.5"/>',
track:'<path d="M4 19V5l8 3 8-3v14l-8 3-8-3z"/><path d="M12 8v14"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
task:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
inbox:'<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 15l2.5 2 4.5-4.5"/>',
report:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/><path d="M9 17v-3M12 17v-6M15 17v-4"/>',
survey:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8l1.5 1.5L12 7M8 14l1.5 1.5L12 13M14 8h3M14 14h3"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
logout:'<path d="M15 4h4v16h-4"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>',
download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
up:'<path d="M12 19V5M6 11l6-6 6 6"/>',down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
check:'<path d="M5 12l5 5 9-10"/>',
exam:'<path d="M9 3h6l1 2h3v16H5V5h3z"/><path d="M9 11l2 2 4-4M9 17h6"/>',bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',send:'<path d="M21 3L3 11l7 3 3 7z"/><path d="M10 14l11-11"/>'};
const ic=(n,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[n]||''}</svg>`;
const DEFAULT_LOGO=`<svg viewBox="0 0 100 100"><defs><linearGradient id="lgG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9b46a"/><stop offset="1" stop-color="#a87a2e"/></linearGradient></defs><g fill="none" stroke="url(#lgG)" stroke-width="5" stroke-linecap="round"><path d="M50 8v10M50 82v10M8 50h10M82 50h10M20 20l7 7M73 73l7 7M80 20l-7 7M27 73l-7 7"/><circle cx="50" cy="50" r="28"/></g><path d="M50 30l6 14 15 1-11 10 4 15-14-8-14 8 4-15-11-10 15-1z" fill="url(#lgG)"/></svg>`;
const logoHTML=()=>S.settings.logo?`<img src="${S.settings.logo}" alt="">`:DEFAULT_LOGO;
const PALETTES=[['#123f3e','#1b6b67'],['#16324f','#2563a8'],['#33264f','#6b4bb0'],['#4a2338','#a8436e'],['#333d1f','#6b7f2e'],['#4a3517','#a87a2e'],['#2b3035','#55606b']];
const TASK_TYPES=['وظيفة برمجية','بحث','تقرير','مشروع','اختبار','عرض تقديمي','أخرى'];
const ROLES={dev:'المطور',admin:'مشرف',mentor:'مشرف',student:'طالب'};
const PERIODS={w:'أسبوعي',m:'شهري',q:'ربع سنوي',h:'نصف سنوي',y:'سنوي'};
const QTYPES={single:'اختيار واحد',multi:'اختيار متعدد',scale:'مقياس موافقة (1–5)',rating:'تقييم من 1 إلى 10',yesno:'نعم / لا',text:'إجابة نصية'};
const SCALE=['لا أوافق بشدة','لا أوافق','محايد','أوافق','أوافق بشدة'];
const SCALE_COLORS=['#c0392b','#e67e22','#a0a7ad','#5aa469','#2f855a'];

/* ================= state ================= */
let S=null,ME=null,ROUTE='home',PEND=[];
const VIEWS={},UI={};
const PREFS=(()=>{try{return JSON.parse(localStorage.getItem('ifad-prefs')||'{}')}catch(e){return{}}})();
const savePrefs=()=>{try{localStorage.setItem('ifad-prefs',JSON.stringify(PREFS))}catch(e){}};

function defaultSettings(){return{name:'منصة متابعة الإيفاد',subtitle:'برنامج إيفاد طلاب الميكاترونكس والمعلوماتية',logo:'',hero:'',palette:0,theme:'light',startDate:'2026-09-01',years:5,
  finalGoal:'تخريج دفعة من المهندسين الجاهزين للعمل في الشركة منذ اليوم الأول: قادرين على تصميم الأنظمة الروبوتية والبرمجية وبنائها وصيانتها، وتحليل الأنظمة القائمة بالهندسة العكسية، وقيادة مشاريع هندسية لخدمة المجتمع.'}}
const ARRAYS=['users','tracks','students','history','tasks','subs','sessions','notes','activity','surveys','responses','participation','exams','attempts','notifications','reads'];
function blankState(withAdmin){const st={settings:defaultSettings(),tracks:seedTracks()};ARRAYS.forEach(k=>{if(!st[k])st[k]=[]});
  if(withAdmin){const s1=uid(),s2=uid();st.users=[{id:'u_dev',username:'dev',name:'المطور',role:'dev',salt:s1,hash:hashPw(s1,'dev12345'),mustChange:true},{id:'u_admin',username:'admin',name:'مشرف البرنامج',role:'admin',salt:s2,hash:hashPw(s2,'admin123')}]}return st}
function normalize(st){st=st||{};const out={...st};out.settings={...defaultSettings(),...(st.settings||{})};ARRAYS.forEach(k=>{if(!Array.isArray(out[k]))out[k]=[]});return out}
function seedTracks(){
  const T=(name,color,desc,finalGoal,axes)=>({id:uid(),name,color,desc,finalGoal,axes:axes.map(([n,gs])=>({id:uid(),name:n,goals:gs.map(([t,y,w])=>({id:uid(),title:t,year:y,weight:w,desc:''}))}))});
  return [
  T('مسار المعلوماتية','#2563a8','تعلّم C++ بمنهجية الفهم، مع الخوارزميات والرياضيات والتفكير المنطقي والهندسة العكسية.','مهندس برمجيات يفهم الحاسوب من الداخل: يصمم الأنظمة البرمجية ويبنيها، ويحل المسائل الخوارزمية، ويحلل البرمجيات القائمة بالهندسة العكسية.',[
    ['لغة C++ ومنهجية الفهم',[['الأنواع والمتغيرات وتمثيلها في الذاكرة',1,3],['الدوال والمصفوفات والمؤشرات',1,3],['المكتبة القياسية STL',1,2],['البرمجة كائنية التوجه',2,3],['إدارة الذاكرة الحديثة والقوالب',3,2]]],
    ['الخوارزميات وبنى المعطيات',[['تحليل التعقيد الزمني والمكاني',1,2],['البحث والترتيب',1,2],['بنى المعطيات الخطية',2,3],['الأشجار والرسوم البيانية',2,3],['البرمجة الديناميكية',3,3],['حل 300 مسألة على Codeforces',3,2]]],
    ['الرياضيات والتفكير المنطقي',[['المنطق والجبر البولياني',1,2],['نظرية الأعداد والأنظمة العددية',1,2],['التوافيق والاحتمالات',2,2],['الرياضيات المتقطعة',2,2],['الجبر الخطي التطبيقي',2,2]]],
    ['الهندسة العكسية',[['لغة التجميع وقراءة مخرجات المترجم',1,2],['المنقّح وتتبع الذاكرة',2,2],['تحليل الملفات التنفيذية باستخدام Ghidra',3,3],['تحليل البرمجيات الثابتة والبروتوكولات',4,3]]],
    ['هندسة البرمجيات والأنظمة',[['Linux و Git',1,2],['قواعد البيانات',2,2],['تطوير الويب والأنظمة الخلفية',3,3],['أمن المعلومات',4,2],['مشروع التخرج مع الشركة',5,4]]]]),
  T('مسار الميكاترونكس','#b8743a','الروبوت والأنظمة المدمجة والإلكترونيات والتحكم، مع الهندسة العكسية للعتاد.','مهندس ميكاترونكس يصمم الأنظمة الروبوتية المتكاملة ويبنيها، ويصون الأنظمة الكهروميكانيكية ويعيد تصنيع قطعها بالهندسة العكسية.',[
    ['البرمجة والأنظمة المدمجة',[['أساسيات C/C++',1,3],['Arduino والحساسات',1,2],['STM32 والبرمجة على مستوى السجلات',2,3],['أنظمة الزمن الحقيقي RTOS',3,2]]],
    ['الإلكترونيات وتصميم الدارات',[['الإلكترونيات الأساسية وأدوات القياس',1,2],['تصميم الدارات المطبوعة KiCad',2,3],['إلكترونيات القدرة ومشغلات المحركات',3,2]]],
    ['الميكانيك والتصميم',[['الرسم الهندسي وCAD',1,2],['التصنيع والطباعة ثلاثية الأبعاد',2,2],['تصميم الآليات',3,2]]],
    ['التحكم والروبوت',[['التحكم الآلي وPID',2,3],['الحركيات والديناميك',3,3],['ROS 2 والمحاكاة',3,3],['الملاحة الذاتية ودمج الحساسات',4,3]]],
    ['الهندسة العكسية للعتاد',[['تفكيك الأجهزة واستخراج المخططات',2,2],['تحليل البروتوكولات بمحلل منطقي',3,2],['استخراج البرمجيات الثابتة وتحليلها',4,3],['مشروع التخرج مع الشركة',5,4]]]])];
}
function surveyTemplate(kind){
  const q=(type,text,options,required=true)=>({id:uid(),type,text,options:options||[],required});
  if(kind==='monthly')return{title:'استبيان الرضا الشهري',desc:'رأيك يساعدنا على تحسين البرنامج. الإجابة تستغرق دقيقتين.',questions:[
    q('scale','أنا راضٍ عن مستوى التدريب في الشركة هذا الشهر'),q('scale','المرشد متاح عندما أحتاج المساعدة'),q('scale','حجم الوظائف مناسب ولا يتعارض مع دراستي الجامعية'),
    q('scale','أشعر أنني أتقدم نحو أهداف مساري'),q('rating','ما مدى احتمال أن تنصح زميلاً بالانضمام للبرنامج؟'),
    q('single','أكثر محور استفدت منه هذا الشهر',['البرمجة','الخوارزميات','الرياضيات','الهندسة العكسية','الإلكترونيات','الميكانيك']),
    q('multi','ما الذي تحتاجه أكثر؟ (يمكن اختيار أكثر من واحد)',['جلسات إضافية','أمثلة عملية أكثر','وقت أطول للوظائف','مراجع عربية','متابعة فردية']),
    q('text','ما أكثر شيء أعجبك؟',[],false),q('text','ما الذي تقترح تحسينه؟',[],false)]};
  if(kind==='session')return{title:'تقييم جلسة تدريب',desc:'',questions:[q('rating','قيّم الجلسة بشكل عام'),q('scale','الشرح كان واضحاً'),q('scale','التمارين كانت مناسبة لمستواي'),q('yesno','هل تحتاج مراجعة لهذا الموضوع؟'),q('text','ملاحظات',[],false)]};
  return{title:'',desc:'',questions:[]};
}
function seedDemo(st,withUsers){
  const names=['أحمد الحلبي','سارة المصري','محمد العلي','لين الخطيب','يوسف الحسن','رهف الزعبي','عمر النابلسي','مايا الشامي','خالد الأحمد','نور الدين قاسم','جود الحمصي','آية السعدي'];
  const now=new Date(),start=addMonths(new Date(now.getFullYear(),now.getMonth(),1),-4);
  st.settings.startDate=iso(start);const mentors=['م. سامر','م. ريم','م. فادي'];
  names.forEach((nm,i)=>{const t=st.tracks[i%2];if(!t)return;const sid='d'+uid();const speed=.35+Math.random()*.9;
    const s={id:sid,demo:true,name:nm,trackId:t.id,mentor:mentors[i%3],uni:'جامعة دمشق',phone:'',joined:iso(start),photo:'',progress:{},examNo:String(1001+i)};st.students.push(s);
    if(withUsers){const salt=uid();st.users.push({id:'du'+i,demo:true,username:'student'+(i+1),name:nm,role:'student',studentId:sid,salt,hash:hashPw(salt,'123456')})}
    t.axes.forEach(a=>a.goals.forEach(g=>{if(g.year>1)return;let v=0;for(let m=0;m<=4;m++){const d=addDays(addMonths(start,m),14);if(d>now)break;v=clamp(Math.round(v+(8+Math.random()*16)*speed),0,100);st.history.push({id:'d'+uid(),sid,gid:g.id,date:iso(d),value:v})}s.progress[g.id]=v}))});
  seedDemoExams(st,withUsers);
  const ts=[['حل 20 مسألة على الحلقات والشروط',0,'وظيفة برمجية',0,0,-75],['بحث: كيف تُمثَّل الأعداد السالبة في الذاكرة؟',0,'بحث',2,1,-50],['برنامج آلة حاسبة باستخدام الدوال',0,'وظيفة برمجية',0,1,-20],['تقرير: قراءة مخرجات المترجم لحلقة for',0,'تقرير',3,0,10],['دارة قراءة حساس حرارة بـ Arduino',1,'مشروع',0,1,-60],['بحث: أنواع المحركات ومشغلاتها',1,'بحث',1,0,-30],['تقرير قياسات المخبر بالأوسيلوسكوب',1,'تقرير',1,0,12]];
  ts.forEach(([title,ti,type,ai,gi,dd])=>{const t=st.tracks[ti];if(!t)return;const g=t.axes[ai].goals[gi];const task={id:'d'+uid(),demo:true,title,type,trackId:t.id,goalId:g.id,due:iso(addDays(now,dd)),desc:'',created:iso(addDays(now,dd-14))};st.tasks.push(task);
    st.students.filter(s=>s.trackId===t.id).forEach(s=>{if(dd>0&&Math.random()<.6)return;if(Math.random()<.15)return;const graded=dd<0&&Math.random()<.8;st.subs.push({id:'d'+uid(),demo:true,taskId:task.id,sid:s.id,date:iso(addDays(now,dd-Math.floor(Math.random()*4))),note:'',link:'',files:[],status:graded?'graded':'submitted',score:graded?Math.round(55+Math.random()*45):null,feedback:graded?'عمل جيد، انتبه لتنظيم الكود.':''})})});
  for(let k=0;k<14;k++){const d=addDays(start,7*k+3);if(d>now)break;st.sessions.push({id:'d'+uid(),demo:true,date:iso(d),topic:['مدخل إلى C++','الذاكرة والمتغيرات','الحلقات','الدوال','المصفوفات','المؤشرات','مختبر Arduino','الأنظمة العددية','قراءة لغة التجميع','حل مسائل جماعي'][k%10],hours:3,trackId:'',present:st.students.filter(()=>Math.random()<.87).map(s=>s.id)})}
  const tpl=surveyTemplate('monthly');const sv={id:'d'+uid(),demo:true,...tpl,anonymous:false,trackId:'',status:'open',deadline:iso(addDays(now,5)),created:iso(addDays(now,-6))};st.surveys.push(sv);
  if(withUsers){const pos=['الجلسات العملية ممتازة ومفيدة','المرشد متعاون جداً','أحببت تحديات البرمجة','الشرح واضح والتمارين ممتعة','تعلمت الكثير عن الذاكرة'],neg=['الوظائف كثيرة وقت الامتحانات','أحتاج وقتاً أطول للوظائف','بعض الشرح سريع وصعب','أقترح جلسات مراجعة إضافية','المراجع العربية قليلة'];
    st.students.forEach((s,i)=>{if(i>9)return;const u=st.users.find(x=>x.studentId===s.id);const base=2+Math.random()*3;const sc=()=>clamp(Math.round(base+(Math.random()*2-1)),1,5);
      const ans={};sv.questions.forEach((q,qi)=>{if(q.type==='scale')ans[q.id]=qi===2?clamp(sc()-1,1,5):sc();else if(q.type==='rating')ans[q.id]=clamp(Math.round(base*2+Math.random()*2),1,10);else if(q.type==='single')ans[q.id]=q.options[Math.floor(Math.random()*q.options.length)];else if(q.type==='multi')ans[q.id]=q.options.filter(()=>Math.random()<.4);else if(q.type==='text')ans[q.id]=qi===7?pos[i%5]:neg[i%5]});
      st.participation.push({surveyId:sv.id,userId:u.id,date:iso(addDays(now,-Math.floor(Math.random()*5)))});st.responses.push({id:'d'+uid(),surveyId:sv.id,sid:s.id,trackId:s.trackId,answers:ans,date:today()})})}
  st.activity.unshift({id:uid(),t:'حُمِّلت بيانات تجريبية لتجربة المنصة',d:new Date().toISOString()});
  st.notifications.unshift({id:'d'+uid(),demo:true,title:'مرحباً بكم في منصة الإيفاد 👋',body:'هنا تجدون وظائفكم واختباراتكم واستبياناتكم. أول اختبار تجريبي متاح الآن في تبويب «الاختبارات»، ورقمك الامتحاني تجده عند المشرف.',target:'all',trackId:'',sid:'',createdAt:new Date().toISOString()});
}
function seedDemoExams(st,withUsers){
  const Q=(text,options,correct,explanation='')=>({id:uid(),text,options,correct,points:1,sec:null,explanation});
  const e1={id:'d'+uid(),demo:true,title:'اختبار: أساسيات C++ والذاكرة',desc:'10 دقائق لكامل الاختبار. اقرأ كل سؤال بعناية.',trackId:'',status:'open',timerMode:'total',totalMinutes:10,perQuestionSec:60,passMark:50,showAnswers:true,shuffle:false,created:today(),questions:[
    Q('كم بايت يشغل المتغير من النوع <b>int</b> عادةً على الحواسيب الحديثة؟',['1','2','4','8'],2,'في أغلب المترجمات الحديثة يكون int بحجم 32 بت = 4 بايت.'),
    Q('ما ناتج <code>7 / 2</code> في C++ إذا كان العددان من النوع int؟',['3.5','3','4','خطأ في الترجمة'],1,'القسمة بين عددين صحيحين تعطي عدداً صحيحاً وتُهمل الكسر.'),
    Q('ماذا يخزّن المؤشر؟',['قيمة المتغير','عنوان في الذاكرة','اسم المتغير','نوع المتغير'],1,'المؤشر يخزن عنوان موقع في الذاكرة.'),
    Q('ما تمثيل العدد 13 في النظام الثنائي؟',['1101','1011','1110','1001'],0,'13 = 8 + 4 + 1 = 1101'),
    Q('أي حلقة تُنفَّذ مرة واحدة على الأقل؟',['for','while','do-while','لا شيء مما سبق'],2,'do-while تفحص الشرط بعد التنفيذ.')]};
  const e2={id:'d'+uid(),demo:true,title:'اختبار سريع: الأنظمة العددية',desc:'لكل سؤال 30 ثانية، ولا يمكن الرجوع للسؤال السابق.',trackId:'',status:'open',timerMode:'perQuestion',totalMinutes:null,perQuestionSec:30,passMark:60,showAnswers:true,shuffle:true,created:today(),questions:[
    Q('العدد الست عشري <b>0xFF</b> يساوي بالعشري:',['15','255','256','16'],1),Q('كم بت في البايت الواحد؟',['4','8','16','32'],1),Q('العدد الثنائي 1000 يساوي:',['8','4','16','10'],0)]};
  st.exams.push(e1,e2);
  if(withUsers){st.students.forEach((s,i)=>{if(i>8)return;const u=st.users.find(x=>x.studentId===s.id);if(!u)return;const ans={};e1.questions.forEach(q=>{ans[q.id]=Math.random()<.35+i*.06?q.correct:(q.correct+1)%q.options.length});
    const g=gradeAttempt(e1,ans);const dur=180+Math.round(Math.random()*400);const fin=new Date(Date.now()-86400000*(1+i%3));
    st.attempts.push({id:'d'+uid(),demo:true,examId:e1.id,sid:s.id,userId:u.id,status:'submitted',startedAt:new Date(fin-dur*1000).toISOString(),finishedAt:fin.toISOString(),duration:dur,score:g.score,max:g.max,answers:ans,late:false})})}
}

/* ================= model helpers ================= */
const trackOf=s=>S.tracks.find(t=>t.id===(s&&s.trackId));
const goalsOf=t=>t?t.axes.flatMap(a=>a.goals):[];
const stuById=id=>S.students.find(s=>s.id===id);
const taskById=id=>S.tasks.find(t=>t.id===id);
function goalById(gid){for(const t of S.tracks)for(const a of t.axes)for(const g of a.goals)if(g.id===gid)return{t,a,g};return null}
function goalVal(s,gid,date){if(!date)return +((s.progress||{})[gid]||0);let v=0,best='';for(const h of S.history)if(h.sid===s.id&&h.gid===gid&&h.date<=date&&h.date>=best){best=h.date;v=h.value}return v}
function wavg(goals,s,date){let W=0,V=0;for(const g of goals){const w=+g.weight||1;W+=w;V+=w*goalVal(s,g.id,date)}return W?Math.round(V/W):0}
const studentPct=(s,date)=>wavg(goalsOf(trackOf(s)),s,date);
const axisPct=(s,a,date)=>wavg(a.goals,s,date);
const progYears=d=>Math.max(0,(parseD(d||today())-parseD(S.settings.startDate))/(365.25*864e5));
const elapsedPct=()=>Math.round(clamp(progYears()/(+S.settings.years||5)*100));
const curYear=()=>Math.min(+S.settings.years||5,Math.floor(progYears())+1);
function expectedPct(s){const gs=goalsOf(trackOf(s)),y=progYears();let W=0,E=0;for(const g of gs){const w=+g.weight||1;W+=w;E+=w*clamp(y-(g.year-1),0,1)*100}return W?Math.round(E/W):0}
function status(s){const d=studentPct(s)-expectedPct(s);return d>=5?['متقدم','b-ok']:d>=-10?['ضمن الخطة','b-info']:['متأخر','b-bad']}
const tasksFor=s=>S.tasks.filter(t=>!t.trackId||t.trackId===s.trackId);
const subOf=(tid,sid)=>S.subs.find(x=>x.taskId===tid&&x.sid===sid);
function attendance(s,from,to){const ss=S.sessions.filter(x=>(!x.trackId||x.trackId===s.trackId)&&x.date>=(s.joined||'')&&(!from||x.date>=from)&&(!to||x.date<=to));return ss.length?Math.round(ss.filter(x=>(x.present||[]).includes(s.id)).length*100/ss.length):null}
function avgScore(subs){const g=subs.filter(x=>x.status==='graded'&&x.score!=null);return g.length?Math.round(g.reduce((a,x)=>a+ +x.score,0)/g.length):null}
function submitRate(s){const due=tasksFor(s).filter(t=>t.due<=today());return due.length?Math.round(due.filter(t=>subOf(t.id,s.id)).length*100/due.length):null}
const isStaff=()=>ME&&ME.role!=='student';
const isDev=()=>ME&&ME.role==='dev';
const isAdmin=()=>isStaff();
const myStudent=()=>ME&&ME.studentId?stuById(ME.studentId):null;
function log(t){S.activity.unshift({id:uid(),t,d:new Date().toISOString(),by:ME?ME.name:''});if(API.mode==='demo')S.activity=S.activity.slice(0,200)}
// الاستبيانات
const svTargets=sv=>S.students.filter(s=>!sv.trackId||s.trackId===sv.trackId);
const svParts=id=>S.participation.filter(p=>p.surveyId===id);
const svResp=id=>S.responses.filter(r=>r.surveyId===id);
const answeredByMe=id=>S.participation.some(p=>p.surveyId===id&&p.userId===ME.id);
function mySurveys(){const s=myStudent();return S.surveys.filter(v=>v.status!=='draft'&&(!v.trackId||(s&&v.trackId===s.trackId)))}

/* ================= persistence ================= */
let syncState='ok';
function setSync(s){syncState=s;const el=$('#sync');if(el){el.className='sync '+s;el.lastElementChild.textContent=s==='ok'?(API.mode==='supabase'?'متصل: محفوظ على الخادم':'تجريبي: محفوظ في هذا المتصفح'):s==='saving'?'جارٍ الحفظ…':'تعذّر الحفظ'}}
const snap=()=>JSON.parse(JSON.stringify(S));
async function mutate(fn){const prev=snap();fn(S);render();setSync('saving');
  try{await API.commit(prev,S);setSync('ok');return true}
  catch(e){console.error(e);setSync('err');toast('تعذّر الحفظ: '+errMsg(e),'err');await reload();return false}}
async function reload(){try{const st=await API.loadAll();if(st){S=normalize(st);if(ME){const me=S.users.find(u=>u.id===ME.id);if(me)ME=me}}}catch(e){console.error(e);toast('تعذّر تحميل البيانات: '+errMsg(e),'err')}render()}

/* ================= UI helpers ================= */
function toast(t,cls=''){const el=$('#toast');el.textContent=t;el.className='toast show '+cls;clearTimeout(el._t);el._t=setTimeout(()=>el.className='toast',3200)}
function modal(html,wide){const m=$('#modal');m.innerHTML=`<div class="mbox ${wide?'wide':''}">${html}</div>`;m.classList.add('open');return m.firstElementChild}
function closeModal(){const m=$('#modal');m.classList.remove('open');m.innerHTML=''}
const mhead=t=>`<div class="mhead"><h2>${t}</h2><button class="icon-btn" data-close>×</button></div>`;
function field(f){const v=esc(f.value??''),req=f.required?'required':'',full=f.full?'full':'';
  if(f.type==='select')return `<label class="${full}">${f.label}<select name="${f.name}" ${req}>${f.options.map(o=>{const[val,lab]=Array.isArray(o)?o:[o,o];return `<option value="${esc(val)}" ${String(val)===String(f.value??'')?'selected':''}>${esc(lab)}</option>`}).join('')}</select>${f.hint?`<span class="hint">${f.hint}</span>`:''}</label>`;
  if(f.type==='textarea')return `<label class="${full||'full'}">${f.label}<textarea name="${f.name}" rows="${f.rows||3}" ${req}>${v}</textarea></label>`;
  if(f.type==='file')return `<label class="${full||'full'}">${f.label}<input type="file" name="${f.name}" ${f.multiple?'multiple':''} ${f.accept?`accept="${f.accept}"`:''} ${req}>${f.hint?`<span class="hint">${f.hint}</span>`:''}</label>`;
  if(f.type==='checkbox')return `<label class="ck ${full}"><input type="checkbox" name="${f.name}" ${f.value?'checked':''}> ${f.label}</label>`;
  if(f.type==='html')return f.html;
  return `<label class="${full}">${f.label}<input type="${f.type||'text'}" name="${f.name}" value="${v}" ${req} ${f.min!=null?`min="${f.min}"`:''} ${f.max!=null?`max="${f.max}"`:''} ${f.step?`step="${f.step}"`:''} ${f.ltr?'dir="ltr"':''} placeholder="${esc(f.ph||'')}" ${f.ac?`autocomplete="${f.ac}"`:''}>${f.hint?`<span class="hint">${f.hint}</span>`:''}</label>`}
function formModal({title,fields,submit='حفظ',onSubmit,wide}){
  const box=modal(mhead(title)+`<form class="fgrid">${fields.map(field).join('')}<div class="factions"><button class="btn pri">${submit}</button><button type="button" class="btn" data-close>إلغاء</button></div></form>`,wide);
  const form=$('form',box);form.onsubmit=async e=>{e.preventDefault();const fd=new FormData(form),d={};
    fields.forEach(f=>{if(!f.name)return;if(f.type==='file')d[f.name]=fd.getAll(f.name).filter(x=>x&&x.size);else if(f.type==='checkbox')d[f.name]=fd.get(f.name)==='on';else d[f.name]=String(fd.get(f.name)??'').trim()});
    const btn=$('button.pri',form);btn.disabled=true;try{const r=await onSubmit(d,form);if(r!==false)closeModal()}catch(err){toast(errMsg(err),'err')}finally{btn.disabled=false}};
  return box}
function confirmBox(text,onYes,yes='حذف'){const b=modal(mhead('تأكيد')+`<p>${text}</p><div class="factions"><button class="btn pri" style="background:var(--bad);border-color:var(--bad)" data-yes>${yes}</button><button class="btn" data-close>إلغاء</button></div>`);$('[data-yes]',b).onclick=()=>{closeModal();onYes()}}
function readImage(file,max,q=.85,forceJpeg){return new Promise(res=>{if(!file)return res('');const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{const k=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);const png=!forceJpeg&&/png|svg/.test(file.type);res(c.toDataURL(png?'image/png':'image/jpeg',q))};img.onerror=()=>res('');img.src=fr.result};fr.readAsDataURL(file)})}
async function compressForUpload(f){if(!/^image\/(jpeg|png|webp)$/.test(f.type))return f;const du=await readImage(f,1600,.85,true);if(!du)return f;const b=await(await fetch(du)).blob();return b.size<f.size?new File([b],f.name.replace(/\.(png|webp)$/i,'.jpg'),{type:'image/jpeg'}):f}
const avatar=(s,cls='')=>`<span class="av ${cls}">${s&&s.photo?`<img src="${s.photo}" alt="">`:esc((s&&s.name||'?').trim()[0]||'?')}</span>`;
const pbar=(p,c)=>`<span class="pbar"><span><i style="width:${clamp(p||0)}%;${c?`background:${c}`:''}"></i></span><b>${p??0}%</b></span>`;
const ring=(p,c,lg,txt)=>`<span class="ring ${lg?'lg':''}" style="--p:${clamp(p||0)};${c?`--c:${c}`:''}" data-v="${txt!=null?txt:p==null?'—':p+'%'}"></span>`;
const kpi=(p,l,v,c,txt)=>`<div class="kpi">${ring(p,c,false,txt)}<div><div class="l">${l}</div>${v?`<div class="v">${v}</div>`:''}</div></div>`;
const tdot=t=>`<span class="tdot" style="background:${t?t.color:'#999'}"></span>`;
const subBadge=x=>!x?'<span class="badge b-mut">لم يُسلَّم</span>':x.status==='graded'?`<span class="badge b-ok">مُقيَّم ${x.score}%</span>`:x.status==='returned'?'<span class="badge b-warn">مُعاد للتعديل</span>':'<span class="badge b-info">بانتظار التقييم</span>';
function goalOptions(trackId){const o=[['','— بدون ربط —']];S.tracks.filter(t=>!trackId||t.id===trackId).forEach(t=>t.axes.forEach(a=>a.goals.forEach(g=>o.push([g.id,`${t.name} › ${a.name} › ${g.title}`]))));return o}
function chart(id,fn){PEND.push(()=>fn($('#'+id)))}
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
const csvCell=v=>{v=v==null?'':Array.isArray(v)?v.join('، '):typeof v==='object'?JSON.stringify(v):String(v);return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const toCSV=rows=>'﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
let JSZipP=null;function loadJSZip(){return JSZipP||(JSZipP=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';s.onload=()=>res(window.JSZip);s.onerror=()=>{JSZipP=null;rej(new Error('تعذّر تحميل مكتبة الضغط، تحقق من الإنترنت'))};document.head.appendChild(s)}))}

/* ================= layout ================= */
function navItems(){
  const unread=unreadCount();
  if(ME.role==='student'){const pendS=mySurveys().filter(v=>v.status==='open'&&!answeredByMe(v.id)).length;return [['home','home','الرئيسية'],['inbox','bell','الإشعارات',unread],['exams','exam','اختباراتي'],['my-tasks','task','وظائفي'],['surveys','survey','الاستبيانات',pendS],['my-progress','target','تقدّمي وأهدافي'],['reports','report','تقاريري']]}
  const pend=S.subs.filter(x=>x.status==='submitted').length;
  const a=[['home','home','الرئيسية'],['inbox','bell','الإشعارات',unread],['students','users','الطلاب'],['tracks','track','المسارات والأهداف'],['exams','exam','الاختبارات'],['tasks','task','الوظائف والأبحاث'],['subs','inbox','التسليمات',pend],['surveys','survey','الاستبيانات'],['sessions','cal','الجلسات والحضور'],['reports','report','التقارير'],['users','key','المستخدمون']];
  if(isDev())a.push(['settings','settings','الإعدادات']);return a}
function applyTheme(){const pi=PREFS.palette??S.settings.palette??0,p=PALETTES[pi]||PALETTES[0];const r=document.documentElement.style;r.setProperty('--side',p[0]);r.setProperty('--acc',p[1]);document.body.classList.toggle('dark',(PREFS.theme||S.settings.theme)==='dark');document.title=S.settings.name}
const ALLOWED_STUDENT=['home','my-tasks','my-progress','reports','surveys','exams','inbox'];
function render(){
  applyTheme();PEND=[];
  if(!ME){$('#root').innerHTML=vLogin();bindLogin();return}
  let base=ROUTE.split(':')[0];
  if(ME.role==='student'&&!ALLOWED_STUDENT.includes(base)){ROUTE=base='home'}
  if(!isDev()&&base==='settings'){ROUTE=base='home'}
  const V=VIEWS[base]||VIEWS.home;let body;
  try{body=V(ROUTE.split(':')[1])}catch(e){console.error(e);body=`<div class="panel">حدث خطأ في عرض الصفحة: ${esc(e.message)}</div>`}
  const st=myStudent(),pi=PREFS.palette??S.settings.palette??0,th=PREFS.theme||S.settings.theme;
  const onNav=r=>base===r||(base==='student'&&r==='students')||(base==='track'&&r==='tracks')||(base==='survey'&&r==='surveys')||(base==='exam'&&r==='exams');const unr=unreadCount();
  $('#root').innerHTML=`<button class="btn mtoggle noprint" data-act="menu" aria-label="القائمة">${ic('menu')}</button><div class="app"><aside class="side" id="side">
    <div class="brand"><div class="lg">${logoHTML()}</div><b>${esc(S.settings.name)}</b></div>
    <div class="cap">مساحة العمل</div><nav class="nav">${navItems().map(([r,i,l,cnt])=>`<a href="#${r}" class="${onNav(r)?'on':''}">${ic(i)}<span>${l}</span>${cnt?`<span class="cnt">${cnt}</span>`:''}</a>`).join('')}</nav>
    <div class="bottom">
      <div class="sbox"><div class="t">لون الواجهة</div><div class="dots">${PALETTES.map((p,i)=>`<button style="background:${p[1]}" class="${pi===i?'on':''}" data-act="palette" data-i="${i}" title="لون ${i+1}"></button>`).join('')}</div></div>
      <div class="sbox"><div class="t">سمة الواجهة</div><div class="seg"><button class="${th!=='dark'?'on':''}" data-act="theme" data-v="light">☀ نهاري</button><button class="${th==='dark'?'on':''}" data-act="theme" data-v="dark">☾ ليلي</button></div></div>
      <div class="sbox"><div class="me">${avatar(st||{name:ME.name})}<div style="flex:1;min-width:0"><b>${esc(ME.name)}</b><small>${ROLES[ME.role]}</small></div><button class="icon-btn" style="color:#e9e2d2" title="تغيير كلمة المرور" data-act="mypw">${ic('key')}</button><button class="icon-btn" style="color:#e9e2d2" title="خروج" data-act="logout">${ic('logout')}</button></div>
      <div class="sync ${syncState}" id="sync"><i></i><span></span></div></div>
    </div></aside><main><a class="bell noprint" href="#inbox" title="الإشعارات">${ic('bell')}${unr?`<b>${unr}</b>`:''}</a>${DEMO?`<div class="banner noprint">🧪 <span><b>الوضع التجريبي:</b> البيانات محفوظة في هذا المتصفح فقط. لربط المنصة بـ Supabase ضع بياناته في <code>js/config.js</code>.</span></div>`:''}${ME.mustChange?`<div class="banner noprint">🔐 أنت تستخدم كلمة المرور الافتراضية، غيّرها الآن.<button class="btn sm" data-act="mypw">تغيير كلمة المرور</button></div>`:''}${body}</main></div>`;
  setSync(syncState);
  const run=()=>PEND.forEach(f=>{try{f()}catch(e){console.error(e)}});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(run);else run();
}
function hero(title,sub,chips,search=true){
  return `<section class="hero">${S.settings.hero?`<div class="bgimg" style="background-image:url(${S.settings.hero})"></div>`:'<div class="pat"></div>'}<div class="veil"></div>
  <div class="hlogo">${logoHTML()}</div><h1>${esc(title)}</h1><div class="sub">${esc(sub)}</div>
  ${search?`<div class="hsearch noprint"><input id="gsearch" placeholder="ابحث عن طالب، وظيفة، هدف، استبيان…" autocomplete="off"><span class="sbtn">${ic('search')}</span><div class="sres" id="sres"></div></div>`:''}
  ${chips?`<div class="chips">${chips}</div>`:''}</section>`}

/* ================= views ================= */
function vLogin(){return `<div class="login"><div class="box"><div class="lg">${logoHTML()}</div><h1>${esc(S.settings.name)}</h1><div class="muted">${esc(S.settings.subtitle)}</div>
  <form id="loginF"><input name="u" placeholder="اسم المستخدم" autocomplete="username" required dir="ltr" autocapitalize="none"><input name="p" type="password" placeholder="كلمة المرور" autocomplete="current-password" required dir="ltr"><div class="err" id="lerr"></div><button class="btn pri" style="justify-content:center;padding:10px">دخول</button></form>
  ${DEMO?`<p class="muted" style="margin-top:14px;font-size:13px">الوضع التجريبي — المطور: <b dir="ltr">dev</b> / <b dir="ltr">dev12345</b> · المشرف: <b dir="ltr">admin</b> / <b dir="ltr">admin123</b><br>الطلاب: <b dir="ltr">student1</b> … <b dir="ltr">student12</b> — كلمة المرور <b dir="ltr">123456</b> — الأرقام الامتحانية 1001 … 1012</p>`:''}</div></div>`}
function bindLogin(){$('#loginF').onsubmit=async e=>{e.preventDefault();const f=e.target,btn=$('button',f);btn.disabled=true;$('#lerr').textContent='';
  try{const me=await API.login(f.u.value,f.p.value);ME=me;await afterLogin();ROUTE='home';if(location.hash!=='#home')location.hash='home';else render()}
  catch(err){$('#lerr').textContent=errMsg(err)}finally{btn.disabled=false}}}
let subscribed=false,rlT=null;
async function afterLogin(){
  if(API.mode==='supabase'){const st=await API.loadAll();const hadSettings=!!st.settings;S=normalize(st);ME=S.users.find(u=>u.id===ME.id)||ME;
    if(isDev()&&!hadSettings&&!S.tracks.length){await mutate(S=>{S.settings={...defaultSettings(),initialized:today()};S.tracks=seedTracks();log('تم تجهيز المنصة لأول مرة')})}
    if(!subscribed){subscribed=true;API.subscribe(()=>{clearTimeout(rlT);rlT=setTimeout(async()=>{if(RUN||$('#modal').classList.contains('open')||(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)))return;const before=unreadCount();UI.myEx=null;await reload();const after=unreadCount();if(after>before){const n=myNotifs().find(x=>!isRead(x.id));if(n)toast('📬 إشعار جديد: '+n.title)}},1500)})}}
  else{ME=S.users.find(u=>u.id===ME.id)||ME}
}

VIEWS.home=()=>{
  if(ME.role==='student')return vStudentHome();
  const st=S.students,n=st.length,avg=n?Math.round(st.reduce((a,s)=>a+studentPct(s),0)/n):0,exp=n?Math.round(st.reduce((a,s)=>a+expectedPct(s),0)/n):0;
  const rates=st.map(submitRate).filter(x=>x!=null),sr=rates.length?Math.round(rates.reduce((a,b)=>a+b,0)/rates.length):null;
  const ats=st.map(s=>attendance(s)).filter(x=>x!=null),at=ats.length?Math.round(ats.reduce((a,b)=>a+b,0)/ats.length):null;
  const goals=S.tracks.reduce((a,t)=>a+goalsOf(t).length,0),pend=S.subs.filter(x=>x.status==='submitted').length,openSv=S.surveys.filter(v=>v.status==='open').length;
  const demo=S.students.some(s=>s.demo);
  const card=(r,i,t,d)=>`<a class="scard" href="#${r}">${ic(i)}<b>${t}</b><small>${d}</small></a>`;
  chart('cStu',cv=>bars3D(cv,[...st].sort((a,b)=>studentPct(b)-studentPct(a)).map(s=>({label:s.name.split(' ')[0],value:studentPct(s),color:(trackOf(s)||{}).color,id:s.id})),{rot:st.length>10,onClick:it=>go('student:'+it.id)}));
  const tItems=S.tracks.map(t=>({label:t.name,value:st.filter(s=>s.trackId===t.id).length,color:t.color})).filter(x=>x.value);
  chart('cTr',cv=>pie3D(cv,tItems,{hole:String(n)}));
  const sb=[['مُقيَّمة',S.subs.filter(x=>x.status==='graded').length,'#2f855a'],['بانتظار التقييم',pend,'#2b6cb0'],['مُعادة',S.subs.filter(x=>x.status==='returned').length,'#b7791f']].map(([label,value,color])=>({label,value,color})).filter(x=>x.value);
  chart('cSub',cv=>pie3D(cv,sb,{height:220}));
  return `${demo?`<div class="banner noprint">🧪 تعرض المنصة بيانات تجريبية. يمكنك مسحها من الإعدادات عند البدء الفعلي.${isDev()?'<a class="btn sm" href="#settings">الإعدادات</a>':''}</div>`:''}
  ${hero(S.settings.name,S.settings.subtitle,`<span class="chip"><b>${n}</b> طالباً</span><span class="chip"><b>${S.tracks.length}</b> مسار</span><span class="chip"><b>${goals}</b> هدفاً</span><span class="chip"><b>${S.tasks.length}</b> وظيفة</span><span class="chip">السنة <b>${curYear()}</b> من ${S.settings.years}</span>`)}
  <div class="home-grid"><section class="panel"><div class="ph"><h3>الأقسام</h3></div>
    <div class="gtitle">الطلاب والمسارات</div><div class="cards">${card('students','users','الطلاب','الملفات والتقدم والحالة')}${card('tracks','track','المسارات والأهداف','المحاور العلمية والأهداف')}${card('sessions','cal','الجلسات والحضور','سجل التدريب والغياب')}</div>
    <div class="gtitle">العمل والتقييم</div><div class="cards">${card('tasks','task','الوظائف والأبحاث','إسناد المهام للطلاب')}${card('subs','inbox','التسليمات',pend?pend+' بانتظار التقييم':'مراجعة وتقييم')}${card('exams','exam','الاختبارات',S.exams.filter(e=>e.status==='open').length+' مفتوح الآن')}${card('surveys','survey','الاستبيانات',openSv?openSv+' مفتوح الآن':'إنشاء وتحليل')}${card('reports','report','التقارير','أسبوعية، شهرية، ربعية، سنوية')}${card('inbox','bell','الإشعارات','تعاميم للطلاب')}${card('users','key','المستخدمون','الحسابات والصلاحيات')}${isDev()?card('settings','settings','الإعدادات','الشعار والهوية والنسخ الاحتياطي'):''}</div></section>
  <aside class="panel"><div class="ph"><h3>آخر النشاطات</h3></div><div class="act">${S.activity.slice(0,12).map(a=>`<div class="it">${esc(a.t)}<small>${ago(a.d)}${a.by?' · '+esc(a.by):''}</small></div>`).join('')||'<div class="muted">لا نشاطات بعد</div>'}</div></aside></div>
  <div class="kpis">${kpi(avg,'متوسط إنجاز الطلاب','من مجموع أهداف المسارات')}${kpi(exp,'الإنجاز المتوقع حتى الآن','حسب سنة كل هدف','var(--gold)')}${kpi(elapsedPct(),'الزمن المنقضي من البرنامج',`${S.settings.years} سنوات`,'#8a94a0')}${kpi(sr,'نسبة تسليم الوظائف','المستحقة حتى اليوم','#2b6cb0')}${kpi(at,'نسبة الحضور','في جلسات التدريب','#2f855a')}</div>
  <div class="grid2"><section class="panel"><h3>نسبة إنجاز كل طالب</h3>${n?'<div class="cwrap"><canvas id="cStu"></canvas></div><p class="muted" style="margin:6px 0 0">اضغط على عمود لفتح ملف الطالب.</p>':'<div class="empty">لا يوجد طلاب بعد</div>'}</section>
  <section class="panel"><h3>توزع الطلاب على المسارات</h3>${tItems.length?'<div class="cwrap"><canvas id="cTr"></canvas></div>'+legend(tItems):'<div class="empty">لا بيانات</div>'}</section></div>
  <div class="grid2"><section class="panel"><h3>الهدف النهائي للبرنامج</h3><div class="note">${esc(S.settings.finalGoal)}</div>${timeline(avg)}</section>
  <section class="panel"><h3>حالة التسليمات</h3>${sb.length?'<div class="cwrap"><canvas id="cSub"></canvas></div>'+legend(sb):'<div class="empty">لا تسليمات بعد</div>'}</section></div>`};
function timeline(ach){const Y=+S.settings.years||5;return `<div class="tl"><div class="el" style="width:${elapsedPct()}%"></div><div class="ach" style="width:${clamp(ach)}%"></div>${Array.from({length:Y},(_,i)=>`<span class="yr" style="inset-inline-start:${(i+.5)/Y*100}%;transform:translateX(50%)">السنة ${i+1}</span>${i?`<span class="tick" style="inset-inline-start:${i/Y*100}%"></span>`:''}`).join('')}</div>
  <div class="legend"><span><i style="background:var(--acc)"></i>الإنجاز الفعلي ${ach}%</span><span><i style="background:var(--gold)"></i>الزمن المنقضي ${elapsedPct()}%</span></div>`}
function vStudentHome(){const s=myStudent();if(!s)return `<div class="panel">هذا الحساب غير مرتبط بطالب. راجع مدير البرنامج.</div>`;
  const t=trackOf(s),p=studentPct(s),e=expectedPct(s),[stl]=status(s);
  const open=tasksFor(s).filter(x=>{const b=subOf(x.id,s.id);return !b||b.status==='returned'}).sort((a,b)=>a.due.localeCompare(b.due));
  const svs=mySurveys().filter(v=>v.status==='open'&&!answeredByMe(v.id));
  chart('cAx',cv=>bars3D(cv,(t?t.axes:[]).map(a=>({label:a.name,value:axisPct(s,a),color:t.color}))));
  return hero('أهلاً '+s.name.split(' ')[0],t?t.name:'',`<span class="chip">الحالة: <b>${stl}</b></span><span class="chip">السنة <b>${curYear()}</b> من ${S.settings.years}</span>`,false)+
  (svs.length?`<div class="banner noprint">📋 لديك ${svs.length} استبيان بانتظار إجابتك.<a class="btn sm" href="#surveys">أجب الآن</a></div>`:'')+
  `<div class="kpis">${kpi(p,'إنجازي الكلي','من أهداف المسار')}${kpi(e,'المتوقع حتى الآن','','var(--gold)')}${kpi(submitRate(s),'نسبة تسليم وظائفي','','#2b6cb0')}${kpi(attendance(s),'نسبة حضوري','','#2f855a')}${kpi(avgScore(S.subs.filter(x=>x.sid===s.id)),'متوسط علاماتي','','#6b4bb0')}</div>
  <div class="grid2"><section class="panel"><h3>إنجازي في محاور المسار</h3><div class="cwrap"><canvas id="cAx"></canvas></div></section>
  <section class="panel"><div class="ph"><h3>وظائف تنتظرني</h3><a class="btn sm" href="#my-tasks">كل الوظائف</a></div>${open.slice(0,6).map(x=>`<div class="file"><span><b>${esc(x.title)}</b><br><small class="muted">${esc(x.type)} · التسليم ${fmtD(x.due)}</small></span>${x.due<today()?'<span class="badge b-bad">متأخرة</span>':''}<button class="btn sm gold" data-act="submit" data-id="${x.id}">${ic('upload')} تسليم</button></div>`).join('')||'<div class="empty">لا وظائف معلّقة 🎉</div>'}</section></div>
  ${t?`<section class="panel"><h3>الهدف النهائي لمساري</h3><div class="note">${esc(t.finalGoal)}</div>${timeline(p)}</section>`:''}`}

VIEWS.students=()=>{
  const f=UI.sf||{q:'',t:''};const list=S.students.filter(s=>(!f.t||s.trackId===f.t)&&(!f.q||s.name.includes(f.q)));
  return `<div class="pagehead"><div><h2>الطلاب</h2><div class="sub">${S.students.length} طالباً في البرنامج</div></div><div class="tools noprint"><input id="sq" placeholder="بحث بالاسم" value="${esc(f.q)}"><select id="st"><option value="">كل المسارات</option>${S.tracks.map(t=>`<option value="${t.id}" ${f.t===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select><button class="btn" data-act="genExamNos" title="لمن ليس لديه رقم">${ic('exam')} توليد أرقام امتحانية</button><button class="btn pri" data-act="addStudent">${ic('plus')} إضافة طالب</button></div></div>
  <section class="panel"><div class="tw"><table><thead><tr><th>الطالب</th><th>الرقم الامتحاني</th><th>المسار</th><th>المرشد</th><th>الإنجاز</th><th>المتوقع</th><th>الحالة</th><th>التسليم</th><th>الحضور</th><th>متوسط العلامات</th></tr></thead><tbody>
  ${list.map(s=>{const t=trackOf(s),[a,b]=status(s),sr=submitRate(s),at=attendance(s),av=avgScore(S.subs.filter(x=>x.sid===s.id));return `<tr class="click" data-go="student:${s.id}"><td><div class="who">${avatar(s)}<b>${esc(s.name)}</b></div></td><td dir="ltr" style="text-align:right">${esc(s.examNo)||'—'}</td><td>${tdot(t)}${esc(t?t.name:'—')}</td><td>${esc(s.mentor)||'—'}</td><td>${pbar(studentPct(s),t&&t.color)}</td><td>${expectedPct(s)}%</td><td><span class="badge ${b}">${a}</span></td><td>${sr==null?'—':sr+'%'}</td><td>${at==null?'—':at+'%'}</td><td>${av==null?'—':av+'%'}</td></tr>`}).join('')}
  </tbody></table></div>${list.length?'':'<div class="empty">لا يوجد طلاب</div>'}</section>`};
VIEWS.student=id=>{const s=stuById(id);return s?studentDetail(s):'<div class="panel">الطالب غير موجود</div>'};
VIEWS['my-progress']=()=>{const s=myStudent();return s?studentDetail(s):'<div class="panel">الحساب غير مرتبط بطالب</div>'};
function studentDetail(s){
  const t=trackOf(s),p=studentPct(s),e=expectedPct(s),[stl,stc]=status(s),subs=S.subs.filter(x=>x.sid===s.id),staff=isStaff();
  const months=[];const st=parseD(s.joined||S.settings.startDate);let d=new Date(st.getFullYear(),st.getMonth(),1);const now=new Date();while(d<=now){const end=new Date(d.getFullYear(),d.getMonth()+1,0);months.push({label:MONTHS[d.getMonth()],value:studentPct(s,iso(end>now?now:end)),color:'#b98a3e'});d=new Date(d.getFullYear(),d.getMonth()+1,1)}
  chart('cAx',cv=>bars3D(cv,(t?t.axes:[]).map(a=>({label:a.name,value:axisPct(s,a),color:t.color})),{height:280}));
  chart('cMo',cv=>bars3D(cv,months.slice(-12),{height:280}));
  const notes=S.notes.filter(n=>n.sid===s.id&&n.text).sort((a,b)=>b.key.localeCompare(a.key));
  const acc=S.users.find(u=>u.studentId===s.id);
  return `<div class="pagehead noprint"><div class="tools">${staff?`<a class="btn" href="#students">→ الطلاب</a>`:''}</div><div class="tools">${staff?`<button class="btn" data-act="editStudent" data-id="${s.id}">${ic('edit')} تعديل</button>`:''}<a class="btn" href="#reports" data-act="reportFor" data-id="${s.id}">${ic('report')} تقرير</a>${isAdmin()?`<button class="btn danger" data-act="delStudent" data-id="${s.id}">${ic('trash')} حذف</button>`:''}</div></div>
  <section class="panel"><div class="prof">${avatar(s,'lg')}<div style="flex:1;min-width:200px"><h2>${esc(s.name)}</h2><div class="muted">${tdot(t)}${esc(t?t.name:'بدون مسار')} · المرشد: ${esc(s.mentor)||'—'} · ${esc(s.uni)||''} ${s.phone?'· '+esc(s.phone):''}</div><div style="margin-top:6px"><span class="badge ${stc}">${stl}</span> <span class="muted">انضم في ${fmtD(s.joined)}${s.examNo?' · الرقم الامتحاني: <b dir="ltr">'+esc(s.examNo)+'</b>':''}</span>${staff?` · <span class="muted">${acc?'حساب الدخول: <b dir="ltr">'+esc(acc.username)+'</b>':'لا يوجد حساب دخول'}</span>`:''}</div></div>${ring(p,t&&t.color,true)}</div></section>
  <div class="kpis">${kpi(p,'الإنجاز الكلي','',t&&t.color)}${kpi(e,'المتوقع حتى الآن','','var(--gold)')}${kpi(submitRate(s),'نسبة التسليم',`${subs.length} تسليماً`,'#2b6cb0')}${kpi(attendance(s),'الحضور','','#2f855a')}${kpi(avgScore(subs),'متوسط العلامات','','#6b4bb0')}</div>
  <div class="grid2e"><section class="panel"><h3>الإنجاز في المحاور العلمية</h3><div class="cwrap"><canvas id="cAx"></canvas></div></section><section class="panel"><h3>تطور الإنجاز شهرياً</h3><div class="cwrap"><canvas id="cMo"></canvas></div></section></div>
  <section class="panel"><div class="ph"><h3>المحاور والأهداف</h3>${staff?'<span class="muted">حرّك المؤشر لتحديث نسبة إنجاز الهدف، ويُسجَّل التغيير بتاريخ اليوم.</span>':''}</div>
  ${t?t.axes.map(a=>`<div class="axis"><div class="ah">${esc(a.name)} ${pbar(axisPct(s,a),t.color)}</div>${a.goals.map(g=>{const v=goalVal(s,g.id);return `<div class="goal"><div>${esc(g.title)}</div><span class="badge ${g.year<=curYear()?'b-info':'b-mut'} yr">السنة ${g.year}</span>${staff?`<div class="slider"><input type="range" min="0" max="100" step="5" value="${v}" data-act="goalv" data-sid="${s.id}" data-gid="${g.id}"><b>${v}%</b></div>`:pbar(v,t.color)}<span class="muted" style="font-size:12px">وزن ${g.weight}</span></div>`}).join('')}</div>`).join(''):'<div class="empty">الطالب غير مسجل في مسار</div>'}</section>
  <section class="panel"><h3>الوظائف والتسليمات</h3><div class="tw"><table><thead><tr><th>الوظيفة</th><th>النوع</th><th>الاستحقاق</th><th>الحالة</th><th></th></tr></thead><tbody>${tasksFor(s).sort((a,b)=>b.due.localeCompare(a.due)).map(x=>{const b=subOf(x.id,s.id);return `<tr><td>${esc(x.title)}</td><td>${esc(x.type)}</td><td>${fmtD(x.due)}</td><td>${subBadge(b)}</td><td>${b?`<button class="btn sm" data-act="review" data-id="${b.id}">عرض</button>`:''}</td></tr>`}).join('')}</tbody></table></div></section>
  ${staff?studentExamsSection(s):''}
  <section class="panel"><h3>ملاحظات المرشد الدورية</h3>${notes.map(n=>`<div style="margin-bottom:10px"><small class="muted">${esc(periodLabelFromKey(n.key))}</small><div class="note">${esc(n.text)}</div></div>`).join('')||'<div class="muted">تُكتب الملاحظات من صفحة التقارير.</div>'}</section>`}

VIEWS.tracks=()=>`<div class="pagehead"><div><h2>المسارات والأهداف</h2><div class="sub">كل مسار يتكون من محاور علمية، وكل محور من أهداف لها سنة ووزن</div></div>${isAdmin()?`<button class="btn pri noprint" data-act="addTrack">${ic('plus')} مسار جديد</button>`:''}</div>
  <div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${S.tracks.map(t=>{const ss=S.students.filter(s=>s.trackId===t.id),av=ss.length?Math.round(ss.reduce((a,s)=>a+studentPct(s),0)/ss.length):0;return `<a class="scard" href="#track:${t.id}" style="text-align:right;align-items:stretch;border-top:5px solid ${t.color}"><div style="display:flex;align-items:center;gap:12px">${ring(av,t.color)}<div><b style="font-size:17px">${esc(t.name)}</b><small style="display:block">${t.axes.length} محاور · ${goalsOf(t).length} هدفاً · ${ss.length} طالباً</small></div></div><small style="margin-top:8px">${esc(t.desc)}</small></a>`}).join('')||'<div class="empty">لا مسارات بعد</div>'}</div>`;
VIEWS.track=id=>{const t=S.tracks.find(x=>x.id===id);if(!t)return '<div class="panel">المسار غير موجود</div>';const ss=S.students.filter(s=>s.trackId===t.id),adm=isAdmin();
  const avgAx=a=>ss.length?Math.round(ss.reduce((x,s)=>x+axisPct(s,a),0)/ss.length):0;
  chart('cTA',cv=>bars3D(cv,t.axes.map(a=>({label:a.name,value:avgAx(a),color:t.color}))));
  const yrs=Array.from({length:+S.settings.years||5},(_,i)=>i+1);
  chart('cTY',cv=>bars3D(cv,yrs.map(y=>({label:'السنة '+y,value:goalsOf(t).filter(g=>+g.year===y).length,color:'#b98a3e'})),{unit:'',max:Math.max(4,...yrs.map(y=>goalsOf(t).filter(g=>+g.year===y).length))}));
  return `<div class="pagehead"><div><a class="btn noprint" href="#tracks">→ المسارات</a></div>${adm?`<div class="tools noprint"><button class="btn" data-act="editTrack" data-id="${t.id}">${ic('edit')} تعديل المسار</button><button class="btn pri" data-act="addAxis" data-id="${t.id}">${ic('plus')} محور جديد</button><button class="btn danger" data-act="delTrack" data-id="${t.id}">${ic('trash')}</button></div>`:''}</div>
  <section class="panel" style="border-top:5px solid ${t.color}"><h2 style="margin:0">${esc(t.name)}</h2><p class="muted">${esc(t.desc)}</p><h3>🎯 الهدف النهائي للمسار</h3><div class="note">${esc(t.finalGoal)}</div></section>
  <div class="grid2e"><section class="panel"><h3>متوسط إنجاز الطلاب في كل محور</h3><div class="cwrap"><canvas id="cTA"></canvas></div></section><section class="panel"><h3>توزع الأهداف على سنوات البرنامج</h3><div class="cwrap"><canvas id="cTY"></canvas></div></section></div>
  <section class="panel"><h3>المحاور العلمية والأهداف</h3>${t.axes.map(a=>`<div class="axis"><div class="ah">${esc(a.name)} <span class="muted" style="font-weight:500">${a.goals.length} أهداف</span>${pbar(avgAx(a),t.color)}${adm?`<span class="tools noprint"><button class="btn sm" data-act="addGoal" data-t="${t.id}" data-a="${a.id}">${ic('plus')} هدف</button><button class="btn sm" data-act="editAxis" data-t="${t.id}" data-a="${a.id}">${ic('edit')}</button><button class="btn sm danger" data-act="delAxis" data-t="${t.id}" data-a="${a.id}">${ic('trash')}</button></span>`:''}</div>
  ${a.goals.map(g=>{const av=ss.length?Math.round(ss.reduce((x,s)=>x+goalVal(s,g.id),0)/ss.length):0;return `<div class="goal"><div>${esc(g.title)}${g.desc?`<br><small class="muted">${esc(g.desc)}</small>`:''}</div><span class="badge b-info yr">السنة ${g.year}</span>${pbar(av,t.color)}<span class="tools">${adm?`<button class="btn sm noprint" data-act="editGoal" data-t="${t.id}" data-a="${a.id}" data-g="${g.id}">${ic('edit')}</button><button class="btn sm danger noprint" data-act="delGoal" data-t="${t.id}" data-a="${a.id}" data-g="${g.id}">${ic('trash')}</button>`:`<span class="muted" style="font-size:12px">وزن ${g.weight}</span>`}</span></div>`}).join('')||'<div class="goal muted">لا أهداف بعد</div>'}</div>`).join('')||'<div class="empty">أضف أول محور</div>'}</section>`};

VIEWS.tasks=()=>{const list=[...S.tasks].sort((a,b)=>b.due.localeCompare(a.due));
  return `<div class="pagehead"><div><h2>الوظائف والأبحاث</h2><div class="sub">الوظائف البرمجية والأبحاث والتقارير والمشاريع المسندة للطلاب</div></div><button class="btn pri noprint" data-act="addTask">${ic('plus')} وظيفة جديدة</button></div>
  <section class="panel"><div class="tw"><table><thead><tr><th>العنوان</th><th>النوع</th><th>المسار</th><th>الهدف المرتبط</th><th>الاستحقاق</th><th>التسليم</th><th>متوسط العلامة</th><th></th></tr></thead><tbody>
  ${list.map(x=>{const t=S.tracks.find(t=>t.id===x.trackId),ss=S.students.filter(s=>!x.trackId||s.trackId===x.trackId),sb=S.subs.filter(b=>b.taskId===x.id),gl=goalById(x.goalId),pc=ss.length?Math.round(sb.length*100/ss.length):0,av=avgScore(sb);
  return `<tr class="click" data-act="taskInfo" data-id="${x.id}"><td><b>${esc(x.title)}</b></td><td>${esc(x.type)}</td><td>${t?tdot(t)+esc(t.name):'كل المسارات'}</td><td class="muted">${gl?esc(gl.g.title):'—'}</td><td>${fmtD(x.due)} ${x.due<today()?'':'<span class="badge b-info">مفتوحة</span>'}</td><td>${pbar(pc)}</td><td>${av==null?'—':av+'%'}</td><td class="noprint"><button class="btn sm" data-act="editTask" data-id="${x.id}">${ic('edit')}</button></td></tr>`}).join('')}</tbody></table></div>${list.length?'':'<div class="empty">لا وظائف بعد</div>'}</section>`};
VIEWS['my-tasks']=()=>{const s=myStudent();if(!s)return '<div class="panel">الحساب غير مرتبط بطالب</div>';const list=tasksFor(s).sort((a,b)=>b.due.localeCompare(a.due));
  return `<div class="pagehead"><div><h2>وظائفي</h2><div class="sub">ارفع حلولك البرمجية وأبحاثك وتقاريرك هنا</div></div></div>
  <section class="panel"><div class="tw"><table><thead><tr><th>الوظيفة</th><th>النوع</th><th>الاستحقاق</th><th>الحالة</th><th>ملاحظات المرشد</th><th></th></tr></thead><tbody>${list.map(x=>{const b=subOf(x.id,s.id);return `<tr><td><b>${esc(x.title)}</b>${x.desc?`<br><small class="muted">${esc(x.desc)}</small>`:''}</td><td>${esc(x.type)}</td><td>${fmtD(x.due)} ${!b&&x.due<today()?'<span class="badge b-bad">متأخرة</span>':''}</td><td>${subBadge(b)}</td><td class="muted">${b&&b.feedback?esc(b.feedback):''}</td><td>${!b||b.status!=='graded'?`<button class="btn sm gold" data-act="submit" data-id="${x.id}">${ic('upload')} ${b?'إعادة التسليم':'تسليم'}</button>`:''} ${b?`<button class="btn sm" data-act="review" data-id="${b.id}">عرض</button>`:''}</td></tr>`}).join('')}</tbody></table></div>${list.length?'':'<div class="empty">لا وظائف بعد</div>'}</section>`};
VIEWS.subs=()=>{const f=UI.subf??'submitted';const list=S.subs.filter(x=>!f||x.status===f).sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="pagehead"><div><h2>التسليمات</h2><div class="sub">مراجعة ما رفعه الطلاب وتقييمه</div></div><div class="tools noprint"><select id="subf"><option value="submitted" ${f==='submitted'?'selected':''}>بانتظار التقييم</option><option value="graded" ${f==='graded'?'selected':''}>مُقيَّمة</option><option value="returned" ${f==='returned'?'selected':''}>مُعادة للتعديل</option><option value="" ${!f?'selected':''}>الكل</option></select></div></div>
  <section class="panel"><div class="tw"><table><thead><tr><th>الطالب</th><th>الوظيفة</th><th>تاريخ التسليم</th><th>الملفات</th><th>الحالة</th><th></th></tr></thead><tbody>${list.map(x=>{const s=stuById(x.sid),t=taskById(x.taskId);return `<tr class="click" data-act="review" data-id="${x.id}"><td><div class="who">${avatar(s)}${esc(s?s.name:'—')}</div></td><td>${esc(t?t.title:'—')}</td><td>${fmtD(x.date)} ${t&&x.date>t.due?'<span class="badge b-warn">متأخر</span>':''}</td><td>${(x.files||[]).length}${x.link?' + رابط':''}</td><td>${subBadge(x)}</td><td><button class="btn sm pri">مراجعة</button></td></tr>`}).join('')}</tbody></table></div>${list.length?'':'<div class="empty">لا تسليمات في هذا التصنيف</div>'}</section>`};
VIEWS.sessions=()=>{const list=[...S.sessions].sort((a,b)=>b.date.localeCompare(a.date));
  chart('cAt',cv=>bars3D(cv,S.students.map(s=>({label:s.name.split(' ')[0],value:attendance(s)||0,color:(trackOf(s)||{}).color})),{rot:S.students.length>10,height:260}));
  return `<div class="pagehead"><div><h2>الجلسات والحضور</h2><div class="sub">${list.length} جلسة · ${list.reduce((a,x)=>a+(+x.hours||0),0)} ساعة تدريب</div></div><button class="btn pri noprint" data-act="addSession">${ic('plus')} تسجيل جلسة</button></div>
  ${S.students.length?'<section class="panel"><h3>نسبة حضور كل طالب</h3><div class="cwrap"><canvas id="cAt"></canvas></div></section>':''}
  <section class="panel"><div class="tw"><table><thead><tr><th>التاريخ</th><th>الموضوع</th><th>المسار</th><th>الساعات</th><th>الحضور</th><th>الغائبون</th><th></th></tr></thead><tbody>${list.map(x=>{const el=S.students.filter(s=>(!x.trackId||s.trackId===x.trackId)&&x.date>=(s.joined||'')),ab=el.filter(s=>!(x.present||[]).includes(s.id)),t=S.tracks.find(t=>t.id===x.trackId);return `<tr><td>${fmtD(x.date)}</td><td>${esc(x.topic)}</td><td>${t?esc(t.name):'الجميع'}</td><td>${esc(x.hours)}</td><td>${el.length-ab.length}/${el.length}</td><td class="muted">${ab.map(s=>esc(s.name)).join('، ')||'—'}</td><td class="noprint"><button class="btn sm" data-act="editSession" data-id="${x.id}">${ic('edit')}</button></td></tr>`}).join('')}</tbody></table></div>${list.length?'':'<div class="empty">لا جلسات بعد</div>'}</section>`};

/* ---------- reports ---------- */
function periodRange(type,ds){const d=parseD(ds);
  if(type==='w'){const s=addDays(d,-((d.getDay()+1)%7)),e=addDays(s,6);return{s,e,key:'w:'+iso(s),label:`الأسبوع من ${fmtD(iso(s))} إلى ${fmtD(iso(e))}`}}
  if(type==='m'){const s=new Date(d.getFullYear(),d.getMonth(),1),e=new Date(d.getFullYear(),d.getMonth()+1,0);return{s,e,key:'m:'+iso(s),label:`شهر ${MONTHS[d.getMonth()]} ${d.getFullYear()}`}}
  const n={q:3,h:6,y:12}[type],st=parseD(S.settings.startDate),k=Math.max(0,Math.floor(monthsDiff(st,d)/n)),s=addMonths(st,k*n),e=addDays(addMonths(st,(k+1)*n),-1);
  const label=type==='q'?`الربع ${k%4+1} من السنة ${Math.floor(k/4)+1}`:type==='h'?`النصف ${k%2+1} من السنة ${Math.floor(k/2)+1}`:`السنة ${k+1} من البرنامج`;
  return{s,e,key:type+':'+iso(s),label:label+` (${fmtD(iso(s))} ← ${fmtD(iso(e))})`}}
function periodLabelFromKey(key){const[t,d]=String(key).split(':');return PERIODS[t]?'تقرير '+PERIODS[t]+': '+periodRange(t,d).label:key}
function reportRow(s,r){const from=iso(r.s),to=iso(r.e<new Date()?r.e:new Date()),p0=studentPct(s,iso(addDays(r.s,-1))),p1=studentPct(s,to);
  const sb=S.subs.filter(x=>x.sid===s.id&&x.date>=from&&x.date<=iso(r.e)),due=tasksFor(s).filter(t=>t.due>=from&&t.due<=iso(r.e)),done=due.filter(t=>subOf(t.id,s.id));
  return{p0,p1,delta:p1-p0,subs:sb.length,due:due.length,done:done.length,avg:avgScore(sb),att:attendance(s,from,iso(r.e)),sb,dueList:due}}
VIEWS.reports=()=>{const R=UI.r||(UI.r={type:'m',date:today(),scope:'',track:''});if(ME.role==='student')R.scope=ME.studentId;
  const r=periodRange(R.type,R.date);const stu=R.scope?[stuById(R.scope)].filter(Boolean):S.students.filter(s=>!R.track||s.trackId===R.track);
  const rows=stu.map(s=>[s,reportRow(s,r)]);
  const A=k=>{const v=rows.map(([,x])=>x[k]).filter(v=>v!=null);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null};
  const staff=isStaff();
  const ctl=`<div class="panel noprint"><div class="tools"><b>نوع التقرير:</b>${Object.entries(PERIODS).map(([k,l])=>`<button class="btn sm ${R.type===k?'pri':''}" data-act="rtype" data-v="${k}">${l}</button>`).join('')}<input type="date" id="rdate" value="${R.date}">${staff?`<select id="rscope"><option value="">الدفعة كاملة</option>${S.students.map(s=>`<option value="${s.id}" ${R.scope===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select>${!R.scope?`<select id="rtrack"><option value="">كل المسارات</option>${S.tracks.map(t=>`<option value="${t.id}" ${R.track===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`:''}`:''}<button class="btn gold" data-act="print" style="margin-inline-start:auto">${ic('print')} طباعة / PDF</button></div></div>`;
  const trName=R.track&&S.tracks.find(t=>t.id===R.track);
  const head=`<div class="rhead"><div class="lg">${logoHTML()}</div><div style="flex:1"><h2>${esc(S.settings.name)}: تقرير ${PERIODS[R.type]}</h2><div class="muted">${esc(r.label)}${R.scope&&stu[0]?' · الطالب: <b>'+esc(stu[0].name)+'</b>':trName?' · '+esc(trName.name):''}</div></div><div class="muted" style="text-align:left">تاريخ الإصدار<br>${fmtD(today())}</div></div>`;
  if(R.scope&&stu[0]){const s=stu[0],x=rows[0][1],t=trackOf(s),note=S.notes.find(q=>q.sid===s.id&&q.key===r.key);
    chart('cR1',cv=>bars3D(cv,(t?t.axes:[]).map(a=>({label:a.name,value:axisPct(s,a,iso(r.e<new Date()?r.e:new Date())),color:t.color})),{height:260}));
    return ctl+`<section class="panel">${head}
    <div class="kpis">${kpi(x.p1,'الإنجاز في نهاية الفترة',`كان ${x.p0}% في بدايتها`,t&&t.color)}${kpi(clamp(x.delta*5),'التقدم خلال الفترة','نقطة مئوية','var(--gold)',(x.delta>=0?'+':'')+x.delta)}${kpi(x.due?Math.round(x.done*100/x.due):null,'تسليم وظائف الفترة',`${x.done} من ${x.due}`,'#2b6cb0')}${kpi(x.avg,'متوسط العلامات',`${x.subs} تسليماً`,'#6b4bb0')}${kpi(x.att,'الحضور','','#2f855a')}</div>
    <div class="grid2e"><div><h3>الإنجاز في المحاور</h3><div class="cwrap"><canvas id="cR1"></canvas></div></div><div><h3>وظائف الفترة</h3>${x.dueList.map(tk=>`<div class="file"><span>${esc(tk.title)}</span>${subBadge(subOf(tk.id,s.id))}</div>`).join('')||'<div class="muted">لا وظائف مستحقة في هذه الفترة</div>'}</div></div>
    <h3>ملاحظة المرشد</h3>${staff?`<textarea rows="4" data-act="note" data-sid="${s.id}" data-key="${r.key}" placeholder="اكتب تقييمك للطالب في هذه الفترة: نقاط القوة، ما يحتاج تحسيناً، الخطة للفترة القادمة…">${esc(note?note.text:'')}</textarea>`:`<div class="note">${esc(note?note.text:'لا ملاحظات')}</div>`}</section>`}
  chart('cR',cv=>bars3D(cv,rows.map(([s,x])=>({label:s.name.split(' ')[0],value:x.p1,color:(trackOf(s)||{}).color})),{rot:rows.length>10,height:280}));
  chart('cRd',cv=>bars3D(cv,rows.map(([s,x])=>({label:s.name.split(' ')[0],value:Math.max(0,x.delta),color:'#b98a3e'})),{rot:rows.length>10,height:280,max:Math.max(10,...rows.map(([,x])=>x.delta)),unit:''}));
  const ad=A('delta')||0;
  return ctl+`<section class="panel">${head}
  <div class="kpis">${kpi(A('p1'),'متوسط الإنجاز في نهاية الفترة',`كان ${A('p0')??0}% في بدايتها`)}${kpi(clamp(ad*5),'متوسط التقدم خلال الفترة','نقطة مئوية','var(--gold)',(ad>=0?'+':'')+ad)}${kpi(A('avg'),'متوسط العلامات',`${rows.reduce((a,[,x])=>a+x.subs,0)} تسليماً`,'#6b4bb0')}${kpi(A('att'),'متوسط الحضور','','#2f855a')}</div>
  <div class="grid2e"><div><h3>الإنجاز الكلي لكل طالب</h3><div class="cwrap"><canvas id="cR"></canvas></div></div><div><h3>نقاط التقدم خلال الفترة</h3><div class="cwrap"><canvas id="cRd"></canvas></div></div></div>
  <h3>التفاصيل</h3><div class="tw"><table><thead><tr><th>الطالب</th><th>بداية الفترة</th><th>نهايتها</th><th>التقدم</th><th>الوظائف</th><th>العلامات</th><th>الحضور</th><th>الحالة</th><th style="min-width:220px">ملاحظة المرشد</th></tr></thead><tbody>
  ${rows.map(([s,x])=>{const[a,b]=status(s),note=S.notes.find(q=>q.sid===s.id&&q.key===r.key);return `<tr><td><a href="#" data-act="rscopeTo" data-id="${s.id}"><b>${esc(s.name)}</b></a></td><td>${x.p0}%</td><td>${pbar(x.p1,(trackOf(s)||{}).color)}</td><td><b dir="ltr" style="color:${x.delta>0?'var(--ok)':'var(--mut)'}">${x.delta>0?'+':''}${x.delta}</b></td><td>${x.done}/${x.due}</td><td>${x.avg==null?'—':x.avg+'%'}</td><td>${x.att==null?'—':x.att+'%'}</td><td><span class="badge ${b}">${a}</span></td><td>${staff?`<textarea rows="2" data-act="note" data-sid="${s.id}" data-key="${r.key}">${esc(note?note.text:'')}</textarea>`:esc(note?note.text:'')}</td></tr>`}).join('')}</tbody></table></div></section>`};

/* ================= الاستبيانات ================= */
VIEWS.surveys=()=>{
  if(ME.role==='student'){const list=mySurveys();const st=v=>answeredByMe(v.id)?'<span class="badge b-ok">✓ أجبت</span>':v.status==='open'?'<span class="badge b-info">بانتظار إجابتك</span>':'<span class="badge b-mut">مغلق</span>';
    return `<div class="pagehead"><div><h2>الاستبيانات</h2><div class="sub">رأيك يساعد على تحسين البرنامج</div></div></div>
    <div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${list.map(v=>`<div class="svcard"><div class="ph" style="margin:0"><h3>${esc(v.title)}</h3>${st(v)}</div>${v.desc?`<div class="muted">${esc(v.desc)}</div>`:''}<div class="muted">${v.questions.length} سؤالاً${v.deadline?' · حتى '+fmtD(v.deadline):''} · ${v.anonymous?'🔒 مجهول الهوية':'بالاسم'}</div>${v.status==='open'&&!answeredByMe(v.id)?`<button class="btn gold" data-act="answerSv" data-id="${v.id}" style="align-self:flex-start">أجب الآن</button>`:''}</div>`).join('')||'<div class="empty">لا استبيانات حالياً</div>'}</div>`}
  const list=[...S.surveys].sort((a,b)=>String(b.created||'').localeCompare(String(a.created||'')));
  const stB=v=>v.status==='open'?'<span class="badge b-ok">مفتوح</span>':v.status==='closed'?'<span class="badge b-mut">مغلق</span>':'<span class="badge b-warn">مسودة</span>';
  return `<div class="pagehead"><div><h2>الاستبيانات</h2><div class="sub">أنشئ استبياناً، وانشره للطلاب، وحلّل نتائجه تلقائياً</div></div><div class="tools noprint"><button class="btn" data-act="svTpl" data-k="monthly">${ic('copy')} من قالب: الرضا الشهري</button><button class="btn" data-act="svTpl" data-k="session">${ic('copy')} من قالب: تقييم جلسة</button><button class="btn pri" data-act="newSv">${ic('plus')} استبيان جديد</button></div></div>
  <section class="panel"><div class="tw"><table><thead><tr><th>الاستبيان</th><th>الفئة</th><th>الهوية</th><th>الحالة</th><th>نسبة الاستجابة</th><th>الموعد</th><th></th></tr></thead><tbody>
  ${list.map(v=>{const tg=svTargets(v).length,np=svParts(v.id).length,t=S.tracks.find(x=>x.id===v.trackId);return `<tr class="click" data-go="survey:${v.id}"><td><b>${esc(v.title)}</b><br><small class="muted">${v.questions.length} سؤالاً</small></td><td>${t?tdot(t)+esc(t.name):'كل الطلاب'}</td><td>${v.anonymous?'🔒 مجهول':'بالاسم'}</td><td>${stB(v)}</td><td>${pbar(tg?Math.round(np*100/tg):0)} <small class="muted">${np}/${tg}</small></td><td>${v.deadline?fmtD(v.deadline):'—'}</td><td class="tools noprint">${v.status!=='open'?`<button class="btn sm gold" data-act="svStatus" data-id="${v.id}" data-v="open">نشر</button>`:`<button class="btn sm" data-act="svStatus" data-id="${v.id}" data-v="closed">إغلاق</button>`}<button class="btn sm" data-act="editSv" data-id="${v.id}">${ic('edit')}</button><button class="btn sm" data-act="dupSv" data-id="${v.id}" title="نسخ">${ic('copy')}</button><button class="btn sm danger" data-act="delSv" data-id="${v.id}">${ic('trash')}</button></td></tr>`}).join('')}
  </tbody></table></div>${list.length?'':'<div class="empty">لا استبيانات بعد. ابدأ من قالب جاهز أو أنشئ استبياناً جديداً.</div>'}</section>`};

function surveyBuilder(sv){
  const draft=JSON.parse(JSON.stringify(sv));const hasResp=svParts(sv.id).length>0;
  const box=modal(mhead(sv._new?'استبيان جديد':'تعديل الاستبيان')+`
  ${hasResp?'<div class="banner">⚠️ هذا الاستبيان فيه إجابات. تعديل الأسئلة أو حذفها قد يجعل تحليل الإجابات السابقة غير دقيق.</div>':''}
  <div class="fgrid"><label class="full">عنوان الاستبيان<input id="svT" value="${esc(draft.title)}" placeholder="مثلاً: استبيان الرضا عن الشهر الأول"></label>
  <label class="full">وصف أو تعليمات (اختياري)<textarea id="svD" rows="2">${esc(draft.desc||'')}</textarea></label>
  <label>الفئة المستهدفة<select id="svTr"><option value="">كل الطلاب</option>${S.tracks.map(t=>`<option value="${t.id}" ${draft.trackId===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>
  <label>آخر موعد للإجابة (اختياري)<input type="date" id="svDl" value="${esc(draft.deadline||'')}"></label>
  <label class="ck full"><input type="checkbox" id="svAn" ${draft.anonymous?'checked':''} ${hasResp?'disabled':''}> 🔒 استبيان مجهول الهوية: لا يُحفظ اسم الطالب مع إجاباته، ويُعرف فقط من أجاب ومن لم يجب</label></div>
  <h3 style="margin-top:16px">الأسئلة</h3><div id="qb"></div>
  <div class="qb-add">${Object.entries(QTYPES).map(([k,l])=>`<button class="btn sm" data-qadd="${k}">${ic('plus')} ${l}</button>`).join('')}</div>
  <div class="factions" style="margin-top:16px"><button class="btn pri" data-svsave="keep">حفظ</button>${draft.status!=='open'?'<button class="btn gold" data-svsave="open">حفظ ونشر للطلاب</button>':''}<button class="btn" data-close>إلغاء</button></div>`,true);
  const renderQ=()=>{$('#qb',box).innerHTML=draft.questions.map((q,i)=>`<div class="qb-item"><div class="qhead"><b>${i+1}</b><input data-qi="${i}" data-k="text" value="${esc(q.text)}" placeholder="نص السؤال"><select data-qi="${i}" data-k="type">${Object.entries(QTYPES).map(([k,l])=>`<option value="${k}" ${q.type===k?'selected':''}>${l}</option>`).join('')}</select>
    <label class="ck" style="display:flex;gap:4px;align-items:center;font-size:13px"><input type="checkbox" data-qi="${i}" data-k="required" ${q.required?'checked':''}> إلزامي</label>
    <button class="icon-btn" data-qmv="${i}" data-d="-1" title="لأعلى">${ic('up')}</button><button class="icon-btn" data-qmv="${i}" data-d="1" title="لأسفل">${ic('down')}</button><button class="icon-btn" data-qdel="${i}" title="حذف">${ic('trash')}</button></div>
    ${q.type==='single'||q.type==='multi'?`<textarea data-qi="${i}" data-k="options" rows="3" placeholder="خيار في كل سطر">${esc((q.options||[]).join('\n'))}</textarea>`:`<div class="muted" style="font-size:12.5px">${q.type==='scale'?SCALE.join(' · '):q.type==='rating'?'مقياس من 1 (الأدنى) إلى 10 (الأعلى)':q.type==='yesno'?'نعم · لا':'مربع نص يكتب فيه الطالب إجابته'}</div>`}</div>`).join('')||'<div class="empty">أضف أول سؤال من الأزرار في الأسفل</div>'};
  renderQ();
  box.addEventListener('input',e=>{const el=e.target;if(el.dataset.qi==null)return;const q=draft.questions[+el.dataset.qi];const k=el.dataset.k;
    if(k==='text')q.text=el.value;else if(k==='options')q.options=el.value.split('\n').map(x=>x.trim()).filter(Boolean)});
  box.addEventListener('change',e=>{const el=e.target;if(el.dataset.qi==null)return;const q=draft.questions[+el.dataset.qi];const k=el.dataset.k;
    if(k==='type'){q.type=el.value;if((q.type==='single'||q.type==='multi')&&!(q.options||[]).length)q.options=['الخيار الأول','الخيار الثاني'];renderQ()}else if(k==='required')q.required=el.checked});
  box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.qadd){draft.questions.push({id:uid(),type:b.dataset.qadd,text:'',options:b.dataset.qadd==='single'||b.dataset.qadd==='multi'?['الخيار الأول','الخيار الثاني']:[],required:b.dataset.qadd!=='text'});renderQ();const its=$$('.qb-item input[data-k=text]',box);its[its.length-1].focus();return}
    if(b.dataset.qdel!=null){draft.questions.splice(+b.dataset.qdel,1);renderQ();return}
    if(b.dataset.qmv!=null){const i=+b.dataset.qmv,j=i+ +b.dataset.d;if(j<0||j>=draft.questions.length)return;[draft.questions[i],draft.questions[j]]=[draft.questions[j],draft.questions[i]];renderQ();return}
    if(b.dataset.svsave){draft.title=$('#svT',box).value.trim();draft.desc=$('#svD',box).value.trim();draft.trackId=$('#svTr',box).value;draft.deadline=$('#svDl',box).value;if(!hasResp)draft.anonymous=$('#svAn',box).checked;
      if(!draft.title){toast('اكتب عنوان الاستبيان','err');return}if(!draft.questions.length){toast('أضف سؤالاً واحداً على الأقل','err');return}
      const bad=draft.questions.findIndex(q=>!q.text.trim()||((q.type==='single'||q.type==='multi')&&(q.options||[]).length<2));if(bad>=0){toast(`السؤال ${bad+1}: اكتب نصه، وخيارين على الأقل للاختيار`,'err');return}
      if(b.dataset.svsave==='open')draft.status='open';const isNew=draft._new;delete draft._new;closeModal();
      mutate(S=>{const i=S.surveys.findIndex(x=>x.id===draft.id);if(i>=0)S.surveys[i]=draft;else S.surveys.push(draft);log((isNew?'أُنشئ':'عُدّل')+' الاستبيان: '+draft.title+(draft.status==='open'?' (منشور)':''))});go('surveys')}});
}
function answerForm(id){const v=S.surveys.find(x=>x.id===id);if(!v)return;
  const qh=(q,i)=>{const n=`q_${q.id}`;let inner='';
    if(q.type==='single'||q.type==='yesno')inner=`<div class="opts">${(q.type==='yesno'?['نعم','لا']:q.options).map(o=>`<label><input type="radio" name="${n}" value="${esc(o)}"> ${esc(o)}</label>`).join('')}</div>`;
    else if(q.type==='multi')inner=`<div class="opts">${q.options.map(o=>`<label><input type="checkbox" name="${n}" value="${esc(o)}"> ${esc(o)}</label>`).join('')}</div>`;
    else if(q.type==='scale')inner=`<div class="scale-row">${SCALE.map((l,k)=>`<label><input type="radio" name="${n}" value="${k+1}"><span>${l}</span></label>`).join('')}</div>`;
    else if(q.type==='rating')inner=`<div class="scale-row r10">${Array.from({length:10},(_,k)=>`<label><input type="radio" name="${n}" value="${k+1}"><b>${k+1}</b></label>`).join('')}</div>`;
    else inner=`<textarea name="${n}" rows="3" maxlength="2000"></textarea>`;
    return `<div class="q"><b>${i+1}. ${esc(q.text)} ${q.required?'<span class="req">*</span>':''}</b>${inner}</div>`};
  const box=modal(mhead(esc(v.title))+`${v.desc?`<div class="note" style="margin-bottom:12px">${esc(v.desc)}</div>`:''}<div class="muted" style="margin-bottom:10px">${v.anonymous?'🔒 هذا الاستبيان مجهول الهوية: لن يُحفظ اسمك مع إجاباتك.':'ستُحفظ إجاباتك باسمك ليتابعها المرشد.'}</div><form class="qform">${v.questions.map(qh).join('')}<div class="factions"><button class="btn pri">إرسال الإجابات</button><button type="button" class="btn" data-close>إلغاء</button></div></form>`,true);
  $('form',box).onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.target),ans={};
    for(const [i,q] of v.questions.entries()){const n=`q_${q.id}`;let val;
      if(q.type==='multi')val=fd.getAll(n);else if(q.type==='scale'||q.type==='rating'){val=fd.get(n);val=val==null?null:+val}else{val=fd.get(n);val=val==null?null:String(val).trim()}
      const empty=val==null||val===''||(Array.isArray(val)&&!val.length);if(q.required&&empty){toast(`أجب عن السؤال ${i+1}`,'err');return}if(!empty)ans[q.id]=val}
    const btn=$('button.pri',e.target);btn.disabled=true;
    try{await API.submitSurvey(v.id,ans);closeModal();toast('شكراً، أُرسلت إجاباتك ✓');if(API.mode==='supabase')await reload();else{S=normalize(await API.loadAll());render()}}
    catch(err){toast(errMsg(err),'err');btn.disabled=false}}}

/* ---------- تحليل النتائج ---------- */
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const median=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
const sdev=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1))};
const f1=x=>x==null?'—':(+x).toFixed(1);
const STOP=new Set('في من على الى إلى عن مع هذا هذه ذلك تلك التي الذي الذين ان أن إن او أو و ثم لا ما لم لن قد كان كانت يكون تكون هو هي هم نحن انا أنا انت أنت كل بعض اي أي جدا جداً شي شيء اكثر أكثر اقل أقل عند كما لكن بل حتى اذا إذا لو فيه فيها به بها له لها لي لنا لهم منه منها عليه عليها يعني ايضا أيضا فقط غير بين خلال بعد قبل حول كيف لماذا متى هل نعم ممكن يمكن اريد أريد يجب كذلك مثل وفي وعلى ومن الى'.split(' ').map(w=>normAr(w)));
function normAr(w){return String(w).replace(/[ً-ْـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')}
function tokens(t){return normAr(t).replace(/[^؀-ۿa-zA-Z0-9\s]/g,' ').split(/\s+/).map(w=>{w=w.toLowerCase();if(w.startsWith('وال')&&w.length>5)w=w.slice(3);else if(w.startsWith('ال')&&w.length>4)w=w.slice(2);return w}).filter(w=>w.length>2&&!STOP.has(w)&&!/^\d+$/.test(w))}
const POS=['ممتاز','رايع','جيد','مفيد','ممتع','احب','احببت','سهل','واضح','افضل','شكرا','مميز','تحسن','نجاح','متحمس','جميل','مناسب','متعاون','استفدت','تعلمت','ممتازه','مفيده','رايعه','جيده','واضحه','سعيد','راض','راضي','مريح'].map(normAr);
const NEG=['سيء','سيي','صعب','صعبه','ممل','مله','ضعيف','ضعيفه','مشكله','مشاكل','معقد','تاخير','قليل','قليله','نقص','متعب','مرهق','ضغط','سلبي','اسوا','كثيره','سريع','مزعج','بطيء','صعوبه','تعب','غامض','ملل','مشتت','ناقص'].map(normAr);
function sentiment(text){const w=tokens(text).concat(normAr(text).split(/\s+/));let p=0,n=0;w.forEach(x=>{if(POS.some(k=>x.includes(k)))p++;if(NEG.some(k=>x.includes(k)))n++});if(/(غير|لا|ليس|ليست)\s+\S*(واضح|مفيد|مناسب|جيد)/.test(normAr(text))){n+=2;p=Math.max(0,p-1)}return p>n?1:n>p?-1:0}
function hlist(items,total,color){return `<div class="hlist">${items.map(([l,c])=>{const p=total?Math.round(c*100/total):0;return `<div class="r"><div>${esc(l)}</div><span><i style="width:${p}%;${color?`background:${color}`:''}"></i></span><div class="muted">${c} · ${p}%</div></div>`}).join('')}</div>`}
function analyzeQuestion(q,resp,idx,sv){
  const vals=resp.map(r=>r.answers[q.id]).filter(v=>v!=null&&v!==''&&!(Array.isArray(v)&&!v.length));const n=vals.length,cid=`qc_${idx}`,ins=[];
  let body='';
  if(q.type==='single'||q.type==='yesno'){const opts=q.type==='yesno'?['نعم','لا']:[...q.options];vals.forEach(v=>{if(!opts.includes(v))opts.push(v)});
    const cnt=opts.map(o=>[o,vals.filter(v=>v===o).length]);const cols=['#1b6b67','#b98a3e','#2563a8','#a8436e','#6b7f2e','#6b4bb0','#c0392b','#55606b'];
    const items=cnt.map(([l,c],i)=>({label:l,value:c,color:q.type==='yesno'?(i===0?'#2f855a':'#c0392b'):cols[i%cols.length]})).filter(x=>x.value);
    if(items.length)chart(cid,cv=>pie3D(cv,items,{height:220}));
    const top=[...cnt].sort((a,b)=>b[1]-a[1])[0];if(n&&top){const p=Math.round(top[1]*100/n);ins.push(p>=60?['g',`إجماع واضح في «${q.text}»: ${p}% اختاروا «${top[0]}».`]:['',`الخيار الأكثر في «${q.text}»: «${top[0]}» (${p}%).`])}
    body=`<div class="grid2e"><div>${items.length?`<div class="cwrap"><canvas id="${cid}"></canvas></div>`+legend(items):''}</div><div>${hlist([...cnt].sort((a,b)=>b[1]-a[1]),n)}</div></div>`}
  else if(q.type==='multi'){const opts=[...q.options];vals.flat().forEach(v=>{if(!opts.includes(v))opts.push(v)});const cnt=opts.map(o=>[o,vals.filter(v=>Array.isArray(v)&&v.includes(o)).length]).sort((a,b)=>b[1]-a[1]);
    chart(cid,cv=>bars3D(cv,cnt.map(([l,c])=>({label:l,value:n?Math.round(c*100/n):0,color:'#2563a8'})),{height:240,rot:cnt.length>5}));
    if(n&&cnt[0])ins.push(['',`أكثر ما اختاره الطلاب في «${q.text}»: «${cnt[0][0]}» (${Math.round(cnt[0][1]*100/n)}% من المجيبين)${cnt[1]&&cnt[1][1]?`، ثم «${cnt[1][0]}»`:''}.`]);
    body=`<div class="grid2e"><div class="cwrap"><canvas id="${cid}"></canvas></div><div>${hlist(cnt,n)}<p class="muted" style="font-size:12px">النسبة من عدد المجيبين، ويمكن للطالب اختيار أكثر من خيار.</p></div></div>`}
  else if(q.type==='scale'||q.type==='rating'){const nums=vals.map(Number).filter(x=>!isNaN(x)),max=q.type==='scale'?5:10,m=mean(nums),md=median(nums),sd=sdev(nums);
    const dist=Array.from({length:max},(_,k)=>nums.filter(x=>x===k+1).length);const idxv=m==null?null:Math.round((m-1)/(max-1)*100);
    if(q.type==='scale'){chart(cid,cv=>bars3D(cv,dist.map((c,k)=>({label:SCALE[k],value:n?Math.round(c*100/n):0,color:SCALE_COLORS[k]})),{height:240}));
      const agree=n?Math.round((dist[3]+dist[4])*100/n):0,dis=n?Math.round((dist[0]+dist[1])*100/n):0;
      body=`<div class="stats3"><div>المتوسط<b>${f1(m)} / 5</b></div><div>الوسيط<b>${f1(md)}</b></div><div>الانحراف المعياري<b>${f1(sd)}</b></div><div>مؤشر الرضا<b>${idxv??'—'}%</b></div><div style="background:var(--okb)">موافقون<b>${agree}%</b></div><div style="background:var(--badb)">غير موافقين<b>${dis}%</b></div></div><div class="cwrap"><canvas id="${cid}"></canvas></div>`;
      if(n){if(dis>=40)ins.push(['w',`تحتاج متابعة: ${dis}% غير موافقين على «${q.text}».`]);else if(agree>=75)ins.push(['g',`نقطة قوة: ${agree}% موافقون على «${q.text}».`]);if(sd>1.2&&n>=4)ins.push(['w',`الآراء منقسمة حول «${q.text}» (الانحراف المعياري ${f1(sd)}): بعض الطلاب راضون جداً وبعضهم غير راضٍ. يستحق نقاشاً فردياً.`])}}
    else{const prom=nums.filter(x=>x>=9).length,det=nums.filter(x=>x<=6).length,nps=n?Math.round((prom-det)*100/n):null;
      chart(cid,cv=>bars3D(cv,dist.map((c,k)=>({label:String(k+1),value:c,color:k<6?'#c0392b':k<8?'#a0a7ad':'#2f855a'})),{height:240,unit:'',max:Math.max(3,...dist)}));
      body=`<div class="stats3"><div>المتوسط<b>${f1(m)} / 10</b></div><div>الوسيط<b>${f1(md)}</b></div><div>الانحراف المعياري<b>${f1(sd)}</b></div><div>مؤشر صافي التوصية (NPS)<b dir="ltr">${nps??'—'}</b></div></div><div class="cwrap"><canvas id="${cid}"></canvas></div><p class="muted" style="font-size:12px">NPS = نسبة من أعطوا 9–10 ناقص نسبة من أعطوا 1–6. فوق 0 جيد، وفوق 50 ممتاز.</p>`;
      if(n)ins.push([m>=7.5?'g':m<5.5?'w':'',`متوسط تقييم «${q.text}»: ${f1(m)} من 10.`])}
    q._mean=m;q._idx=idxv}
  else{const texts=vals.map(String);const freq={},orig={};texts.forEach(t=>t.replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g,' ').split(/\s+/).forEach(raw=>{const w=tokens(raw)[0];if(!w)return;freq[w]=(freq[w]||0)+1;const o=(orig[w]=orig[w]||{});const r=raw.replace(/^و(?=ال)/,'');o[r]=(o[r]||0)+1}));const disp=w=>Object.entries(orig[w]||{[w]:1}).sort((a,b)=>b[1]-a[1])[0][0];const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,18).map(([w,c])=>[disp(w),c]);const mx=top.length?top[0][1]:1,mn=top.length?top[top.length-1][1]:1;
    const sent=texts.map(sentiment),sp=sent.filter(x=>x>0).length,sn=sent.filter(x=>x<0).length,s0=n-sp-sn;
    const sItems=[{label:'إيجابية',value:sp,color:'#2f855a'},{label:'محايدة',value:s0,color:'#a0a7ad'},{label:'سلبية',value:sn,color:'#c0392b'}].filter(x=>x.value);
    if(sItems.length)chart(cid,cv=>pie3D(cv,sItems,{height:200}));
    body=`<div class="grid2e"><div><b style="font-size:13px">الكلمات الأكثر تكراراً</b><div class="cloud">${top.map(([w,c])=>`<span style="font-size:${mx>mn?14+Math.round((c-mn)/(mx-mn)*16):16}px;opacity:${mx>mn?.6+.4*(c-mn)/(mx-mn):.85}" title="${c} مرة">${esc(w)}</span>`).join('')||'<span class="muted">—</span>'}</div>
      <b style="font-size:13px">الإجابات (${n})</b><div class="answers">${texts.map((t,i)=>`<div>${sent[i]>0?'🟢':sent[i]<0?'🔴':'⚪'} ${esc(t)}</div>`).join('')||'<span class="muted">لا إجابات</span>'}</div></div>
      <div>${sItems.length?`<b style="font-size:13px">اتجاه الإجابات (تقريبي)</b><div class="cwrap"><canvas id="${cid}"></canvas></div>${legend(sItems)}<p class="muted" style="font-size:12px">تصنيف تقريبي يعتمد على كلمات مفتاحية، فاقرأ الإجابات نفسها قبل أي قرار.</p>`:''}</div></div>`;
    if(top.length)ins.push(['',`أبرز الكلمات في «${q.text}»: ${top.slice(0,4).map(x=>'«'+x[0]+'»').join('، ')}.`]);if(n>=3&&sn>sp)ins.push(['w',`أغلب الإجابات النصية في «${q.text}» تميل للسلبية: راجعها بعناية.`])}
  return{html:`<div class="qres"><h4>${idx+1}. ${esc(q.text)}</h4><div class="meta">${QTYPES[q.type]} · ${n} إجابة${resp.length&&n<resp.length?` (تخطّاه ${resp.length-n})`:''}</div>${n?body:'<div class="muted">لا إجابات بعد</div>'}</div>`,ins}}
VIEWS.survey=id=>{if(!isStaff())return '';const v=S.surveys.find(x=>x.id===id);if(!v)return '<div class="panel">الاستبيان غير موجود</div>';
  const fT=UI.svTrack||'';let resp=svResp(id);if(fT)resp=resp.filter(r=>r.trackId===fT);
  const tg=svTargets(v),parts=svParts(id),partU=new Set(parts.map(p=>p.userId)),rate=tg.length?Math.round(tg.filter(s=>{const u=S.users.find(x=>x.studentId===s.id);return u&&partU.has(u.id)}).length*100/tg.length):0;
  const noAcc=tg.filter(s=>!S.users.some(u=>u.studentId===s.id));const missing=tg.filter(s=>{const u=S.users.find(x=>x.studentId===s.id);return u&&!partU.has(u.id)});
  const Q=v.questions.map(q=>({...q}));const parts2=Q.map((q,i)=>analyzeQuestion(q,resp,i,v));
  const ins=[];if(tg.length)ins.push(rate<60?['w',`نسبة الاستجابة ${rate}% منخفضة؛ النتائج قد لا تمثل كل الطلاب. ذكّر ${missing.length} طالباً لم يجيبوا بعد.`]:['g',`نسبة الاستجابة ${rate}%: النتائج تمثل الدفعة بشكل جيد.`]);
  const sc=Q.filter(q=>q.type==='scale'&&q._mean!=null).sort((a,b)=>b._mean-a._mean);if(sc.length>1){ins.push(['g',`أعلى رضا: «${sc[0].text}» (${f1(sc[0]._mean)}/5).`]);ins.push(['w',`أدنى رضا: «${sc[sc.length-1].text}» (${f1(sc[sc.length-1]._mean)}/5). ابدأ التحسين من هنا.`])}
  if(sc.length){const all=Math.round(mean(sc.map(q=>q._idx)));ins.unshift([all>=70?'g':all<50?'w':'',`مؤشر الرضا العام لهذا الاستبيان: ${all}% (متوسط أسئلة المقياس).`])}
  parts2.forEach(p=>ins.push(...p.ins));
  let low='';if(!v.anonymous){const scQ=Q.filter(q=>q.type==='scale');if(scQ.length){const lows=resp.filter(r=>r.sid).map(r=>{const xs=scQ.map(q=>+r.answers[q.id]).filter(x=>x>0);return[r.sid,mean(xs)]}).filter(([,m])=>m!=null&&m<=2.5);
    if(lows.length)low=`<div class="insights" style="margin-top:8px"><div class="w">👤 طلاب يحتاجون حديثاً فردياً (متوسط موافقتهم 2.5 أو أقل): ${lows.map(([sid,m])=>{const s=stuById(sid);return `<a href="#student:${sid}">${esc(s?s.name:'—')}</a> (${f1(m)})`}).join('، ')}</div></div>`}}
  let cross='';const trks=[...new Set(svResp(id).map(r=>r.trackId).filter(Boolean))];const numQ=Q.filter(q=>q.type==='scale'||q.type==='rating');
  if(trks.length>1&&numQ.length&&!fT){const T=trks.map(t=>S.tracks.find(x=>x.id===t)).filter(Boolean);
    cross=`<section class="panel"><h3>مقارنة بين المسارات</h3><div class="tw"><table><thead><tr><th>السؤال</th>${T.map(t=>`<th>${tdot(t)}${esc(t.name)}</th>`).join('')}<th>الفرق</th></tr></thead><tbody>${numQ.map(q=>{const ms=T.map(t=>mean(svResp(id).filter(r=>r.trackId===t.id).map(r=>+r.answers[q.id]).filter(x=>x>0)));const vv=ms.filter(x=>x!=null);const diff=vv.length>1?Math.max(...vv)-Math.min(...vv):0;const lim=q.type==='scale'?.7:1.4;return `<tr><td>${esc(q.text)}</td>${ms.map(m=>`<td>${f1(m)}</td>`).join('')}<td>${diff>=lim?`<span class="badge b-warn">${f1(diff)}</span>`:f1(diff)}</td></tr>`}).join('')}</tbody></table></div><p class="muted" style="font-size:12px">الفرق المميَّز بالأصفر كبير، ويستحق البحث عن سببه في المسار الأضعف.</p></section>`;
    const big=numQ.map(q=>{const ms=T.map(t=>[t,mean(svResp(id).filter(r=>r.trackId===t.id).map(r=>+r.answers[q.id]).filter(x=>x>0))]).filter(x=>x[1]!=null);if(ms.length<2)return null;ms.sort((a,b)=>a[1]-b[1]);return{q,lo:ms[0],hi:ms[ms.length-1],d:ms[ms.length-1][1]-ms[0][1]}}).filter(x=>x&&x.d>=(x.q.type==='scale'?.7:1.4));
    big.forEach(b=>ins.push(['w',`فرق بين المسارات في «${b.q.text}»: ${b.hi[0].name} ${f1(b.hi[1])} مقابل ${b.lo[0].name} ${f1(b.lo[1])}.`]))}
  return `<div class="pagehead noprint"><div class="tools"><a class="btn" href="#surveys">→ الاستبيانات</a></div><div class="tools">${trks.length>1?`<select id="svtf"><option value="">كل المسارات</option>${S.tracks.map(t=>`<option value="${t.id}" ${fT===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`:''}<button class="btn" data-act="svCsv" data-id="${id}">${ic('download')} تصدير Excel</button><button class="btn gold" data-act="print">${ic('print')} طباعة / PDF</button></div></div>
  <section class="panel"><div class="rhead"><div class="lg">${logoHTML()}</div><div style="flex:1"><h2>نتائج: ${esc(v.title)}</h2><div class="muted">${v.anonymous?'🔒 مجهول الهوية':'بالاسم'} · ${v.trackId?esc((S.tracks.find(t=>t.id===v.trackId)||{}).name||''):'كل الطلاب'} · أُنشئ ${fmtD(v.created)}${fT?' · مُصفّى: '+esc((S.tracks.find(t=>t.id===fT)||{}).name||''):''}</div></div><div class="muted" style="text-align:left">تاريخ الإصدار<br>${fmtD(today())}</div></div>
  <div class="kpis">${kpi(rate,'نسبة الاستجابة',`${parts.length} من ${tg.length} طالباً`)}${kpi(null,'عدد الإجابات','',null,String(resp.length))}${kpi(v.status==='open'?100:0,'الحالة','',v.status==='open'?'#2f855a':'#8a94a0',v.status==='open'?'مفتوح':v.status==='closed'?'مغلق':'مسودة')}</div>
  <h3>📊 ملخص التحليل</h3><div class="insights">${ins.map(([c,t])=>`<div class="${c}">${c==='w'?'⚠️':c==='g'?'✅':'💡'} <span>${esc(t)}</span></div>`).join('')||'<div>لا إجابات بعد</div>'}</div>${low}
  ${missing.length||noAcc.length?`<div class="muted" style="margin-top:10px;font-size:13px">${missing.length?`لم يجيبوا بعد: ${missing.map(s=>esc(s.name)).join('، ')}.`:''} ${noAcc.length?`<br>بلا حساب دخول (لا يستطيعون الإجابة): ${noAcc.map(s=>esc(s.name)).join('، ')}.`:''}</div>`:''}</section>
  ${cross}<section class="panel"><h3>تحليل الأسئلة</h3>${parts2.map(p=>p.html).join('')}</section>
  ${!v.anonymous&&resp.length?`<section class="panel"><h3>الإجابات الفردية</h3><div class="tw"><table><thead><tr><th>الطالب</th>${Q.map((q,i)=>`<th title="${esc(q.text)}">س${i+1}</th>`).join('')}</tr></thead><tbody>${resp.map(r=>{const s=stuById(r.sid);return `<tr><td>${esc(s?s.name:'—')}</td>${Q.map(q=>{const a=r.answers[q.id];return `<td style="font-size:13px">${esc(Array.isArray(a)?a.join('، '):q.type==='scale'&&a?SCALE[a-1]:a??'—')}</td>`}).join('')}</tr>`}).join('')}</tbody></table></div></section>`:''}`};
function exportSurveyCSV(id){const v=S.surveys.find(x=>x.id===id),resp=svResp(id);
  const head=[...(v.anonymous?[]:['الطالب']),'المسار','التاريخ',...v.questions.map(q=>q.text)];
  const rows=resp.map(r=>{const s=stuById(r.sid),t=S.tracks.find(x=>x.id===r.trackId);return[...(v.anonymous?[]:[s?s.name:'']),t?t.name:'',r.date,...v.questions.map(q=>{const a=r.answers[q.id];return q.type==='scale'&&a?`${a} - ${SCALE[a-1]}`:a})]});
  download(new Blob([toCSV([head,...rows])],{type:'text/csv;charset=utf-8'}),`نتائج-${v.title}.csv`)}

VIEWS.users=()=>{if(!isStaff())return '';const canEdit=u=>isDev()||u.role==='student';return `<div class="pagehead"><div><h2>المستخدمون</h2><div class="sub">${isDev()?'المطور ينشئ حسابات المشرفين والطلاب':'المشرف ينشئ حسابات الطلاب ويعدّلها'}${API.mode==='supabase'?' · الإنشاء وتغيير كلمات المرور يتمان عبر خادم Supabase بأمان':''}</div></div><button class="btn pri" data-act="addUser">${ic('plus')} ${isDev()?'مستخدم جديد':'حساب طالب جديد'}</button></div>
  <section class="panel"><div class="tw"><table><thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الدور</th><th>الطالب المرتبط</th><th></th></tr></thead><tbody>${S.users.map(u=>{const s=u.studentId&&stuById(u.studentId);return `<tr><td><b>${esc(u.name)}</b></td><td dir="ltr" style="text-align:right">${esc(u.username)}</td><td><span class="badge ${u.role==='dev'?'b-bad':u.role==='student'?'b-mut':'b-warn'}">${ROLES[u.role]}</span></td><td>${s?esc(s.name):'—'}</td><td class="tools">${canEdit(u)?`<button class="btn sm" data-act="editUser" data-id="${u.id}">${ic('edit')} تعديل</button>${u.id!==ME.id?`<button class="btn sm danger" data-act="delUser" data-id="${u.id}">${ic('trash')}</button>`:''}`:'<span class="muted" style="font-size:12px">للمطور فقط</span>'}</td></tr>`}).join('')}</tbody></table></div></section>`};
VIEWS.settings=()=>{if(!isDev())return '';const s=S.settings;const demoData=S.students.some(x=>x.demo);
  return `<div class="pagehead"><div><h2>الإعدادات</h2><div class="sub">هوية المنصة، والبرنامج، والبيانات</div></div></div>
  <div class="grid2e"><section class="panel"><h3>الهوية والواجهة</h3><form id="setId" class="fgrid">
   <label class="full">اسم المنصة<input name="name" value="${esc(s.name)}" required></label>
   <label class="full">العنوان الفرعي<input name="subtitle" value="${esc(s.subtitle)}"></label>
   <label>الشعار (PNG أو JPG)<input type="file" name="logo" accept="image/*"></label>
   <label>صورة خلفية الواجهة<input type="file" name="hero" accept="image/*"></label>
   <label>اللون الافتراضي للجميع<select name="palette">${PALETTES.map((p,i)=>`<option value="${i}" ${(s.palette||0)===i?'selected':''}>اللون ${i+1}</option>`).join('')}</select></label>
   <label>السمة الافتراضية<select name="theme"><option value="light">نهاري</option><option value="dark" ${s.theme==='dark'?'selected':''}>ليلي</option></select></label>
   <div class="full tools"><span class="muted">الشعار الحالي:</span><span style="width:54px;height:54px;display:inline-grid">${logoHTML()}</span>${s.logo?'<button type="button" class="btn sm" data-act="rmLogo">إزالة الشعار</button>':''}${s.hero?'<button type="button" class="btn sm" data-act="rmHero">إزالة الخلفية</button>':''}</div>
   <div class="factions"><button class="btn pri">حفظ</button></div></form></section>
  <section class="panel"><h3>البرنامج</h3><form id="setProg" class="fgrid">
   <label>تاريخ بدء البرنامج<input type="date" name="startDate" value="${esc(s.startDate)}" required></label>
   <label>مدة البرنامج (سنوات)<input type="number" name="years" min="1" max="10" value="${s.years}" required></label>
   <label class="full">الهدف النهائي للبرنامج<textarea name="finalGoal" rows="5">${esc(s.finalGoal)}</textarea></label>
   <div class="factions"><button class="btn pri">حفظ</button></div></form></section></div>
  <section class="panel"><h3>البيانات والنسخ الاحتياطي</h3>
   <p class="muted">وضع التخزين: <b>${API.mode==='supabase'?'Supabase: البيانات على الخادم ومشتركة بين كل الأجهزة':'تجريبي: البيانات في متصفح هذا الجهاز فقط'}</b>.<br>النسخة الاحتياطية ملف ZIP فيه كل شيء: الجداول (JSON، وCSV يفتح في Excel)، والملفات المرفوعة${API.mode==='supabase'?'، و<b>الحسابات بكلمات مرورها المشفّرة</b>. عند نقل المنصة إلى خادم Supabase جديد: نفّذ schema.sql، وأنشئ حساب المطور، ثم استعد النسخة من هنا، فيعود كل شيء كما كان ويدخل الجميع بنفس كلمات مرورهم. ⚠️ احفظ الملف في مكان آمن':''}. خذ نسخة مرة في الشهر على الأقل.</p>
   <div class="tools"><button class="btn gold" data-act="backup">${ic('download')} نسخة احتياطية كاملة</button>
   <label class="btn">${ic('upload')} استعادة نسخة (ZIP)<input type="file" id="restore" accept=".zip" hidden></label>
   ${demoData?`<button class="btn danger" data-act="clearDemo">${ic('trash')} مسح البيانات التجريبية</button>`:`<button class="btn" data-act="loadDemo">تحميل بيانات تجريبية</button>`}
   ${API.mode==='demo'?`<button class="btn danger" data-act="resetAll">${ic('trash')} إعادة ضبط المنصة بالكامل</button>`:''}</div>
   ${API.mode==='supabase'?'<p class="muted" style="font-size:12.5px;margin-top:10px">البيانات التجريبية في وضع Supabase تُنشئ طلاباً ووظائف بلا حسابات دخول، لتجربة الشاشات والتقارير فقط.</p>':''}</section>`};

/* ================= forms / actions ================= */
function studentForm(s){const isNew=!s;s=s||{};const u=isNew?null:S.users.find(x=>x.studentId===s.id);
  formModal({title:isNew?'إضافة طالب':'تعديل بيانات الطالب',fields:[
    {name:'name',label:'الاسم الكامل',value:s.name,required:true,full:true},
    {name:'trackId',label:'المسار',type:'select',options:S.tracks.map(t=>[t.id,t.name]),value:s.trackId},
    {name:'mentor',label:'المرشد',value:s.mentor},{name:'uni',label:'الجامعة',value:s.uni},{name:'phone',label:'الهاتف',value:s.phone,ltr:true},
    {name:'joined',label:'تاريخ الانضمام',type:'date',value:s.joined||today()},{name:'examNo',label:'الرقم الامتحاني',value:s.examNo,ltr:true,hint:'يُدخله الطالب عند بدء كل اختبار'},{name:'photo',label:'الصورة',type:'file',accept:'image/*'},
    ...(isAdmin()&&!u?[{type:'html',html:`<div class="full muted" style="border-top:1px solid var(--line);padding-top:8px">حساب دخول للطالب (اختياري، ليرفع وظائفه ويجيب على الاستبيانات):</div>`},{name:'username',label:'اسم المستخدم (إنجليزي)',ltr:true,ac:'off'},{name:'password',label:'كلمة المرور (6 أحرف على الأقل)',ltr:true,ac:'new-password'}]:[]),
    ...(u?[{type:'html',html:`<div class="full muted">حساب الطالب: <b dir="ltr">${esc(u.username)}</b>، ويُعدَّل من صفحة المستخدمين.</div>`}]:[])],
    onSubmit:async d=>{if(d.examNo&&S.students.some(x=>x.examNo===d.examNo&&x.id!==s.id)){toast('هذا الرقم الامتحاني مستخدم لطالب آخر','err');return false}const photo=d.photo&&d.photo[0]?await readImage(d.photo[0],180):null;const id=s.id||uid();
      await mutate(S=>{let x=S.students.find(q=>q.id===id);if(!x){x={id,progress:{}};S.students.push(x)}
        Object.assign(x,{name:d.name,trackId:d.trackId,mentor:d.mentor,uni:d.uni,phone:d.phone,joined:d.joined,examNo:d.examNo});if(photo)x.photo=photo;log((isNew?'أُضيف الطالب ':'عُدّلت بيانات ')+d.name)});
      if(d.username&&d.password){try{await API.createUser({username:d.username,password:d.password,name:d.name,role:'student',studentId:id});await reload();toast('أُضيف الطالب وحسابه ✓')}catch(e){toast('أُضيف الطالب، لكن تعذّر إنشاء الحساب: '+errMsg(e),'err')}}else toast('تم الحفظ')}})}
function trackForm(t){formModal({title:t?'تعديل المسار':'مسار جديد',fields:[{name:'name',label:'اسم المسار',value:t&&t.name,required:true},{name:'color',label:'اللون',type:'color',value:t?t.color:'#6b4bb0'},{name:'desc',label:'وصف المسار',type:'textarea',value:t&&t.desc},{name:'finalGoal',label:'الهدف النهائي للمسار',type:'textarea',value:t&&t.finalGoal}],
  onSubmit:d=>{const id=t?t.id:uid();mutate(S=>{let x=S.tracks.find(q=>q.id===id);if(!x){x={id,axes:[]};S.tracks.push(x)}Object.assign(x,d);log((t?'عُدّل ':'أُضيف ')+'المسار '+d.name)});if(!t)go('track:'+id)}})}
function goalForm(tid,aid,g){formModal({title:g?'تعديل الهدف':'هدف جديد',fields:[{name:'title',label:'الهدف',value:g&&g.title,required:true,full:true},{name:'year',label:'سنة البرنامج',type:'select',options:Array.from({length:+S.settings.years||5},(_,i)=>[i+1,'السنة '+(i+1)]),value:g?g.year:curYear()},{name:'weight',label:'الوزن (الأهمية)',type:'number',min:1,max:10,value:g?g.weight:2,hint:'هدف وزنه 4 يؤثر في النسبة الكلية ضعف هدف وزنه 2'},{name:'desc',label:'وصف ومعيار الإتقان',type:'textarea',value:g&&g.desc}],
  onSubmit:d=>{const gid=g?g.id:uid();mutate(S=>{const a=S.tracks.find(t=>t.id===tid).axes.find(a=>a.id===aid);let x=a.goals.find(q=>q.id===gid);if(!x){x={id:gid};a.goals.push(x)}Object.assign(x,{title:d.title,year:+d.year,weight:+d.weight||1,desc:d.desc})})}})}
function taskForm(x){formModal({title:x?'تعديل الوظيفة':'وظيفة جديدة',wide:true,fields:[{name:'title',label:'العنوان',value:x&&x.title,required:true,full:true},{name:'type',label:'النوع',type:'select',options:TASK_TYPES,value:x&&x.type},{name:'trackId',label:'المسار',type:'select',options:[['','كل المسارات'],...S.tracks.map(t=>[t.id,t.name])],value:x&&x.trackId},
  {name:'goalId',label:'الهدف المرتبط (يمكن تحديث إنجازه تلقائياً من العلامة)',type:'select',options:goalOptions(),value:x&&x.goalId,full:true},{name:'due',label:'تاريخ الاستحقاق',type:'date',value:x?x.due:iso(addDays(new Date(),7)),required:true},{type:'html',html:'<span></span>'},{name:'desc',label:'التعليمات',type:'textarea',rows:4,value:x&&x.desc}],
  onSubmit:d=>{const id=x?x.id:uid();mutate(S=>{let t=S.tasks.find(q=>q.id===id);if(!t){t={id,created:today()};S.tasks.push(t)}Object.assign(t,d);log((x?'عُدّلت ':'أُسندت ')+'الوظيفة: '+d.title)})}});
  if(x)$('#modal .factions').insertAdjacentHTML('beforeend',`<button type="button" class="btn danger" style="margin-inline-start:auto" data-act="delTask" data-id="${x.id}">${ic('trash')} حذف</button>`)}
function sessionForm(x){const sel=x?(x.present||[]):S.students.map(s=>s.id);
  formModal({title:x?'تعديل الجلسة':'تسجيل جلسة',wide:true,fields:[{name:'date',label:'التاريخ',type:'date',value:x?x.date:today(),required:true},{name:'hours',label:'الساعات',type:'number',step:.5,min:0,value:x?x.hours:3},{name:'topic',label:'موضوع الجلسة',value:x&&x.topic,required:true,full:true},{name:'trackId',label:'المسار',type:'select',options:[['','الجميع'],...S.tracks.map(t=>[t.id,t.name])],value:x&&x.trackId},{type:'html',html:'<span></span>'},
   {type:'html',html:`<div class="full"><div class="muted" style="margin-bottom:6px">الحضور (أزل العلامة عن الغائب):</div><div class="tools">${S.students.map(s=>`<label class="chip" style="cursor:pointer"><input type="checkbox" class="pres" value="${s.id}" ${sel.includes(s.id)?'checked':''}> ${esc(s.name)}</label>`).join('')}</div></div>`}],
   onSubmit:(d,f)=>{const present=$$('.pres',f).filter(c=>c.checked).map(c=>c.value),id=x?x.id:uid();mutate(S=>{let q=S.sessions.find(z=>z.id===id);if(!q){q={id};S.sessions.push(q)}Object.assign(q,d,{present});log('سُجّلت جلسة: '+d.topic)})}});
  if(x)$('#modal .factions').insertAdjacentHTML('beforeend',`<button type="button" class="btn danger" style="margin-inline-start:auto" data-act="delSession" data-id="${x.id}">${ic('trash')} حذف</button>`)}
function submitForm(tid){const s=myStudent(),t=taskById(tid),prev=subOf(tid,s.id);
  formModal({title:'تسليم: '+t.title,fields:[{type:'html',html:t.desc?`<div class="full note">${esc(t.desc)}</div>`:''},{name:'files',label:'الملفات (كود، PDF، صور، ملف مضغوط…)',type:'file',multiple:true,hint:(prev?'الملفات الجديدة تُضاف إلى ملفاتك السابقة. ':'')+'الحد 20MB لكل ملف، والصور تُضغط تلقائياً. للملفات الأكبر (فيديو مثلاً) ضع رابط Drive أو YouTube.'},{name:'link',label:'رابط (GitHub أو Drive، اختياري)',value:prev&&prev.link,ltr:true,full:true},{name:'note',label:'ملاحظة للمرشد',type:'textarea',value:prev&&prev.note}],submit:'تسليم',
   onSubmit:async d=>{if(!d.files.length&&!d.link&&!prev){toast('أرفق ملفاً أو رابطاً','err');return false}
     const metas=[];for(let f of d.files){f=await compressForUpload(f);if(f.size>20*1048576){toast('الملف أكبر من 20 ميغابايت: '+f.name+'. ضعه كرابط.','err');return false}
       const fid=uid(),path=API.uid()+'/'+fid;try{await API.putFile(path,f)}catch(e){toast('تعذّر رفع '+f.name+': '+errMsg(e),'err');return false}metas.push({id:fid,path,name:f.name,size:f.size,type:f.type})}
     const id=prev?prev.id:uid();await mutate(S=>{let b=S.subs.find(q=>q.id===id);if(!b){b={id,taskId:tid,sid:s.id,files:[]};S.subs.push(b)}b.files=(b.files||[]).concat(metas);Object.assign(b,{date:today(),link:d.link,note:d.note,status:'submitted'});log(s.name+' سلّم: '+t.title)});toast('تم التسليم ✓')}})}
function reviewBox(id){const x=S.subs.find(q=>q.id===id);if(!x)return;const s=stuById(x.sid),t=taskById(x.taskId),gl=t&&goalById(t.goalId),staff=isStaff();
  const b=modal(mhead('تسليم: '+esc(t?t.title:''))+`<div class="who" style="margin-bottom:10px">${avatar(s)}<div><b>${esc(s?s.name:'')}</b><div class="muted">سُلِّم في ${fmtD(x.date)} ${t&&x.date>t.due?'<span class="badge b-warn">بعد الموعد</span>':''} · ${subBadge(x)}</div></div></div>
   ${x.note?`<div class="note" style="margin-bottom:10px">${esc(x.note)}</div>`:''}
   <div class="files">${(x.files||[]).map(f=>`<div class="file">${ic('file')}<span>${esc(f.name)}</span><small class="muted">${fsize(f.size)}</small><button class="btn sm" data-act="dl" data-path="${esc(f.path||f.id)}" data-name="${esc(f.name)}">${ic('download')} تنزيل</button></div>`).join('')}${x.link?`<div class="file">🔗<span><a href="${esc(/^https?:\/\//.test(x.link)?x.link:'https://'+x.link)}" target="_blank" rel="noopener" dir="ltr">${esc(x.link)}</a></span></div>`:''}${!(x.files||[]).length&&!x.link?'<div class="muted">لا ملفات</div>':''}</div>
   ${staff?`<form class="fgrid" style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px"><label>العلامة (من 100)<input type="number" name="score" min="0" max="100" value="${x.score??''}"></label><label>القرار<select name="status"><option value="graded">قبول وتقييم</option><option value="returned" ${x.status==='returned'?'selected':''}>إعادة للتعديل</option></select></label><label class="full">ملاحظات للطالب<textarea name="feedback" rows="3">${esc(x.feedback||'')}</textarea></label>${gl?`<label class="ck full"><input type="checkbox" name="apply" checked> تحديث إنجاز الهدف «${esc(gl.g.title)}» ليصبح العلامة إن كانت أعلى من الحالي</label>`:''}<div class="factions"><button class="btn pri">حفظ التقييم</button><button type="button" class="btn" data-close>إغلاق</button></div></form>`:(x.feedback?`<h3>ملاحظات المرشد</h3><div class="note">${esc(x.feedback)}</div>`:'')}`);
  const f=$('form',b);if(f)f.onsubmit=e=>{e.preventDefault();const fd=new FormData(f),sc=fd.get('score')===''?null:clamp(+fd.get('score')),stt=fd.get('status'),fb=String(fd.get('feedback')||''),ap=fd.get('apply')==='on';
    if(stt==='graded'&&sc==null){toast('أدخل العلامة','err');return}closeModal();
    mutate(S=>{const q=S.subs.find(z=>z.id===id);Object.assign(q,{score:sc,status:stt,feedback:fb});if(ap&&stt==='graded'&&gl){const st=S.students.find(z=>z.id===q.sid);st.progress=st.progress||{};const cur=+(st.progress[gl.g.id]||0);if(sc>cur){st.progress[gl.g.id]=sc;S.history.push({id:uid(),sid:st.id,gid:gl.g.id,date:today(),value:sc})}}log('قُيِّم تسليم '+(s?s.name:'')+(sc!=null?': '+sc+'%':''))});toast('تم الحفظ')}}
function userForm(u){const studs=[['','—'],...S.students.map(s=>[s.id,s.name])];
  formModal({title:u?'تعديل المستخدم':'مستخدم جديد',fields:[{name:'name',label:'الاسم',value:u&&u.name,required:true},{name:'username',label:'اسم المستخدم (إنجليزي)',value:u&&u.username,required:true,ltr:true,ac:'off'},{name:'role',label:'الدور',type:'select',options:isDev()?[['admin','مشرف'],['student','طالب'],['dev','مطور']]:[['student','طالب']],value:u?(u.role==='mentor'?'admin':u.role):(isDev()?'admin':'student')},{name:'studentId',label:'الطالب المرتبط (لحساب الطالب)',type:'select',options:studs,value:u&&u.studentId},{name:'password',label:u?'كلمة مرور جديدة (اتركها فارغة للإبقاء)':'كلمة المرور (6 أحرف على الأقل)',ltr:true,required:!u,full:true,ac:'new-password'}],
   onSubmit:async d=>{if(d.role==='student'&&!d.studentId){toast('اختر الطالب المرتبط بالحساب','err');return false}
     if(u)await API.updateUser(u.id,{name:d.name,username:d.username,role:d.role,studentId:d.role==='student'?d.studentId:'',password:d.password||undefined});
     else await API.createUser({username:d.username,password:d.password,name:d.name,role:d.role,studentId:d.studentId});
     await reload();toast('تم الحفظ ✓')}})}
function myPw(){formModal({title:'تغيير كلمة المرور',fields:[{name:'old',label:'كلمة المرور الحالية',type:'password',required:true,full:true,ac:'current-password'},{name:'n1',label:'كلمة المرور الجديدة',type:'password',required:true,ac:'new-password'},{name:'n2',label:'تأكيدها',type:'password',required:true,ac:'new-password'}],
  onSubmit:async d=>{if(d.n1!==d.n2){toast('كلمتا المرور غير متطابقتين','err');return false}await API.changePassword(d.old,d.n1);if(ME.mustChange){ME.mustChange=false}if(API.mode==='demo')S=normalize(await API.loadAll()),ME=S.users.find(u=>u.id===ME.id)||ME;render();toast('تم تغيير كلمة المرور ✓')}})}
function taskInfo(id){const x=taskById(id),ss=S.students.filter(s=>!x.trackId||s.trackId===x.trackId);
  modal(mhead(esc(x.title))+`<div class="muted">${esc(x.type)} · الاستحقاق ${fmtD(x.due)}</div>${x.desc?`<div class="note" style="margin:10px 0">${esc(x.desc)}</div>`:''}<div class="tw"><table><thead><tr><th>الطالب</th><th>الحالة</th><th></th></tr></thead><tbody>${ss.map(s=>{const b=subOf(x.id,s.id);return `<tr><td>${esc(s.name)}</td><td>${subBadge(b)}</td><td>${b?`<button class="btn sm" data-act="review" data-id="${b.id}">مراجعة</button>`:''}</td></tr>`}).join('')}</tbody></table></div><div class="factions" style="margin-top:12px"><button class="btn" data-act="editTask" data-id="${x.id}">${ic('edit')} تعديل</button></div>`,true)}
async function backup(){try{toast('جارٍ تجهيز النسخة الاحتياطية…');const JSZip=await loadJSZip();const zip=new JSZip();const st=snap();
  zip.file('data.json',JSON.stringify({app:'ifad-platform',version:2,date:new Date().toISOString(),mode:API.mode,state:st},null,1));
  const flat=x=>{const o={};for(const[k,v]of Object.entries(x))o[k]=v;return o};
  ['students','tasks','subs','sessions','notes','history','surveys','responses','participation','users','activity','tracks'].forEach(k=>{const arr=(st[k]||[]).map(x=>{const o=flat(x);delete o.salt;delete o.hash;delete o.photo;return o});const keys=[...new Set(arr.flatMap(o=>Object.keys(o)))];zip.file(`csv/${k}.csv`,toCSV([keys,...arr.map(o=>keys.map(k2=>o[k2]))]))});
  let n=0;for(const x of st.subs)for(const f of (x.files||[])){try{const b=await API.getFile(f.path||f.id);if(b){zip.file('files/'+(f.path||f.id),b);n++}}catch(e){}}
  const blob=await zip.generateAsync({type:'blob'});download(blob,`نسخة-احتياطية-${today()}.zip`);toast(`تم: البيانات و${n} ملفاً ✓`)}catch(e){toast(errMsg(e),'err')}}
async function restore(file){try{const JSZip=await loadJSZip();const zip=await JSZip.loadAsync(file);const j=JSON.parse(await zip.file('data.json').async('string'));if(!j.state)throw 0;
  confirmBox('ستُستبدل كل البيانات الحالية بمحتوى النسخة الاحتياطية. هل أنت متأكد؟',async()=>{const files=Object.keys(zip.files).filter(p=>p.startsWith('files/')&&!zip.files[p].dir);for(const p of files)await API.putFile(p.slice(6),await zip.file(p).async('blob'));
   S=normalize(j.state);if(!S.users.length)S.users=blankState(true).users;await API.commit(null,S);const me=S.users.find(u=>u.id===ME.id);if(!me){await API.logout();ME=null}else ME=me;render();toast('تمت الاستعادة ✓')},'استعادة')}catch(e){toast('الملف ليس نسخة احتياطية صالحة','err')}}

/* ================= الإشعارات ================= */
function notifVisibleToStudent(n){const s=myStudent();return n.target==='all'||(n.target==='track'&&s&&n.trackId===s.trackId)||(n.target==='student'&&s&&n.sid===s.id)}
function myNotifs(){if(!ME)return[];return S.notifications.filter(n=>isStaff()?n.target==='staff':notifVisibleToStudent(n))}
function isRead(id){return S.reads.some(r=>r.nid===id&&r.userId===ME.id)}
function unreadCount(){return ME?myNotifs().filter(n=>!isRead(n.id)).length:0}
const targetLabel=n=>n.target==='all'?'كل الطلاب':n.target==='staff'?'المشرفون':n.target==='track'?'مسار: '+esc((S.tracks.find(t=>t.id===n.trackId)||{}).name||'—'):'الطالب: '+esc((stuById(n.sid)||{}).name||'—');
function audienceUsers(n){if(n.target==='staff')return S.users.filter(u=>u.role!=='student');return S.users.filter(u=>{if(u.role!=='student')return false;const s=stuById(u.studentId);if(!s)return false;return n.target==='all'||(n.target==='track'&&s.trackId===n.trackId)||(n.target==='student'&&s.id===n.sid)})}
async function markRead(ids){ids=ids.filter(id=>!isRead(id));if(!ids.length)return;const at=new Date().toISOString();ids.forEach(nid=>S.reads.push({nid,userId:ME.id,at}));render();try{await API.markRead(ids)}catch(e){console.error(e)}}
VIEWS.inbox=()=>{const tab=isStaff()?(UI.inTab||'sent'):'in';const list=tab==='in'?myNotifs():[...S.notifications].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));const un=myNotifs().filter(n=>!isRead(n.id));
  return `<div class="pagehead"><div><h2>الإشعارات</h2><div class="sub">${un.length?un.length+' غير مقروء':'لا إشعارات جديدة'}</div></div><div class="tools noprint">${isStaff()?`<div class="seg2"><button class="btn sm ${tab==='sent'?'pri':''}" data-act="inTab" data-v="sent">المرسلة</button><button class="btn sm ${tab==='in'?'pri':''}" data-act="inTab" data-v="in">الواردة${un.length?` (${un.length})`:''}</button></div><button class="btn gold" data-act="sendNotif">${ic('send')} إرسال إشعار / تعميم</button>`:''}${un.length?`<button class="btn" data-act="readAll">${ic('check')} تحديد الكل كمقروء</button>`:''}</div></div>
  <section class="panel">${list.map(n=>{const unr=tab==='in'&&!isRead(n.id);const aud=tab==='sent'?audienceUsers(n):[];const rd=tab==='sent'?aud.filter(u=>S.reads.some(r=>r.nid===n.id&&r.userId===u.id)).length:0;
    return `<div class="notif ${unr?'unread':''}" data-act="openNotif" data-id="${n.id}"><div class="nh">${unr?'<i class="dot"></i>':''}<b>${esc(n.title)}</b><small class="muted">${ago(n.createdAt)}</small></div><div class="nb">${esc(n.body).replace(/\n/g,'<br>')}</div>${tab==='sent'?`<div class="muted" style="font-size:12.5px;margin-top:6px">إلى: ${targetLabel(n)} · قرأه ${rd} من ${aud.length} <button class="btn sm danger noprint" data-act="delNotif" data-id="${n.id}" style="margin-inline-start:8px">${ic('trash')}</button></div>`:''}</div>`}).join('')||'<div class="empty">لا إشعارات</div>'}</section>`};
function sendNotifForm(pre={}){formModal({title:'إرسال إشعار / تعميم',fields:[{name:'title',label:'العنوان',required:true,full:true,value:pre.title},{name:'body',label:'النص',type:'textarea',rows:5,value:pre.body},
  {name:'target',label:'إلى',type:'select',options:[['all','كل الطلاب'],['track','طلاب مسار معيّن'],['student','طالب محدد'],['staff','المشرفون']],value:pre.target||'all'},
  {name:'trackId',label:'المسار (عند اختيار مسار)',type:'select',options:S.tracks.map(t=>[t.id,t.name]),value:pre.trackId},
  {name:'sid',label:'الطالب (عند اختيار طالب محدد)',type:'select',options:S.students.map(s=>[s.id,s.name]),value:pre.sid,full:true}],submit:'إرسال',
  onSubmit:d=>{const n={id:uid(),title:d.title,body:d.body,target:d.target,trackId:d.target==='track'?d.trackId:'',sid:d.target==='student'?d.sid:'',createdAt:new Date().toISOString(),createdBy:ME.id};
    mutate(S=>{S.notifications.unshift(n);log('أُرسل إشعار: '+d.title)});toast('أُرسل الإشعار ✓')}})}

/* ================= الاختبارات ================= */
const timerLabel=e=>e.timerMode==='total'?`${e.totalMinutes||0} دقيقة للاختبار`:e.timerMode==='perQuestion'?`${e.perQuestionSec||60} ثانية لكل سؤال`:'بدون مؤقت';
const fmtDur=s=>{if(s==null)return'—';s=Math.max(0,Math.round(s));const m=Math.floor(s/60),x=s%60;return m?`${m} د ${x} ث`:`${x} ث`};
const fN=x=>x==null?'—':Number.isInteger(+x)?String(+x):(+x).toFixed(1);
const pctOf=a=>a&&a.max?Math.round(a.score*100/a.max):0;
const examTargets=e=>S.students.filter(s=>!e.trackId||s.trackId===e.trackId);
const LET=['أ','ب','ج','د','هـ','و','ز','ح'];
const toLocalInput=v=>{if(!v)return'';const d=new Date(v);if(isNaN(d))return'';return iso(d)+'T'+pad(d.getHours())+':'+pad(d.getMinutes())};
VIEWS.exams=()=>{
  if(ME.role==='student'){if(!UI.myEx){UI.myEx='loading';API.listMyExams().then(x=>{UI.myEx=x||[];render()}).catch(e=>{UI.myEx=[];toast(errMsg(e),'err');render()})}
    if(UI.myEx==='loading')return '<div class="loading">جارٍ تحميل الاختبارات…</div>';const s=myStudent();
    return `<div class="pagehead"><div><h2>اختباراتي</h2><div class="sub">${s&&s.examNo?'تحتاج رقمك الامتحاني عند بدء كل اختبار':'لم يُحدَّد لك رقم امتحاني بعد، راجع المشرف'}</div></div></div>
    <div class="cards" style="grid-template-columns:repeat(auto-fill,minmax(290px,1fr))">${UI.myEx.map(e=>{const a=e.attempt,done=a&&a.status==='submitted',p=done?pctOf(a):0,pass=e.passMark==null||p>=e.passMark;
      return `<div class="svcard"><div class="ph" style="margin:0"><h3>${esc(e.title)}</h3>${done?`<span class="badge ${pass?'b-ok':'b-bad'}">${p}%</span>`:a?'<span class="badge b-warn">لم يكتمل</span>':e.status==='open'?'<span class="badge b-info">متاح</span>':'<span class="badge b-mut">مغلق</span>'}</div>${e.desc?`<div class="muted">${esc(e.desc)}</div>`:''}
      <div class="muted">${e.count} سؤالاً · ${ic('clock','ii')} ${timerLabel(e)}${e.openTo?' · حتى '+fmtD(e.openTo):''}</div>
      ${done?`<div class="muted">العلامة ${fN(a.score)} من ${fN(a.max)} · المدة ${fmtDur(a.duration)}</div><button class="btn" data-act="myResult" data-id="${a.id}" style="align-self:flex-start">عرض النتيجة</button>`:(e.status==='open'||a)?`<button class="btn gold" data-act="startExam" data-id="${e.id}" style="align-self:flex-start">${a?'متابعة الاختبار':'ابدأ الاختبار'}</button>`:''}</div>`}).join('')||'<div class="empty">لا اختبارات حالياً</div>'}</div>`}
  const list=[...S.exams].sort((a,b)=>String(b.created||'').localeCompare(String(a.created||'')));
  const stB=e=>e.status==='open'?'<span class="badge b-ok">مفتوح</span>':e.status==='closed'?'<span class="badge b-mut">مغلق</span>':'<span class="badge b-warn">مسودة</span>';
  return `<div class="pagehead"><div><h2>الاختبارات</h2><div class="sub">أنشئ اختباراً أو استورد أسئلته من ملف HTML أو PDF، وتابع العلامات</div></div><div class="tools noprint"><button class="btn" data-act="allMarksCsv">${ic('download')} تصدير كل العلامات</button><button class="btn pri" data-act="newExam">${ic('plus')} اختبار جديد</button></div></div>
  <section class="panel"><div class="tw"><table><thead><tr><th>الاختبار</th><th>الفئة</th><th>المؤقت</th><th>الحالة</th><th>قدّمه</th><th>المتوسط</th><th></th></tr></thead><tbody>
  ${list.map(e=>{const done=S.attempts.filter(a=>a.examId===e.id&&a.status==='submitted'),tg=examTargets(e).length,t=S.tracks.find(x=>x.id===e.trackId),av=done.length?Math.round(done.reduce((x,a)=>x+pctOf(a),0)/done.length):null;
   return `<tr class="click" data-go="exam:${e.id}"><td><b>${esc(e.title)}</b><br><small class="muted">${(e.questions||[]).length} سؤالاً</small></td><td>${t?tdot(t)+esc(t.name):'كل الطلاب'}</td><td>${timerLabel(e)}</td><td>${stB(e)}</td><td>${pbar(tg?Math.round(done.length*100/tg):0)} <small class="muted">${done.length}/${tg}</small></td><td>${av==null?'—':av+'%'}</td><td class="tools noprint">${e.status!=='open'?`<button class="btn sm gold" data-act="exStatus" data-id="${e.id}" data-v="open">نشر</button>`:`<button class="btn sm" data-act="exStatus" data-id="${e.id}" data-v="closed">إغلاق</button>`}<button class="btn sm" data-act="editExam" data-id="${e.id}">${ic('edit')}</button><button class="btn sm" data-act="dupExam" data-id="${e.id}" title="نسخ">${ic('copy')}</button><button class="btn sm danger" data-act="delExam" data-id="${e.id}">${ic('trash')}</button></td></tr>`}).join('')}
  </tbody></table></div>${list.length?'':'<div class="empty">لا اختبارات بعد. أنشئ اختباراً واستورد أسئلته من ملف HTML (بصيغة const QUESTIONS) أو PDF.</div>'}</section>`};

function examEditor(ex){const draft=JSON.parse(JSON.stringify(ex));const hasAtt=S.attempts.some(a=>a.examId===ex.id);
  const box=modal(mhead(ex._new?'اختبار جديد':'تعديل الاختبار')+`${hasAtt?'<div class="banner">⚠️ قدّم بعض الطلاب هذا الاختبار. تعديل الإجابات الصحيحة لا يعيد تصحيح المحاولات السابقة.</div>':''}
  <div class="fgrid"><label class="full">عنوان الاختبار<input id="exT" value="${esc(draft.title)}" placeholder="مثلاً: اختبار الشهر الأول في C++"></label>
  <label class="full">تعليمات للطالب (اختياري)<textarea id="exD" rows="2">${esc(draft.desc||'')}</textarea></label>
  <label>الفئة<select id="exTr"><option value="">كل الطلاب</option>${S.tracks.map(t=>`<option value="${t.id}" ${draft.trackId===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label>
  <label>المؤقت<select id="exTm"><option value="none" ${draft.timerMode==='none'?'selected':''}>بدون مؤقت</option><option value="total" ${draft.timerMode==='total'?'selected':''}>مؤقت عام: ينتهي الاختبار بانتهائه</option><option value="perQuestion" ${draft.timerMode==='perQuestion'?'selected':''}>مؤقت لكل سؤال</option></select></label>
  <label>مدة الاختبار (دقائق)<input type="number" id="exMin" min="1" value="${esc(draft.totalMinutes??30)}"></label>
  <label>وقت السؤال الافتراضي (ثوانٍ)<input type="number" id="exSec" min="5" value="${esc(draft.perQuestionSec??60)}"></label>
  <label>علامة النجاح (%)<input type="number" id="exPass" min="0" max="100" value="${esc(draft.passMark??50)}"></label>
  <label>الحالة<select id="exSt"><option value="draft" ${draft.status==='draft'?'selected':''}>مسودة</option><option value="open" ${draft.status==='open'?'selected':''}>منشور (مفتوح)</option><option value="closed" ${draft.status==='closed'?'selected':''}>مغلق</option></select></label>
  <label>متاح من (اختياري)<input type="datetime-local" id="exFrom" value="${toLocalInput(draft.openFrom)}"></label>
  <label>متاح حتى (اختياري)<input type="datetime-local" id="exTo" value="${toLocalInput(draft.openTo)}"></label>
  <label class="ck"><input type="checkbox" id="exShow" ${draft.showAnswers!==false?'checked':''}> إظهار الإجابات الصحيحة للطالب بعد التسليم</label>
  <label class="ck"><input type="checkbox" id="exShuf" ${draft.shuffle?'checked':''}> خلط ترتيب الأسئلة والخيارات</label>
  <label class="ck full"><input type="checkbox" id="exNotify" ${ex._new?'checked':''}> إرسال إشعار للطلاب عند النشر</label></div>
  <div class="ph" style="margin-top:16px"><h3 style="margin:0">الأسئلة <span class="muted" id="qcount"></span></h3><div class="tools"><label class="btn gold">${ic('upload')} استيراد من ملف (HTML / PDF / TXT)<input type="file" id="exImp" accept=".html,.htm,.pdf,.txt,.json" hidden></label><button class="btn" data-xpaste>لصق نص</button><button class="btn" data-xadd>${ic('plus')} سؤال</button></div></div>
  <div id="xpaste" style="display:none" class="panel"><div class="muted" style="margin-bottom:6px">الصق الأسئلة بهذا الشكل: سؤال يبدأ برقم، وخيارات تبدأ بحروف، والإجابة الصحيحة بعلامة * أو بسطر «الإجابة: ب».</div><textarea id="xpt" rows="8" placeholder="1. ما ناتج 2 + 3؟&#10;أ) 4&#10;ب) 5 *&#10;ج) 6&#10;&#10;2. ...&#10;الإجابة: ج"></textarea><div class="tools" style="margin-top:8px"><button class="btn pri" data-xparse>تحويل إلى أسئلة</button></div></div>
  <div id="xq"></div>
  <div class="factions" style="margin-top:16px"><button class="btn pri" data-xsave>حفظ الاختبار</button><button class="btn" data-close>إلغاء</button></div>`,true);
  const renderQ=()=>{$('#qcount',box).textContent=`(${draft.questions.length})`;const miss=draft.questions.filter(q=>q.correct==null).length;
    $('#xq',box).innerHTML=(miss?`<div class="banner">⚠️ ${miss} سؤالاً بلا إجابة صحيحة محددة. حدّدها قبل الحفظ (مُعلَّمة بالأصفر).</div>`:'')+draft.questions.map((q,i)=>`<div class="qb-item ${q.correct==null?'warnq':''}"><div class="qhead"><b>${i+1}</b><textarea data-qi="${i}" data-k="text" rows="2" style="flex:1;min-width:220px" placeholder="نص السؤال (يُسمح بتنسيق HTML)">${esc(q.text)}</textarea>
      <button class="icon-btn" data-xmv="${i}" data-d="-1" title="لأعلى">${ic('up')}</button><button class="icon-btn" data-xmv="${i}" data-d="1" title="لأسفل">${ic('down')}</button><button class="icon-btn" data-xdel="${i}" title="حذف">${ic('trash')}</button></div>
      <div class="xgrid"><label>الخيارات (خيار في كل سطر)<textarea data-qi="${i}" data-k="options" rows="${Math.max(3,(q.options||[]).length)}">${esc((q.options||[]).join('\n'))}</textarea></label>
      <div class="xside"><label>الإجابة الصحيحة<select data-qi="${i}" data-k="correct"><option value="">— اختر —</option>${(q.options||[]).map((o,k)=>`<option value="${k}" ${q.correct===k?'selected':''}>${LET[k]||k+1}) ${esc(String(o).replace(/<[^>]*>/g,'').slice(0,40))}</option>`).join('')}</select></label>
      <div style="display:flex;gap:8px"><label>العلامة<input type="number" data-qi="${i}" data-k="points" min="0" step="0.5" value="${esc(q.points??1)}" style="width:80px"></label><label>ثوانٍ (اختياري)<input type="number" data-qi="${i}" data-k="sec" min="5" value="${esc(q.sec??'')}" style="width:90px" placeholder="افتراضي"></label></div>
      <label>الشرح بعد التسليم (اختياري)<input data-qi="${i}" data-k="explanation" value="${esc(q.explanation||'')}"></label></div></div></div>`).join('')};
  renderQ();
  const addQs=(qs,src)=>{draft.questions.push(...qs);renderQ();const miss=qs.filter(q=>q.correct==null).length;toast(`استُورد ${qs.length} سؤالاً من ${src}${miss?` · ${miss} بلا إجابة صحيحة`:''}`)};
  $('#exImp',box).onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{toast('جارٍ قراءة الملف…');const r=await importFile(f);addQs(r.questions,r.source);r.warnings.forEach(w=>setTimeout(()=>toast(w),3300))}catch(err){toast(errMsg(err),'err')}};
  box.addEventListener('input',e=>{const el=e.target;if(el.dataset.qi==null)return;const q=draft.questions[+el.dataset.qi],k=el.dataset.k;
    if(k==='text'||k==='explanation')q[k]=el.value;else if(k==='points')q.points=el.value===''?1:+el.value;else if(k==='sec')q.sec=el.value===''?null:+el.value;
    else if(k==='options'){q.options=el.value.split('\n').map(x=>x.trim()).filter(Boolean);if(q.correct!=null&&q.correct>=q.options.length)q.correct=null;const sel=el.closest('.qb-item').querySelector('select[data-k=correct]');sel.innerHTML='<option value="">— اختر —</option>'+q.options.map((o,k2)=>`<option value="${k2}" ${q.correct===k2?'selected':''}>${LET[k2]||k2+1}) ${esc(o.replace(/<[^>]*>/g,'').slice(0,40))}</option>`).join('')}});
  box.addEventListener('change',e=>{const el=e.target;if(el.dataset.k==='correct'){const q=draft.questions[+el.dataset.qi];q.correct=el.value===''?null:+el.value;el.closest('.qb-item').classList.toggle('warnq',q.correct==null)}});
  box.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-xadd')){draft.questions.push({id:uid(),text:'',options:['',''].filter(Boolean),correct:null,points:1,sec:null,explanation:''});renderQ();const t=$$('#xq textarea[data-k=text]',box);t[t.length-1].focus();return}
    if(b.hasAttribute('data-xpaste')){const p=$('#xpaste',box);p.style.display=p.style.display==='none'?'block':'none';return}
    if(b.hasAttribute('data-xparse')){const qs=parseText($('#xpt',box).value);if(!qs.length){toast('لم أتعرف على أسئلة. تأكد من الترقيم والحروف.','err');return}addQs(qs,'النص الملصق');$('#xpt',box).value='';$('#xpaste',box).style.display='none';return}
    if(b.dataset.xdel!=null){draft.questions.splice(+b.dataset.xdel,1);renderQ();return}
    if(b.dataset.xmv!=null){const i=+b.dataset.xmv,j=i+ +b.dataset.d;if(j<0||j>=draft.questions.length)return;[draft.questions[i],draft.questions[j]]=[draft.questions[j],draft.questions[i]];renderQ();return}
    if(b.hasAttribute('data-xsave')){const g=id=>$(id,box);const wasOpen=ex.status==='open';
      Object.assign(draft,{title:g('#exT').value.trim(),desc:g('#exD').value.trim(),trackId:g('#exTr').value,timerMode:g('#exTm').value,totalMinutes:+g('#exMin').value||30,perQuestionSec:+g('#exSec').value||60,passMark:g('#exPass').value===''?null:+g('#exPass').value,status:g('#exSt').value,openFrom:g('#exFrom').value?new Date(g('#exFrom').value).toISOString():null,openTo:g('#exTo').value?new Date(g('#exTo').value).toISOString():null,showAnswers:g('#exShow').checked,shuffle:g('#exShuf').checked});
      if(!draft.title){toast('اكتب عنوان الاختبار','err');return}if(!draft.questions.length){toast('أضف سؤالاً واحداً على الأقل','err');return}
      const bad=draft.questions.findIndex(q=>!String(q.text).trim()||(q.options||[]).length<2||q.correct==null);if(bad>=0){toast(`السؤال ${bad+1}: يحتاج نصاً وخيارين على الأقل وإجابة صحيحة`,'err');return}
      const notify=g('#exNotify').checked&&draft.status==='open'&&!wasOpen;const isNew=draft._new;delete draft._new;closeModal();
      mutate(S=>{const i=S.exams.findIndex(x=>x.id===draft.id);if(i>=0)S.exams[i]=draft;else S.exams.push(draft);log((isNew?'أُنشئ':'عُدّل')+' الاختبار: '+draft.title);
        if(notify)S.notifications.unshift({id:uid(),title:'اختبار جديد: '+draft.title,body:`${draft.questions.length} سؤالاً · ${timerLabel(draft)}${draft.openTo?' · متاح حتى '+fmtD(draft.openTo):''}. ادخل إلى «اختباراتي» وجهّز رقمك الامتحاني.`,target:draft.trackId?'track':'all',trackId:draft.trackId||'',sid:'',createdAt:new Date().toISOString(),createdBy:ME.id})});go('exam:'+draft.id)}});
}
// تفاصيل النتيجة (مشتركة بين الطالب والمشرف)
function resultHTML(r,who){const p=r.max?Math.round(r.score*100/r.max):0,pass=r.passMark==null||p>=r.passMark;const ok=r.questions.filter(q=>q.ok).length;
  return `<div class="rhead"><div class="lg">${logoHTML()}</div><div style="flex:1"><h2>نتيجة: ${esc(r.title)}</h2><div class="muted">${who?esc(who)+' · ':''}${r.finished_at?fmtD(r.finished_at):''}${r.late?' · <span class="badge b-warn">تجاوز الوقت</span>':''}</div></div>${ring(p,pass?'#2f855a':'#c0392b',true)}</div>
  <div class="stats3"><div>العلامة<b><span dir="ltr">${fN(r.score)} / ${fN(r.max)}</span></b></div><div>النسبة<b>${p}%</b></div><div>${pass?'✅':'❌'} النتيجة<b>${r.passMark==null?'—':pass?'ناجح':'لم ينجح'}</b></div><div>الإجابات الصحيحة<b>${ok} من ${r.questions.length}</b></div><div>${ic('clock','ii')} المدة<b>${fmtDur(r.duration)}</b></div></div>
  ${r.showAnswers?`<h3>مراجعة الإجابات</h3>${r.questions.map((q,i)=>`<div class="rq ${q.ok?'ok':q.chosen==null?'skip':'bad'}"><div class="rqh"><b>${i+1}.</b> <span class="qt">${sanitize(q.text)}</span><span class="badge ${q.ok?'b-ok':q.chosen==null?'b-mut':'b-bad'}">${q.ok?'✓ صحيحة':q.chosen==null?'لم يُجب':'✗ خاطئة'}</span></div>
    <div class="ropts">${q.options.map((o,k)=>`<div class="ro ${k===q.correct?'c':''} ${k===q.chosen&&!q.ok?'w':''}"><span class="lt">${LET[k]||k+1}</span><span>${sanitize(o)}</span>${k===q.correct?'<small>الإجابة الصحيحة</small>':k===q.chosen?'<small>إجابتك</small>':''}</div>`).join('')}</div>
    ${q.explanation?`<div class="note" style="margin-top:6px">💡 ${sanitize(q.explanation)}</div>`:''}${q.time!=null?`<small class="muted">الوقت: ${fmtDur(q.time)}</small>`:''}</div>`).join('')}`:'<div class="note">لا يعرض هذا الاختبار الإجابات الصحيحة بعد التسليم.</div>'}`}
VIEWS.exam=id=>{if(!isStaff())return '';const e=S.exams.find(x=>x.id===id);if(!e)return '<div class="panel">الاختبار غير موجود</div>';
  const atts=S.attempts.filter(a=>a.examId===id),done=atts.filter(a=>a.status==='submitted'),prog=atts.filter(a=>a.status!=='submitted'),tg=examTargets(e);
  const dir=UI.exSort||'asc';const rows=[...done].sort((a,b)=>dir==='asc'?pctOf(a)-pctOf(b)||(a.duration-b.duration):pctOf(b)-pctOf(a)||(a.duration-b.duration));
  const ps=done.map(pctOf),avg=ps.length?Math.round(ps.reduce((a,b)=>a+b,0)/ps.length):null,passN=e.passMark==null?null:ps.filter(p=>p>=e.passMark).length,avgD=done.length?Math.round(done.reduce((a,x)=>a+(x.duration||0),0)/done.length):null;
  const notStarted=tg.filter(s=>!atts.some(a=>a.sid===s.id));
  chart('cEx',cv=>bars3D(cv,rows.map(a=>({label:(stuById(a.sid)||{name:'—'}).name.split(' ')[0],value:pctOf(a),color:e.passMark!=null&&pctOf(a)<e.passMark?'#c0392b':'#2f855a'})),{rot:rows.length>8,height:280}));
  const qstat=(e.questions||[]).map((q,i)=>{const n=done.filter(a=>a.answers[q.id]!=null).length,c=done.filter(a=>String(a.answers[q.id])===String(q.correct)).length;return{i,q,p:done.length?Math.round(c*100/done.length):0,n}});
  chart('cExQ',cv=>bars3D(cv,qstat.map(x=>({label:'س'+(x.i+1),value:x.p,color:x.p<40?'#c0392b':x.p<70?'#b98a3e':'#2f855a'})),{height:240}));
  const hard=[...qstat].sort((a,b)=>a.p-b.p).slice(0,3).filter(x=>done.length&&x.p<60);
  return `<div class="pagehead noprint"><div class="tools"><a class="btn" href="#exams">→ الاختبارات</a></div><div class="tools"><button class="btn" data-act="editExam" data-id="${id}">${ic('edit')} تعديل</button><button class="btn" data-act="exCsv" data-id="${id}">${ic('download')} تصدير العلامات</button><button class="btn gold" data-act="print">${ic('print')} طباعة / PDF</button></div></div>
  <section class="panel"><div class="rhead"><div class="lg">${logoHTML()}</div><div style="flex:1"><h2>${esc(e.title)}</h2><div class="muted">${(e.questions||[]).length} سؤالاً · ${timerLabel(e)} · ${e.trackId?esc((S.tracks.find(t=>t.id===e.trackId)||{}).name||''):'كل الطلاب'}${e.passMark!=null?' · النجاح من '+e.passMark+'%':''}</div></div><div class="muted" style="text-align:left">تاريخ الإصدار<br>${fmtD(today())}</div></div>
  <div class="kpis">${kpi(tg.length?Math.round(done.length*100/tg.length):0,'قدّموا الاختبار',`${done.length} من ${tg.length}`)}${kpi(avg,'متوسط العلامات','','var(--gold)')}${kpi(ps.length?Math.max(...ps):null,'أعلى علامة','','#2f855a')}${kpi(ps.length?Math.min(...ps):null,'أدنى علامة','','#c0392b')}${passN!=null?kpi(done.length?Math.round(passN*100/done.length):null,'نسبة النجاح',`${passN} ناجحاً`,'#2b6cb0'):''}${kpi(null,'متوسط المدة','','#6b4bb0',avgD==null?'—':Math.round(avgD/60)+'د')}</div>
  ${done.length?`<div class="grid2e"><div><h3>علامات الطلاب (مرتبة)</h3><div class="cwrap"><canvas id="cEx"></canvas></div></div><div><h3>نسبة الإجابة الصحيحة لكل سؤال</h3><div class="cwrap"><canvas id="cExQ"></canvas></div>${hard.length?`<div class="insights" style="margin-top:8px">${hard.map(x=>`<div class="w">⚠️ <span>السؤال ${x.i+1} صعب: أجاب عنه صحيحاً ${x.p}% فقط. قد يحتاج الموضوع شرحاً إضافياً.</span></div>`).join('')}</div>`:''}</div></div>`:''}</section>
  <section class="panel"><div class="ph"><h3>قائمة العلامات</h3><div class="tools noprint"><span class="muted">الترتيب:</span><button class="btn sm ${dir==='asc'?'pri':''}" data-act="exSort" data-v="asc">تصاعدي ↑</button><button class="btn sm ${dir==='desc'?'pri':''}" data-act="exSort" data-v="desc">تنازلي ↓</button></div></div>
  <div class="tw"><table><thead><tr><th>#</th><th>الطالب</th><th>الرقم الامتحاني</th><th>العلامة</th><th>النسبة</th><th>النتيجة</th><th>المدة</th><th>التسليم</th><th class="noprint"></th></tr></thead><tbody>
  ${rows.map((a,i)=>{const s=stuById(a.sid),p=pctOf(a),pass=e.passMark==null||p>=e.passMark;return `<tr><td>${i+1}</td><td><b>${esc(s?s.name:'—')}</b></td><td dir="ltr" style="text-align:right">${esc(s?s.examNo:'')}</td><td><span dir="ltr">${fN(a.score)} / ${fN(a.max)}</span></td><td>${pbar(p,pass?'#2f855a':'#c0392b')}</td><td><span class="badge ${pass?'b-ok':'b-bad'}">${e.passMark==null?'—':pass?'ناجح':'راسب'}</span>${a.late?' <span class="badge b-warn">تجاوز الوقت</span>':''}</td><td>${fmtDur(a.duration)}</td><td>${a.finishedAt?fmtD(a.finishedAt):'—'}</td><td class="tools noprint"><button class="btn sm" data-act="attDetail" data-id="${a.id}">الإجابات</button><button class="btn sm danger" data-act="resetAtt" data-id="${a.id}" title="السماح بإعادة الاختبار">إعادة</button></td></tr>`}).join('')}
  ${prog.map(a=>{const s=stuById(a.sid);return `<tr><td>—</td><td>${esc(s?s.name:'—')}</td><td dir="ltr" style="text-align:right">${esc(s?s.examNo:'')}</td><td colspan="5"><span class="badge b-warn">بدأ ولم يُنهِ</span> <small class="muted">منذ ${ago(a.startedAt)}</small></td><td class="noprint"><button class="btn sm danger" data-act="resetAtt" data-id="${a.id}">إعادة</button></td></tr>`}).join('')}
  </tbody></table></div>${!atts.length?'<div class="empty">لم يقدّم أحد هذا الاختبار بعد</div>':''}
  ${notStarted.length?`<div class="muted" style="margin-top:10px;font-size:13px">لم يبدؤوا بعد (${notStarted.length}): ${notStarted.map(s=>esc(s.name)+(s.examNo?'':' <span class="badge b-warn">بلا رقم امتحاني</span>')).join('، ')}</div>`:''}</section>`};
function studentExamsSection(s){const atts=S.attempts.filter(a=>a.sid===s.id&&a.status==='submitted');
  return `<section class="panel"><div class="ph"><h3>الاختبارات</h3>${atts.length?`<button class="btn sm noprint" data-act="stuExCsv" data-id="${s.id}">${ic('download')} تقرير اختبارات الطالب</button>`:''}</div>${atts.length?`<div class="tw"><table><thead><tr><th>الاختبار</th><th>العلامة</th><th>النسبة</th><th>المدة</th><th>التاريخ</th><th class="noprint"></th></tr></thead><tbody>${atts.sort((a,b)=>String(b.finishedAt).localeCompare(String(a.finishedAt))).map(a=>{const e=S.exams.find(x=>x.id===a.examId)||{},p=pctOf(a);return `<tr><td>${esc(e.title||'—')}</td><td><span dir="ltr">${fN(a.score)} / ${fN(a.max)}</span></td><td>${pbar(p,e.passMark!=null&&p<e.passMark?'#c0392b':'#2f855a')}</td><td>${fmtDur(a.duration)}</td><td>${fmtD(a.finishedAt)}</td><td class="noprint"><button class="btn sm" data-act="attDetail" data-id="${a.id}">الإجابات</button></td></tr>`}).join('')}</tbody></table></div>`:'<div class="muted">لم يقدّم أي اختبار بعد</div>'}</section>`}
function exportExamCSV(id){const e=S.exams.find(x=>x.id===id);const rows=S.attempts.filter(a=>a.examId===id&&a.status==='submitted').sort((a,b)=>pctOf(a)-pctOf(b));
  const head=['الترتيب','الطالب','الرقم الامتحاني','المسار','العلامة','من','النسبة %','النتيجة','المدة (ثانية)','المدة','تاريخ التسليم','تجاوز الوقت',...(e.questions||[]).map((q,i)=>'س'+(i+1))];
  download(new Blob([toCSV([head,...rows.map((a,i)=>{const s=stuById(a.sid)||{},t=S.tracks.find(x=>x.id===s.trackId)||{},p=pctOf(a);return[i+1,s.name,s.examNo,t.name,a.score,a.max,p,e.passMark==null?'':p>=e.passMark?'ناجح':'راسب',a.duration,fmtDur(a.duration),a.finishedAt?new Date(a.finishedAt).toLocaleString('ar-SY'):'',a.late?'نعم':'',...(e.questions||[]).map(q=>a.answers[q.id]==null?'—':String(a.answers[q.id])===String(q.correct)?'✓':'✗')]})])],{type:'text/csv;charset=utf-8'}),`علامات-${e.title}.csv`)}
function exportStudentExamsCSV(sid){const s=stuById(sid);const rows=S.attempts.filter(a=>a.sid===sid&&a.status==='submitted');
  download(new Blob([toCSV([['الطالب','الرقم الامتحاني','الاختبار','العلامة','من','النسبة %','النتيجة','المدة','التاريخ'],...rows.map(a=>{const e=S.exams.find(x=>x.id===a.examId)||{},p=pctOf(a);return[s.name,s.examNo,e.title,a.score,a.max,p,e.passMark==null?'':p>=e.passMark?'ناجح':'راسب',fmtDur(a.duration),a.finishedAt?fmtD(a.finishedAt):'']}),[],['المتوسط','','','','',rows.length?Math.round(rows.reduce((x,a)=>x+pctOf(a),0)/rows.length):'']])],{type:'text/csv;charset=utf-8'}),`اختبارات-${s.name}.csv`)}
function exportAllMarksCSV(){const ex=[...S.exams].filter(e=>S.attempts.some(a=>a.examId===e.id));const head=['الطالب','الرقم الامتحاني','المسار',...ex.map(e=>e.title+' %'),'المتوسط %'];
  const rows=[...S.students].map(s=>{const vals=ex.map(e=>{const a=S.attempts.find(x=>x.examId===e.id&&x.sid===s.id&&x.status==='submitted');return a?pctOf(a):''});const nums=vals.filter(v=>v!=='');return[s.name,s.examNo,(S.tracks.find(t=>t.id===s.trackId)||{}).name,...vals,nums.length?Math.round(nums.reduce((a,b)=>a+b,0)/nums.length):'']}).sort((a,b)=>(+a[a.length-1]||0)-(+b[b.length-1]||0));
  download(new Blob([toCSV([head,...rows])],{type:'text/csv;charset=utf-8'}),`كل-العلامات-${today()}.csv`)}

/* ---------- تقديم الاختبار (الطالب) ---------- */
let RUN=null;
function seeded(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}}
function shuffled(n,rnd){const a=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startExamPrompt(id){const e=(UI.myEx||[]).find(x=>x.id===id)||{};
  formModal({title:'بدء الاختبار: '+esc(e.title||''),fields:[{type:'html',html:`<div class="full note">${e.count||''} سؤالاً · ${timerLabel(e)}${e.timerMode==='total'?'. يبدأ العد فور الدخول، ويُسلَّم الاختبار تلقائياً عند انتهاء الوقت':e.timerMode==='perQuestion'?'. لكل سؤال وقته، ولا يمكن الرجوع إلى سؤال سابق':''}.</div>`},{name:'no',label:'الرقم الامتحاني',required:true,full:true,ltr:true,ac:'off',ph:'مثلاً 1001'}],submit:'دخول الاختبار',
    onSubmit:async d=>{const r=await API.startExam(id,d.no);if(r.finished){toast('انتهى وقت الاختبار وسُلِّمت إجاباتك المحفوظة');UI.myEx=null;const res=await API.examResult(r.attempt_id);showResult(res);return}runExam(r)}})}
function runExam(r){
  const rnd=seeded(r.attempt_id);const order=r.shuffle?shuffled(r.questions.length,rnd):[...r.questions.keys()];const optOrder={};r.questions.forEach(q=>{optOrder[q.id]=r.shuffle?shuffled(q.options.length,rnd):[...q.options.keys()]});
  const answers={...(r.answers||{})};let idx=0;if(r.timerMode==='perQuestion'){idx=order.findIndex(i=>answers[r.questions[i].id]==null);if(idx<0)idx=order.length-1}
  RUN={r,order,optOrder,answers,qtimes:{},idx,qStart:Date.now(),offset:new Date(r.server_now)-Date.now(),startedAt:new Date(r.started_at).getTime(),qDeadline:null,saveT:null,busy:false};
  const el=document.createElement('div');el.id='examRun';el.className='examrun';document.body.appendChild(el);document.body.classList.add('noscroll');
  window.onbeforeunload=()=>'سيُحفظ تقدمك، لكن الوقت يستمر بالعد. هل تريد المغادرة؟';
  showQ();RUN.tick=setInterval(tick,250);tick();
}
const qNow=()=>RUN.r.questions[RUN.order[RUN.idx]];
function qSec(q){return +q.sec||+RUN.r.perQuestionSec||60}
function showQ(){const R=RUN,r=R.r,q=qNow(),n=r.questions.length,pq=r.timerMode==='perQuestion';if(pq)R.qDeadline=Date.now()+qSec(q)*1000;R.qStart=Date.now();
  const answered=Object.keys(R.answers).length;
  $('#examRun').innerHTML=`<div class="erbar"><div class="lg">${logoHTML()}</div><div class="ert"><b>${esc(r.title)}</b><small>${esc(r.student_name||'')} · الرقم الامتحاني <span dir="ltr">${esc(r.exam_no||'')}</span></small></div><div class="timer" id="erTimer">${ic('clock')}<span>--:--</span></div></div>
  <div class="erprog"><span style="width:${Math.round((R.idx+1)*100/n)}%"></span></div>
  <div class="erbody"><div class="ermeta">السؤال ${R.idx+1} من ${n} · أُجيب عن ${answered}${q.points!=1?` · ${fN(q.points)} علامة`:''}</div>
  <div class="erq">${sanitize(q.text)}</div>
  <div class="eropts">${R.optOrder[q.id].map((k,j)=>`<button class="eropt ${String(R.answers[q.id])===String(k)?'sel':''}" data-ans="${k}"><span class="lt">${LET[j]||j+1}</span><span>${sanitize(q.options[k])}</span></button>`).join('')}</div>
  ${pq?'':`<div class="ermap">${R.order.map((qi,j)=>`<button data-goq="${j}" class="${j===R.idx?'cur':''} ${R.answers[r.questions[qi].id]!=null?'done':''}">${j+1}</button>`).join('')}</div>`}</div>
  <div class="erfoot">${pq?'':`<button class="btn" data-qprev ${R.idx===0?'disabled':''}>→ السابق</button>`}${R.idx<n-1?`<button class="btn pri" data-qnext>${pq?'تأكيد والانتقال':'التالي'} ←</button>`:''}<button class="btn gold" data-qfinish style="margin-inline-start:auto">${ic('check')} إنهاء وتسليم</button></div>`;
}
function tick(){const R=RUN;if(!R||R.busy)return;const r=R.r,el=$('#erTimer span'),box=$('#erTimer');if(!el)return;let left=null;
  const now=Date.now()+R.offset;
  if(r.limitSec!=null&&r.timerMode==='total')left=r.limitSec*1000-(now-R.startedAt);
  if(r.timerMode==='perQuestion'){left=R.qDeadline-Date.now();const totalLeft=r.limitSec*1000-(now-R.startedAt);if(totalLeft<=0){finishExam(true);return}}
  if(left==null){const s=Math.floor((now-R.startedAt)/1000);el.textContent=`${pad(Math.floor(s/60))}:${pad(s%60)}`;return}
  const s=Math.max(0,Math.ceil(left/1000));el.textContent=`${pad(Math.floor(s/60))}:${pad(s%60)}`;box.classList.toggle('low',s<=(r.timerMode==='perQuestion'?5:60));
  if(left<=0){if(r.timerMode==='perQuestion'&&R.idx<r.questions.length-1){recTime();R.idx++;showQ();scheduleSave()}else finishExam(true)}}
function recTime(){const R=RUN,q=qNow();R.qtimes[q.id]=Math.round((R.qtimes[q.id]||0)+(Date.now()-R.qStart)/1000)}
function scheduleSave(){clearTimeout(RUN.saveT);RUN.saveT=setTimeout(async()=>{if(!RUN)return;try{const x=await API.saveExamProgress(RUN.r.attempt_id,RUN.answers);if(x&&x.finished)finishExam(true,true)}catch(e){console.warn('save',e)}},1200)}
async function finishExam(auto,serverDone){const R=RUN;if(!R||R.busy)return;
  if(!auto){const un=R.r.questions.filter(q=>R.answers[q.id]==null).length;const c=document.createElement('div');c.className='erconfirm';c.innerHTML=`<div class="panel"><h3>تسليم الاختبار؟</h3><p>${un?`⚠️ لم تُجب عن ${un} سؤالاً.`:'أجبت عن كل الأسئلة.'} لا يمكن التعديل بعد التسليم.</p><div class="tools"><button class="btn gold" data-yes>نعم، سلّم</button><button class="btn" data-no>رجوع</button></div></div>`;$('#examRun').appendChild(c);
    c.querySelector('[data-no]').onclick=()=>c.remove();c.querySelector('[data-yes]').onclick=()=>{c.remove();finishExam(true)};return}
  R.busy=true;clearInterval(R.tick);recTime();$('#examRun').innerHTML=`<div class="loading">${auto&&!serverDone?'⏰ انتهى الوقت. ':''}جارٍ تسليم الاختبار…</div>`;
  for(let i=0;i<4;i++){try{const res=serverDone?await API.examResult(R.r.attempt_id):await API.submitExam(R.r.attempt_id,R.answers,R.qtimes);closeRunner();UI.myEx=null;showResult(res);toast('سُلِّم الاختبار ✓');return}catch(e){console.error(e);await new Promise(x=>setTimeout(x,1500*(i+1)))}}
  $('#examRun').innerHTML=`<div class="loading"><div class="panel" style="max-width:480px">تعذّر الاتصال لتسليم الاختبار. إجاباتك محفوظة على الخادم حتى آخر تعديل.<br><br><button class="btn pri" data-retry>إعادة المحاولة</button></div></div>`;
  $('#examRun [data-retry]').onclick=()=>{R.busy=false;finishExam(true,serverDone)}}
function closeRunner(){if(RUN){clearInterval(RUN.tick);clearTimeout(RUN.saveT)}RUN=null;window.onbeforeunload=null;const el=$('#examRun');if(el)el.remove();document.body.classList.remove('noscroll')}
function showResult(res,who){const b=modal(mhead('النتيجة')+resultHTML(res,who)+`<div class="factions" style="margin-top:14px"><button class="btn gold noprint" data-act="print">${ic('print')} طباعة</button><button class="btn" data-close>إغلاق</button></div>`,true);if(ROUTE.startsWith('exams'))render()}
document.addEventListener('click',e=>{if(!RUN||!e.target.closest('#examRun'))return;const R=RUN,b=e.target.closest('button');if(!b||R.busy)return;
  if(b.dataset.ans!=null){const q=qNow();R.answers[q.id]=+b.dataset.ans;$$('#examRun .eropt').forEach(x=>x.classList.toggle('sel',x===b));const m=$(`#examRun .ermap [data-goq="${R.idx}"]`);if(m)m.classList.add('done');scheduleSave();return}
  if(b.hasAttribute('data-qnext')){recTime();R.idx++;showQ();scheduleSave();return}
  if(b.hasAttribute('data-qprev')){recTime();R.idx--;showQ();return}
  if(b.dataset.goq!=null){recTime();R.idx=+b.dataset.goq;showQ();return}
  if(b.hasAttribute('data-qfinish'))finishExam(false)},true);
function attDetailStaff(aid){const a=S.attempts.find(x=>x.id===aid),e=S.exams.find(x=>x.id===a.examId),s=stuById(a.sid);showResult(resultFor(e,{...a,qTimes:a.qTimes||{}},true),s?s.name+(s.examNo?' ('+s.examNo+')':''):'')}

/* ================= النسخة الاحتياطية الكاملة ================= */
async function backupAll(){try{toast('جارٍ تجهيز النسخة الاحتياطية الكاملة…');const JSZip=await loadJSZip();const zip=new JSZip();let paths=[];
  if(API.mode==='supabase'){const dump=await API.exportBackup();zip.file('data.json',JSON.stringify(dump));
    for(const[t,rows]of Object.entries(dump.tables)){const keys=[...new Set(rows.flatMap(o=>Object.keys(o)))];zip.file(`csv/${t}.csv`,toCSV([keys,...rows.map(o=>keys.map(k=>o[k]))]))}
    paths=dump.tables.submissions.flatMap(x=>((x.data||{}).files||[]).map(f=>f.path||f.id))}
  else{const st=snap();zip.file('data.json',JSON.stringify({format:'ifad-demo-backup',version:3,date:new Date().toISOString(),state:st}));
    ['students','tasks','subs','sessions','notes','history','surveys','responses','participation','exams','attempts','notifications','users','activity','tracks'].forEach(k=>{const arr=(st[k]||[]).map(x=>{const o={...x};delete o.salt;delete o.hash;delete o.photo;return o});const keys=[...new Set(arr.flatMap(o=>Object.keys(o)))];zip.file(`csv/${k}.csv`,toCSV([keys,...arr.map(o=>keys.map(k2=>o[k2]))]))});
    paths=st.subs.flatMap(x=>(x.files||[]).map(f=>f.path||f.id))}
  let n=0;for(const p of paths){try{const b=await API.getFile(p);if(b){zip.file('files/'+p,b);n++}}catch(e){}}
  zip.file('اقرأني.txt',`نسخة احتياطية كاملة من ${S.settings.name}\nالتاريخ: ${new Date().toLocaleString('ar-SY')}\nللاستعادة: الإعدادات ← استعادة نسخة (ZIP) بحساب المطور.\n⚠️ هذا الملف يحتوي كل البيانات وكلمات المرور المشفّرة: احفظه في مكان آمن.`);
  const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});download(blob,`نسخة-احتياطية-كاملة-${today()}.zip`);toast(`تمت النسخة: كل البيانات و${n} ملفاً ✓`)}catch(e){toast(errMsg(e),'err')}}
async function restoreAll(file){try{const JSZip=await loadJSZip();const zip=await JSZip.loadAsync(file);const j=JSON.parse(await zip.file('data.json').async('string'));
  const files=Object.keys(zip.files).filter(p=>p.startsWith('files/')&&!zip.files[p].dir);
  if(API.mode==='supabase'){if(j.format!=='ifad-db-backup')throw new Error('هذه نسخة من الوضع التجريبي، ولا تُستعاد على خادم Supabase');
    confirmBox(`استعادة نسخة بتاريخ ${fmtD(j.date)}: ${j.auth_users.length} حساباً، ${j.tables.students.length} طالباً، ${files.length} ملفاً. البيانات الموجودة بنفس المعرّفات تُستبدل، ولا يُحذف شيء آخر. متابعة؟`,async()=>{
      try{toast('جارٍ الاستعادة… لا تغلق الصفحة');let k=0;for(const p of files){await API.putFile(p.slice(6),await zip.file(p).async('blob'));k++}
        const r=await API.restoreBackup(j);await reload();toast(`تمت الاستعادة ✓ حسابات جديدة: ${r.users_created}، مطابقة: ${r.users_matched}، ملفات: ${k}`)}catch(e){toast('فشلت الاستعادة: '+errMsg(e),'err')}},'استعادة')}
  else{if(!j.state)throw new Error('هذه نسخة من خادم Supabase، وتُستعاد على خادم Supabase فقط');
    confirmBox('ستُستبدل كل البيانات الحالية بمحتوى النسخة الاحتياطية. هل أنت متأكد؟',async()=>{for(const p of files)await API.putFile(p.slice(6),await zip.file(p).async('blob'));
      S=normalize(j.state);if(!S.users.length)S.users=blankState(true).users;await API.commit(null,S);const me=S.users.find(u=>u.id===ME.id);if(!me){await API.logout();ME=null}else ME=me;render();toast('تمت الاستعادة ✓')},'استعادة')}}
  catch(e){toast(errMsg(e)||'الملف ليس نسخة احتياطية صالحة','err')}}

/* ================= events ================= */
function go(r){location.hash=r}
const ACT={
  menu:()=>$('#side').classList.toggle('open'),
  palette:el=>{PREFS.palette=+el.dataset.i;savePrefs();render()},
  theme:el=>{PREFS.theme=el.dataset.v;savePrefs();render()},
  logout:async()=>{await API.logout();ME=null;location.hash='';render()},
  mypw:myPw,addStudent:()=>studentForm(),editStudent:el=>studentForm(stuById(el.dataset.id)),
  delStudent:el=>{const s=stuById(el.dataset.id);confirmBox(`حذف الطالب «${esc(s.name)}» وكل تسليماته وسجلاته وحسابه؟`,async()=>{go('students');const paths=S.subs.filter(x=>x.sid===s.id).flatMap(x=>(x.files||[]).map(f=>f.path||f.id));const accs=S.users.filter(u=>u.studentId===s.id);
    await mutate(S=>{S.students=S.students.filter(x=>x.id!==s.id);S.subs=S.subs.filter(x=>x.sid!==s.id);S.history=S.history.filter(h=>h.sid!==s.id);S.notes=S.notes.filter(n=>n.sid!==s.id);S.sessions.forEach(q=>q.present=(q.present||[]).filter(i=>i!==s.id));log('حُذف الطالب '+s.name)});
    try{await API.delFiles(paths);for(const u of accs)await API.deleteUser(u.id)}catch(e){toast(errMsg(e),'err')}await reload()})},
  addTrack:()=>trackForm(),editTrack:el=>trackForm(S.tracks.find(t=>t.id===el.dataset.id)),
  delTrack:el=>{const t=S.tracks.find(x=>x.id===el.dataset.id);if(S.students.some(s=>s.trackId===t.id)){toast('انقل طلاب المسار أولاً','err');return}confirmBox(`حذف المسار «${esc(t.name)}» بكل محاوره وأهدافه؟`,()=>{go('tracks');mutate(S=>S.tracks=S.tracks.filter(x=>x.id!==t.id))})},
  addAxis:el=>formModal({title:'محور علمي جديد',fields:[{name:'name',label:'اسم المحور',required:true,full:true,ph:'مثلاً: لغة C++ ومنهجية الفهم'}],onSubmit:d=>{mutate(S=>S.tracks.find(t=>t.id===el.dataset.id).axes.push({id:uid(),name:d.name,goals:[]}))}}),
  editAxis:el=>{const a=S.tracks.find(t=>t.id===el.dataset.t).axes.find(a=>a.id===el.dataset.a);formModal({title:'تعديل المحور',fields:[{name:'name',label:'اسم المحور',value:a.name,required:true,full:true}],onSubmit:d=>{mutate(S=>S.tracks.find(t=>t.id===el.dataset.t).axes.find(x=>x.id===a.id).name=d.name)}})},
  delAxis:el=>confirmBox('حذف هذا المحور بكل أهدافه؟',()=>mutate(S=>{const t=S.tracks.find(t=>t.id===el.dataset.t);t.axes=t.axes.filter(a=>a.id!==el.dataset.a)})),
  addGoal:el=>goalForm(el.dataset.t,el.dataset.a),
  editGoal:el=>goalForm(el.dataset.t,el.dataset.a,S.tracks.find(t=>t.id===el.dataset.t).axes.find(a=>a.id===el.dataset.a).goals.find(g=>g.id===el.dataset.g)),
  delGoal:el=>confirmBox('حذف هذا الهدف؟',()=>mutate(S=>{const a=S.tracks.find(t=>t.id===el.dataset.t).axes.find(a=>a.id===el.dataset.a);a.goals=a.goals.filter(g=>g.id!==el.dataset.g)})),
  addTask:()=>taskForm(),editTask:el=>taskForm(taskById(el.dataset.id)),taskInfo:el=>taskInfo(el.dataset.id),
  delTask:el=>confirmBox('حذف الوظيفة وكل تسليماتها؟',async()=>{const paths=S.subs.filter(x=>x.taskId===el.dataset.id).flatMap(x=>(x.files||[]).map(f=>f.path||f.id));await mutate(S=>{S.subs=S.subs.filter(x=>x.taskId!==el.dataset.id);S.tasks=S.tasks.filter(t=>t.id!==el.dataset.id)});API.delFiles(paths).catch(()=>{})}),
  addSession:()=>sessionForm(),editSession:el=>sessionForm(S.sessions.find(x=>x.id===el.dataset.id)),
  delSession:el=>confirmBox('حذف هذه الجلسة؟',()=>mutate(S=>S.sessions=S.sessions.filter(x=>x.id!==el.dataset.id))),
  submit:el=>submitForm(el.dataset.id),review:el=>reviewBox(el.dataset.id),
  dl:async el=>{const b=await API.getFile(el.dataset.path);if(b)download(b,el.dataset.name);else toast('تعذّر تنزيل الملف','err')},
  addUser:()=>userForm(),editUser:el=>userForm(S.users.find(u=>u.id===el.dataset.id)),
  delUser:el=>confirmBox('حذف هذا المستخدم؟ لن يستطيع الدخول بعد ذلك.',async()=>{try{await API.deleteUser(el.dataset.id);await reload();toast('حُذف ✓')}catch(e){toast(errMsg(e),'err')}}),
  rtype:el=>{UI.r.type=el.dataset.v;render()},rscopeTo:el=>{UI.r.scope=el.dataset.id;render();scrollTo(0,0)},
  reportFor:el=>{UI.r=Object.assign(UI.r||{type:'m',date:today(),track:''},{scope:el.dataset.id})},
  print:()=>window.print(),backup:backupAll,
  inTab:el=>{UI.inTab=el.dataset.v;render()},sendNotif:()=>sendNotifForm(),readAll:()=>markRead(myNotifs().map(n=>n.id)),
  openNotif:el=>{el.classList.toggle('open');if(myNotifs().some(n=>n.id===el.dataset.id))markRead([el.dataset.id])},
  delNotif:el=>confirmBox('حذف هذا الإشعار؟',()=>mutate(S=>{S.notifications=S.notifications.filter(n=>n.id!==el.dataset.id);S.reads=S.reads.filter(r=>r.nid!==el.dataset.id)})),
  newExam:()=>examEditor({id:uid(),_new:true,title:'',desc:'',trackId:'',status:'draft',timerMode:'total',totalMinutes:30,perQuestionSec:60,passMark:50,showAnswers:true,shuffle:false,created:today(),questions:[]}),
  editExam:el=>examEditor(S.exams.find(x=>x.id===el.dataset.id)),
  dupExam:el=>{const e=S.exams.find(x=>x.id===el.dataset.id);examEditor({...JSON.parse(JSON.stringify(e)),id:uid(),_new:true,demo:undefined,title:e.title+' (نسخة)',status:'draft',created:today(),questions:e.questions.map(q=>({...q,id:uid()}))})},
  delExam:el=>{const e=S.exams.find(x=>x.id===el.dataset.id);confirmBox(`حذف الاختبار «${esc(e.title)}» وكل محاولاته وعلاماته؟`,()=>{if(ROUTE.startsWith('exam:'))go('exams');mutate(S=>{S.exams=S.exams.filter(x=>x.id!==e.id);S.attempts=S.attempts.filter(a=>a.examId!==e.id);log('حُذف الاختبار: '+e.title)})})},
  exStatus:el=>mutate(S=>{const e=S.exams.find(x=>x.id===el.dataset.id);const pub=el.dataset.v==='open'&&e.status!=='open';e.status=el.dataset.v;log((e.status==='open'?'نُشر':'أُغلق')+' الاختبار: '+e.title);
    if(pub)S.notifications.unshift({id:uid(),title:'اختبار جديد: '+e.title,body:`${(e.questions||[]).length} سؤالاً · ${timerLabel(e)}. ادخل إلى «اختباراتي» وجهّز رقمك الامتحاني.`,target:e.trackId?'track':'all',trackId:e.trackId||'',sid:'',createdAt:new Date().toISOString(),createdBy:ME.id})}),
  exSort:el=>{UI.exSort=el.dataset.v;render()},exCsv:el=>exportExamCSV(el.dataset.id),stuExCsv:el=>exportStudentExamsCSV(el.dataset.id),allMarksCsv:exportAllMarksCSV,
  attDetail:el=>attDetailStaff(el.dataset.id),
  resetAtt:el=>confirmBox('حذف محاولة الطالب والسماح له بإعادة الاختبار؟',async()=>{try{await API.resetAttempt(el.dataset.id);S.attempts=S.attempts.filter(a=>a.id!==el.dataset.id);render();toast('يمكن للطالب إعادة الاختبار الآن')}catch(e){toast(errMsg(e),'err')}},'إعادة'),
  startExam:el=>startExamPrompt(el.dataset.id),
  myResult:async el=>{try{showResult(await API.examResult(el.dataset.id))}catch(e){toast(errMsg(e),'err')}},
  genExamNos:()=>{const used=new Set(S.students.map(s=>s.examNo).filter(Boolean));const need=S.students.filter(s=>!s.examNo);if(!need.length){toast('كل الطلاب لديهم أرقام امتحانية');return}
    let n=1001;const ids={};need.forEach(s=>{while(used.has(String(n)))n++;ids[s.id]=String(n);used.add(String(n));n++});
    mutate(S=>{S.students.forEach(s=>{if(ids[s.id])s.examNo=ids[s.id]});log('وُلّدت أرقام امتحانية لـ '+need.length+' طالباً')});toast(`وُلّد ${need.length} رقماً امتحانياً ✓`)},
  rmLogo:()=>mutate(S=>S.settings.logo=''),rmHero:()=>mutate(S=>S.settings.hero=''),
  clearDemo:()=>confirmBox('مسح كل الطلاب والوظائف والجلسات والاستبيانات التجريبية؟ (المسارات والأهداف والإعدادات تبقى)',async()=>{const du=S.users.filter(u=>u.demo);
    await mutate(S=>{const ds=new Set(S.students.filter(s=>s.demo).map(s=>s.id)),dt=new Set(S.tasks.filter(t=>t.demo).map(t=>t.id)),dv=new Set(S.surveys.filter(v=>v.demo).map(v=>v.id));S.students=S.students.filter(s=>!s.demo);if(API.mode==='demo')S.users=S.users.filter(u=>!u.demo);S.tasks=S.tasks.filter(t=>!t.demo);S.subs=S.subs.filter(x=>!x.demo&&!ds.has(x.sid)&&!dt.has(x.taskId));S.sessions=S.sessions.filter(x=>!x.demo);S.history=S.history.filter(h=>!ds.has(h.sid));S.notes=S.notes.filter(n=>!ds.has(n.sid));S.surveys=S.surveys.filter(v=>!v.demo);if(API.mode==='demo'){S.responses=S.responses.filter(r=>!dv.has(r.surveyId));S.participation=S.participation.filter(p=>!dv.has(p.surveyId));S.activity=[]}log('مُسحت البيانات التجريبية، المنصة جاهزة للعمل')});if(API.mode==='supabase')await reload()},'مسح'),
  loadDemo:()=>mutate(S=>seedDemo(S,API.mode==='demo')),
  resetAll:()=>confirmBox('سيُحذف كل شيء وتعود المنصة لحالتها الأولى (admin / admin123). هل أنت متأكد تماماً؟',async()=>{await API.reset();await API.logout();location.reload()},'إعادة الضبط'),
  newSv:()=>surveyBuilder({id:uid(),_new:true,title:'',desc:'',anonymous:false,trackId:'',status:'draft',deadline:'',created:today(),questions:[]}),
  svTpl:el=>surveyBuilder({id:uid(),_new:true,...surveyTemplate(el.dataset.k),anonymous:el.dataset.k==='monthly',trackId:'',status:'draft',deadline:'',created:today()}),
  editSv:el=>surveyBuilder(S.surveys.find(v=>v.id===el.dataset.id)),
  dupSv:el=>{const v=S.surveys.find(x=>x.id===el.dataset.id);surveyBuilder({...JSON.parse(JSON.stringify(v)),id:uid(),_new:true,demo:undefined,title:v.title+' (نسخة)',status:'draft',created:today(),questions:v.questions.map(q=>({...q,id:uid()}))})},
  delSv:el=>{const v=S.surveys.find(x=>x.id===el.dataset.id);confirmBox(`حذف الاستبيان «${esc(v.title)}» وكل إجاباته؟`,async()=>{try{await API.deleteResponses(v.id)}catch(e){}await mutate(S=>{S.surveys=S.surveys.filter(x=>x.id!==v.id);S.responses=S.responses.filter(r=>r.surveyId!==v.id);S.participation=S.participation.filter(p=>p.surveyId!==v.id);log('حُذف الاستبيان: '+v.title)});if(ROUTE.startsWith('survey:'))go('surveys')})},
  svStatus:el=>mutate(S=>{const v=S.surveys.find(x=>x.id===el.dataset.id);v.status=el.dataset.v;log((v.status==='open'?'نُشر':'أُغلق')+' الاستبيان: '+v.title)}),
  answerSv:el=>answerForm(el.dataset.id),svCsv:el=>exportSurveyCSV(el.dataset.id)
};
document.addEventListener('click',e=>{
  if(e.target.id==='modal'||e.target.closest('[data-close]')){closeModal();return}
  const sr=$('#sres');if(sr&&!e.target.closest('.hsearch'))sr.classList.remove('open');
  if(e.target.closest('#modal [data-qadd],#modal [data-qdel],#modal [data-qmv],#modal [data-svsave]'))return;
  const el0=e.target.closest('[data-act]');const g=e.target.closest('[data-go]');
  if(g&&!e.target.closest('button,a,input,select,textarea')){go(g.dataset.go);return}
  const el=el0;if(!el||el.matches('input,textarea,select'))return;
  const fn=ACT[el.dataset.act];if(!fn)return;if(el.tagName==='A'&&el.dataset.act!=='reportFor')e.preventDefault();fn(el)});
document.addEventListener('change',e=>{const el=e.target;
  if(el.dataset.act==='goalv'){const v=+el.value,sid=el.dataset.sid,gid=el.dataset.gid;mutate(S=>{const s=S.students.find(x=>x.id===sid);s.progress=s.progress||{};s.progress[gid]=v;const d=today();const h=S.history.find(q=>q.sid===sid&&q.gid===gid&&q.date===d);if(h)h.value=v;else S.history.push({id:uid(),sid,gid,date:d,value:v})});return}
  if(el.dataset.act==='note'){const{sid,key}=el.dataset,text=el.value;mutate(S=>{const nid=sid+'|'+key;let n=S.notes.find(q=>q.id===nid||(q.sid===sid&&q.key===key));if(!n){n={id:nid,sid,key};S.notes.push(n)}n.text=text});toast('حُفظت الملاحظة');return}
  if(el.id==='st'){UI.sf={...(UI.sf||{q:''}),t:el.value};render()}
  if(el.id==='subf'){UI.subf=el.value;render()}
  if(el.id==='svtf'){UI.svTrack=el.value;render()}
  if(el.id==='rdate'){UI.r.date=el.value||today();render()}
  if(el.id==='rscope'){UI.r.scope=el.value;render()}
  if(el.id==='rtrack'){UI.r.track=el.value;render()}
  if(el.id==='restore'&&el.files[0]){restoreAll(el.files[0]);el.value=''}
});
document.addEventListener('input',e=>{const el=e.target;
  if(el.dataset.act==='goalv')el.nextElementSibling.textContent=el.value+'%';
  if(el.id==='sq'){UI.sf={...(UI.sf||{t:''}),q:el.value};const pos=el.selectionStart;render();const n=$('#sq');n.focus();n.setSelectionRange(pos,pos)}
  if(el.id==='gsearch')gsearch(el.value)});
document.addEventListener('submit',async e=>{const f=e.target;
  if(f.id==='setId'){e.preventDefault();const fd=new FormData(f),lf=fd.get('logo'),hf=fd.get('hero');const logo=lf&&lf.size?await readImage(lf,320):null,hero=hf&&hf.size?await readImage(hf,1600,.82,true):null;
    mutate(S=>{S.settings.name=fd.get('name');S.settings.subtitle=fd.get('subtitle');S.settings.palette=+fd.get('palette');S.settings.theme=fd.get('theme');if(logo)S.settings.logo=logo;if(hero)S.settings.hero=hero});delete PREFS.palette;delete PREFS.theme;savePrefs();toast('تم الحفظ')}
  if(f.id==='setProg'){e.preventDefault();const fd=new FormData(f);mutate(S=>{S.settings.startDate=fd.get('startDate');S.settings.years=clamp(+fd.get('years'),1,10);S.settings.finalGoal=fd.get('finalGoal')});toast('تم الحفظ')}});
function gsearch(q){const box=$('#sres');q=q.trim();if(!q){box.classList.remove('open');return}const R=[];
  S.students.forEach(s=>s.name.includes(q)&&R.push([`#student:${s.id}`,'user',s.name,'طالب']));
  S.tracks.forEach(t=>{t.name.includes(q)&&R.push([`#track:${t.id}`,'track',t.name,'مسار']);t.axes.forEach(a=>{a.name.includes(q)&&R.push([`#track:${t.id}`,'target',a.name,'محور']);a.goals.forEach(g=>g.title.toLowerCase().includes(q.toLowerCase())&&R.push([`#track:${t.id}`,'target',g.title,'هدف · '+t.name]))})});
  S.tasks.forEach(t=>t.title.includes(q)&&R.push(['#tasks','task',t.title,'وظيفة']));
  S.surveys.forEach(v=>v.title.includes(q)&&R.push([`#survey:${v.id}`,'survey',v.title,'استبيان']));
  box.innerHTML=R.slice(0,12).map(([h,i,l,k])=>`<a href="${h}">${ic(i)}${esc(l)}<small>${k}</small></a>`).join('')||'<a>لا نتائج</a>';box.classList.add('open')}
window.addEventListener('hashchange',()=>{if(RUN)return;ROUTE=(location.hash.slice(1)||'home');if(ROUTE==='exams'&&ME&&ME.role==='student')UI.myEx=null;const sd=$('#side');if(sd)sd.classList.remove('open');render();scrollTo(0,0)});
let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(ME&&!$('#modal').classList.contains('open')&&!(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)))render()},250)});

/* ================= boot ================= */
(async()=>{
  // متصفح الهاتف في وضع «نسخة سطح المكتب»: نعرض تخطيط الهاتف
  try{if(matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<820&&innerWidth>=820)document.body.classList.add('mobile')}catch(e){}
  $('#root').innerHTML='<div class="loading">جارٍ التحميل…</div>';
  S=normalize(null);API.attach(()=>S);
  try{
    const {state,me}=await API.init();
    if(API.mode==='demo'){
      if(!state){S=blankState(true);seedDemo(S,true);await API.commit(null,S)}else S=normalize(state);
      ME=me?S.users.find(u=>u.id===me.id)||null:null;
    }else{S=normalize(state);ME=me;if(ME)await afterLogin()}
  }catch(e){console.error(e);$('#root').innerHTML=`<div class="loading"><div class="panel" style="max-width:520px">تعذّر الاتصال بالخادم: ${esc(errMsg(e))}<br><br><button class="btn pri" onclick="location.reload()">إعادة المحاولة</button></div></div>`;return}
  ROUTE=location.hash.slice(1)||'home';render();
})();
window.__app={get S(){return S},get ME(){return ME},reviewBox,API};
