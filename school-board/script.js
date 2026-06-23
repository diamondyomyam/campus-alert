/* ================= LIVE THAI DATE & FLIP CLOCK ================= */
const thaiDays = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const thaiMonthsShort = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

function buildFlipClock(){
  const wrap = document.getElementById('flipclock');
  wrap.innerHTML = '';
  const order = ['h1','h2','colon1','m1','m2','colon2','s1','s2'];
  order.forEach(id=>{
    if(id.startsWith('colon')){
      const c = document.createElement('span');
      c.className='flip-colon'; c.textContent=':';
      wrap.appendChild(c);
    } else {
      const u = document.createElement('div');
      u.className='flip-unit'; u.id='fc-'+id;
      u.innerHTML = '<span>0</span>';
      wrap.appendChild(u);
    }
  });
}
function setDigit(id, val){
  const el = document.getElementById('fc-'+id);
  const inner = el.querySelector('span');
  if(inner.textContent === val) return;
  el.classList.add('flip');
  setTimeout(()=>{
    inner.textContent = val;
    el.classList.remove('flip');
  }, 140);
}
function updateClock(){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');
  setDigit('h1', hh[0]); setDigit('h2', hh[1]);
  setDigit('m1', mm[0]); setDigit('m2', mm[1]);
  setDigit('s1', ss[0]); setDigit('s2', ss[1]);

  const buddhistYear = now.getFullYear() + 543;
  document.getElementById('thaiDateLine').textContent =
    `วัน${thaiDays[now.getDay()]}ที่ ${now.getDate()} ${thaiMonths[now.getMonth()]} พ.ศ. ${buddhistYear}`;
  document.getElementById('thaiDateLine2').textContent = `เวลาท้องถิ่น · อัปเดตทุกวินาที`;
}
buildFlipClock();
updateClock();
setInterval(updateClock, 1000);

/* ================= LED MARQUEE NEWS ================= */
const ledItems = [
  'ยังไม่มีข่าวประชาสัมพันธ์ในขณะนี้ — เพิ่มข้อความได้ที่ตัวแปร ledItems'
];
const ledTrack = document.getElementById('ledTrack');
const ledTextEl = document.getElementById('ledText');
let ledIndex = 0;

function cycleLed(){
  ledTextEl.textContent = ledItems[ledIndex];
  // restart scroll animation
  ledTrack.style.animation = 'none';
  void ledTrack.offsetWidth;
  ledTrack.style.animation = null;
  ledIndex = (ledIndex + 1) % ledItems.length;
}
cycleLed();
setInterval(cycleLed, 9000);

/* ================= SEARCH HELPERS ================= */
let currentSearch = '';
function escRe(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function hl(text, term){
  if(!term) return text;
  const re = new RegExp('('+escRe(term)+')', 'ig');
  return text.replace(re, '<mark class="hit">$1</mark>');
}
function matchAny(fields, term){
  const t = term.toLowerCase();
  return fields.some(f => (f||'').toLowerCase().includes(t));
}
function emptyState(term){
  if(term){
    return `<div class="empty-state"><span class="e-ic">🔎</span>ไม่พบรายการที่ตรงกับ "${term}"<br>ลองค้นหาคำอื่น เช่น สอบ, ฝนตก, ชมรม</div>`;
  }
  return `<div class="empty-state"><span class="e-ic">🗂️</span>ยังไม่มีข้อมูลในส่วนนี้<br>เพิ่มรายการได้ที่ไฟล์ script.js</div>`;
}

/* ================= AGENDA (CALENDAR) ================= */
const agenda = [
  // ยังไม่มีข้อมูล — เพิ่มกิจกรรมได้ที่นี่ เช่น:
  // {d:24, m:'มิ.ย.', t:'ชื่อกิจกรรม', s:'รายละเอียดกิจกรรม', tag:'หมวดหมู่', cls:'tag-blue'},
];
const agendaList = document.getElementById('agendaList');
function renderAgenda(term){
  const filtered = agenda.filter(a => !term || matchAny([a.t,a.s,a.tag], term));
  agendaList.innerHTML = filtered.length ? filtered.map(a=>`
    <div class="agenda-item">
      <div class="datebadge"><div class="dnum">${a.d}</div><div class="dmon">${a.m}</div></div>
      <div class="agenda-text">
        <div class="t">${hl(a.t, term)}</div>
        <div class="s">${hl(a.s, term)}</div>
        <span class="agenda-tag ${a.cls}">${a.tag}</span>
      </div>
    </div>
  `).join('') : emptyState(term);
  return filtered.length;
}

/* ================= NEWS FEED (auto refresh + live push) ================= */
const newsData = [
  // ยังไม่มีข้อมูล — เพิ่มข่าวได้ที่นี่ เช่น:
  // {cat:'urgent', badge:'ข่าวด่วน', h:'หัวข้อข่าว', min:0, fresh:false},
];
const newsList = document.getElementById('newsList');
function renderNews(term){
  const filtered = newsData.filter(n => !term || matchAny([n.h, n.badge], term));
  newsList.innerHTML = filtered.length ? filtered.map(n=>`
    <div class="news-item ${n.fresh ? 'fresh':''}">
      <div class="news-cat cat-${n.cat}"></div>
      <div class="news-body">
        <div class="nh">${hl(n.h, term)}</div>
        <div class="nm">
          <span class="news-badge bdg-${n.cat}">${n.badge}</span>
          <span class="news-time">${n.min < 60 ? n.min+' นาทีที่แล้ว' : Math.floor(n.min/60)+' ชม. ที่แล้ว'}</span>
        </div>
      </div>
    </div>
  `).join('') : emptyState(term);
  return filtered.length;
}
// simulate live ticking minutes
setInterval(()=>{
  newsData.forEach(n=>{ n.min++; if(n.min>2) n.fresh=false; });
  renderAll();
}, 30000);

/* ================= NOTICE BOARD ================= */
const board = [
  // ยังไม่มีข้อมูล — เพิ่มประกาศได้ที่นี่ เช่น:
  // {cls:'urgent', t:'หัวข้อประกาศ', d:'รายละเอียดประกาศ', f:'ผู้ประกาศ'},
];
const boardList = document.getElementById('boardList');
function renderBoard(term){
  const filtered = board.filter(b => !term || matchAny([b.t, b.d], term));
  boardList.innerHTML = filtered.length ? filtered.map(b=>`
    <div class="sticky ${b.cls}">
      <div class="pin"></div>
      <div class="st">${hl(b.t, term)}</div>
      <div class="sd">${hl(b.d, term)}</div>
      <div class="sf">${b.f}</div>
    </div>
  `).join('') : emptyState(term);
  return filtered.length;
}

/* ================= RENDER ALL + SEARCH WIRING ================= */
const searchInput = document.getElementById('searchInput');
const searchStatus = document.getElementById('searchStatus');
const searchbarEl = document.querySelector('.searchbar');
const searchClear = document.getElementById('searchClear');

function renderAll(){
  const term = currentSearch;
  const a = renderAgenda(term);
  const n = renderNews(term);
  const b = renderBoard(term);
  if(!term){
    searchStatus.textContent = '';
  } else {
    const total = a+n+b;
    searchStatus.innerHTML = total
      ? `พบ <b>${total}</b> รายการที่ตรงกับ "${term}" — ปฏิทิน ${a} · ข่าว ${n} · ประกาศ ${b}`
      : `ไม่พบรายการที่ตรงกับ "${term}" ในเว็บไซต์นี้`;
  }
}
searchInput.addEventListener('input', e=>{
  currentSearch = e.target.value.trim();
  searchbarEl.classList.toggle('has-text', currentSearch.length>0);
  renderAll();
});
searchClear.addEventListener('click', ()=>{
  searchInput.value=''; currentSearch='';
  searchbarEl.classList.remove('has-text');
  renderAll();
  searchInput.focus();
});
renderAll();

/* ================= NOTIFICATION SYSTEM ================= */
const bellBtn = document.getElementById('bellBtn');
const bellBadge = document.getElementById('bellBadge');
const bellPanel = document.getElementById('bellPanel');
const bellList = document.getElementById('bellList');
const clearNotis = document.getElementById('clearNotis');
const toastWrap = document.getElementById('toastWrap');

const notiIcons = {urgent:'⚠️', event:'🎉', general:'📰', board:'📌'};
let notifications = [];
let unread = 0;

function timeNowLabel(){
  const d = new Date();
  return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function renderBell(){
  bellBadge.textContent = unread;
  bellBadge.classList.toggle('zero', unread===0);
  bellList.innerHTML = notifications.length ? notifications.map(n=>`
    <div class="bell-item">
      <div class="bdot" style="background:${n.color}"></div>
      <div class="btxt"><b>${notiIcons[n.cat]||'🔔'} ${n.text}</b><span>${n.time}</span></div>
    </div>
  `).join('') : `<div class="bellpanel-empty">ยังไม่มีการแจ้งเตือนใหม่</div>`;
}
function pushNotification(text, cat, withToast){
  const colorMap = {urgent:'#e6453a', event:'#f4622e', general:'#2e86e0', board:'#3a7d44'};
  notifications.unshift({text, cat, time: timeNowLabel(), color: colorMap[cat]||'#2e86e0'});
  if(notifications.length>12) notifications.pop();
  unread++;
  renderBell();
  if(withToast) showToast(text, cat);
}
function showToast(text, cat){
  const el = document.createElement('div');
  el.className='toast';
  el.innerHTML = `<span class="t-ic">${notiIcons[cat]||'🔔'}</span><div class="t-txt"><b>การแจ้งเตือนใหม่</b>${text}</div>`;
  toastWrap.appendChild(el);
  setTimeout(()=>{
    el.classList.add('out');
    setTimeout(()=>el.remove(), 250);
  }, 5000);
}

// ยังไม่มีการแจ้งเตือนล่วงหน้า — เพิ่ม pushNotification(...) ที่นี่เมื่อต้องการ

bellBtn.addEventListener('click', e=>{
  e.stopPropagation();
  bellPanel.classList.toggle('open');
  if(bellPanel.classList.contains('open')){ unread = 0; renderBell(); }
});
document.addEventListener('click', e=>{
  if(!e.target.closest('.bellwrap')) bellPanel.classList.remove('open');
});
clearNotis.addEventListener('click', ()=>{
  notifications = []; unread = 0; renderBell();
});

// พูลข้อมูลจำลองที่จะ "เด้ง" เข้ามาทีละรายการ — ยังไม่ใส่ข้อมูล เพิ่มได้ตามตัวอย่างที่คอมเมนต์ไว้
const livePool = [
  // {target:'news', cat:'urgent', badge:'ข่าวด่วน', h:'หัวข้อข่าว'},
  // {target:'board',cat:'board',  t:'หัวข้อประกาศ', d:'รายละเอียด', f:'ผู้ประกาศ'},
];
let poolIndex = 0;
setInterval(()=>{
  if(poolIndex >= livePool.length) return; // pool exhausted, stop simulating
  const item = livePool[poolIndex++];
  if(item.target === 'news'){
    newsData.unshift({cat:item.cat, badge:item.badge, h:item.h, min:0, fresh:true});
    pushNotification(item.h, item.cat, true);
  } else {
    board.unshift({cls:'info', t:item.t, d:item.d, f:item.f});
    pushNotification(item.t, 'board', true);
  }
  renderAll();
}, 45000);
