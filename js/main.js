// ============================================================
// 동아광고 홈페이지 - 메인 스크립트
// Supabase가 아직 연결되지 않았다면 기본값(DEFAULT_*)으로 미리보기가 됩니다.
// js/supabase-client.js 에서 프로젝트 URL/KEY를 설정하면 실제 데이터로 전환됩니다.
// ============================================================

const ICONS = {
  signage: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="6" width="18" height="9" rx="1.5"/><path d="M8 19h8M12 15v4"/></svg>',
  banner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 5h16v10H8l-4 4V5z"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="3" width="12" height="7"/><path d="M6 17h12v4H6zM4 10h16v7H4z"/></svg>',
  film: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18M8 4v5"/></svg>',
  craft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l9 5v8l-9 5-9-5V8l9-5z"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-6h6v6M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l1.6-2.6h4.8L16 7"/><circle cx="12" cy="13.5" r="3.4"/></svg>',
};

const DEFAULT_HERO = [
  { headline:'순천의 광고를 디자인합니다.', subtext:'간판 · 현수막 · 실사출력 · 광고물 제작 · 시공', button_text:'무료 견적문의', button_link:'#inquiry', button2_text:'시공사례 보기', button2_link:'#portfolio' },
  { headline:'매장의 첫인상을 만듭니다.', subtext:'기획부터 디자인, 제작과 시공까지', button_text:'간판 제작 문의', button_link:'#inquiry' },
  { headline:'필요한 광고를 정확하게 만듭니다.', subtext:'현수막 · 실사출력 · 시트 · 각종 광고물', button_text:'서비스 보기', button_link:'#services' },
  { headline:'디자인부터 시공까지 한 번에', subtext:'동아광고가 책임지고 제작합니다.', button_text:'견적문의', button_link:'#inquiry' },
];

const DEFAULT_SERVICES = [
  { category:'간판', items:'LED 채널간판,갈바간판,돌출간판,입체문자', icon:'signage' },
  { category:'현수막', items:'일반 현수막,대형 현수막,행사용 현수막', icon:'banner' },
  { category:'실사출력', items:'대형출력,포스터,시트지,인테리어 출력', icon:'print' },
  { category:'썬팅·시트', items:'유리창 시트,매장 시트,광고용 필름', icon:'film' },
  { category:'광고물 제작', items:'아크릴,포맥스,안내판,각종 사인물', icon:'craft' },
  { category:'옥외광고', items:'건물 광고,기업 광고,상가 광고', icon:'building' },
];

const CATEGORY_LIST = ['전체','간판','현수막','실사출력','썬팅','기업','음식점','카페','병원','학원','기타'];

let supabaseReady = false;
try { supabaseReady = typeof SUPABASE_URL === 'string' && SUPABASE_URL.startsWith('http'); } catch(e){ supabaseReady = false; }

async function safeQuery(promiseFn, fallback){
  if (!supabaseReady) return fallback;
  try{
    const { data, error } = await promiseFn();
    if (error) throw error;
    return (data && data.length) ? data : fallback;
  }catch(e){
    console.warn('[Supabase] 조회 실패, 기본값 사용:', e.message || e);
    return fallback;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initHero();
  initServices();
  initPortfolio();
  initTestimonials();
  initBlog();
  initInquiryForm();
  initSiteSettings();
  initReveal();
  initFooterYear();
});

/* ---------------- Header ---------------- */
function initHeader(){
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > window.innerHeight * 0.7) header.classList.add('is-light');
    else header.classList.remove('is-light');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
}

function initMobileNav(){
  const btn = document.getElementById('hamburgerBtn');
  const nav = document.getElementById('mobileNav');
  const closeBtn = document.getElementById('mobileNavClose');
  if (!btn || !nav) return;
  const open = () => nav.classList.add('is-open');
  const close = () => nav.classList.remove('is-open');
  btn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ---------------- Hero Slider ---------------- */
async function initHero(){
  const root = document.getElementById('hero');
  if (!root) return;

  const rows = await safeQuery(
    () => sb.from('hero_slides').select('*').eq('is_active', true).order('sort_order'),
    DEFAULT_HERO
  );

  const track = document.getElementById('heroTrack');
  const dots = document.getElementById('heroDots');
  const counter = document.getElementById('heroCounter');
  track.innerHTML = '';
  dots.innerHTML = '';

  rows.forEach((slide, i) => {
    const img = slide.image_url ? publicMediaUrlSafe(slide.image_url) : null;
    const el = document.createElement('div');
    el.className = 'hero-slide' + (i === 0 ? ' is-active' : '');
    el.innerHTML = `
      <div class="hero-slide-media">
        ${img
          ? `<img src="${img}" alt="${escapeHtml(slide.headline)}" loading="${i===0?'eager':'lazy'}" decoding="async">`
          : `<div class="hero-placeholder">${ICONS.camera}<span>시공사진 등록 필요 (관리자 페이지)</span></div>`}
      </div>
      <div class="hero-content container">
        <div class="hero-text">
          <h1>${escapeHtml(slide.headline)}</h1>
          ${slide.subtext ? `<p>${escapeHtml(slide.subtext)}</p>` : ''}
        </div>
        <div class="hero-actions">
          ${slide.button_text ? `<a class="btn btn-primary" href="${slide.button_link || '#inquiry'}">${escapeHtml(slide.button_text)}</a>` : ''}
          ${slide.button2_text ? `<a class="btn btn-outline" href="${slide.button2_link || '#portfolio'}">${escapeHtml(slide.button2_text)}</a>` : ''}
        </div>
      </div>`;
    track.appendChild(el);

    const dot = document.createElement('button');
    dot.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `${i+1}번째 슬라이드`);
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  });

  const slides = () => track.querySelectorAll('.hero-slide');
  const dotEls = () => dots.querySelectorAll('.hero-dot');
  let current = 0;
  let timer = null;
  const total = rows.length;

  function render(){
    slides().forEach((s,i) => s.classList.toggle('is-active', i === current));
    dotEls().forEach((d,i) => d.classList.toggle('is-active', i === current));
    if (counter) counter.textContent = `${String(current+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
  }
  function goTo(i){ current = (i + total) % total; render(); resetTimer(); }
  function next(){ goTo(current + 1); }
  function prev(){ goTo(current - 1); }
  function resetTimer(){ clearInterval(timer); timer = setInterval(next, 5000); }

  document.getElementById('heroNext')?.addEventListener('click', next);
  document.getElementById('heroPrev')?.addEventListener('click', prev);

  // swipe
  let startX = null;
  root.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive:true });
  root.addEventListener('touchend', e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    startX = null;
  }, { passive:true });

  render();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) resetTimer();
}

function publicMediaUrlSafe(path){
  try { return publicMediaUrl(path); } catch(e){ return null; }
}

/* ---------------- Services ---------------- */
async function initServices(){
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;
  const rows = await safeQuery(
    () => sb.from('services').select('*').eq('is_active', true).order('sort_order'),
    DEFAULT_SERVICES
  );
  grid.innerHTML = rows.map(s => `
    <div class="service-card reveal">
      <div class="service-icon">${ICONS[s.icon] || ICONS.craft}</div>
      <h3>${escapeHtml(s.category)}</h3>
      <p>${escapeHtml((s.items || '').split(',').join(' · '))}</p>
    </div>`).join('');
  initReveal();
}

/* ---------------- Portfolio ---------------- */
let PORTFOLIO_ROWS = [];
async function initPortfolio(){
  const grid = document.getElementById('portfolioGrid');
  const filters = document.getElementById('portfolioFilters');
  if (!grid) return;

  PORTFOLIO_ROWS = await safeQuery(
    () => sb.from('portfolio_projects').select('*').order('sort_order').order('created_at', { ascending:false }),
    []
  );

  filters.innerHTML = CATEGORY_LIST.map((c,i) =>
    `<button class="filter-btn${i===0?' is-active':''}" data-cat="${c}">${c}</button>`
  ).join('');
  filters.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderPortfolio(btn.dataset.cat);
    });
  });

  renderPortfolio('전체');
}

function renderPortfolio(cat){
  const grid = document.getElementById('portfolioGrid');
  const list = cat === '전체' ? PORTFOLIO_ROWS : PORTFOLIO_ROWS.filter(p => p.category === cat);

  if (!list.length){
    grid.style.columnCount = '1';
    grid.innerHTML = `<div class="portfolio-empty">등록된 시공사례가 없습니다.<br>관리자 페이지에서 첫 시공사례를 등록해보세요.</div>`;
    return;
  }
  grid.style.columnCount = '';
  grid.innerHTML = list.map(p => {
    const img = p.after_image_url ? publicMediaUrlSafe(p.after_image_url) : (p.before_image_url ? publicMediaUrlSafe(p.before_image_url) : null);
    return `
    <a class="pf-card reveal" href="portfolio.html?id=${p.id}">
      <div class="pf-card-media">
        ${img ? `<img src="${img}" alt="${escapeHtml(p.title)}" loading="lazy" decoding="async">`
              : `<div class="pf-placeholder">${ICONS.camera}<span>시공사진 등록 필요</span></div>`}
      </div>
      <div class="pf-card-overlay">
        <span class="pf-card-tag">${escapeHtml(p.category)}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.region || '')} ${p.service_type ? '· ' + escapeHtml(p.service_type) : ''}</p>
      </div>
    </a>`;
  }).join('');
  initReveal();
}

/* ---------------- Testimonials ---------------- */
async function initTestimonials(){
  const wrap = document.getElementById('testimonialSection');
  const track = document.getElementById('testimonialTrack');
  if (!wrap || !track) return;
  const rows = await safeQuery(
    () => sb.from('testimonials').select('*').eq('is_active', true).order('sort_order'),
    []
  );
  if (!rows.length){
    track.innerHTML = `<div class="empty-state" style="grid-column:1/-1">아직 등록된 고객후기가 없습니다.<br>실제 후기가 접수되면 이곳에 시공사진과 함께 소개해드립니다.</div>`;
    return;
  }
  track.innerHTML = rows.map(t => `
    <div class="testimonial-card reveal">
      ${t.image_url ? `<div class="testimonial-media"><img src="${publicMediaUrlSafe(t.image_url)}" alt="고객 시공사진" loading="lazy"></div>` : ''}
      <div class="testimonial-body">
        <p>${escapeHtml(t.content)}</p>
        ${t.customer_name ? `<div class="testimonial-name">${escapeHtml(t.customer_name)}</div>` : ''}
      </div>
    </div>`).join('');
  initReveal();
}

/* ---------------- Blog ---------------- */
async function initBlog(){
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  const rows = await safeQuery(
    () => sb.from('blog_posts').select('*').eq('is_published', true).order('published_at', { ascending:false }).limit(6),
    []
  );
  if (!rows.length){
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">준비 중인 콘텐츠입니다.</div>`;
    return;
  }
  grid.innerHTML = rows.map(b => `
    <a class="blog-card reveal" href="blog.html?slug=${encodeURIComponent(b.slug)}">
      <div class="blog-thumb">
        ${b.thumbnail_url ? `<img src="${publicMediaUrlSafe(b.thumbnail_url)}" alt="${escapeHtml(b.title)}" loading="lazy">` : ''}
      </div>
      <div class="blog-body">
        <span class="blog-cat">${escapeHtml(b.category || '광고정보')}</span>
        <h3>${escapeHtml(b.title)}</h3>
        <p>${escapeHtml(b.meta_description || '')}</p>
      </div>
    </a>`).join('');
  initReveal();
}

/* ---------------- Inquiry form ---------------- */
function initInquiryForm(){
  const form = document.getElementById('inquiryForm');
  if (!form) return;
  const fileInput = document.getElementById('inquiryPhoto');
  const preview = document.getElementById('filePreview');
  const msg = document.getElementById('formMsg');

  fileInput?.addEventListener('change', () => {
    const f = fileInput.files[0];
    preview.textContent = f ? `선택된 파일: ${f.name}` : '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-msg';
    msg.textContent = '';

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const region = form.region.value.trim();
    const content = form.content.value.trim();
    const adTypes = Array.from(form.querySelectorAll('input[name="adType"]:checked')).map(i => i.value);
    const agreed = form.privacy.checked;

    if (!name || !phone || !agreed){
      msg.classList.add('is-err');
      msg.textContent = '이름, 연락처 입력과 개인정보 동의는 필수입니다.';
      return;
    }

    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중...';

    let photo_url = null;
    try{
      const file = fileInput.files[0];
      if (file && supabaseReady){
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `inquiries/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await sb.storage.from(MEDIA_BUCKET).upload(path, file, { upsert:false });
        if (!upErr) photo_url = path;
      }

      if (supabaseReady){
        const { error } = await sb.from('inquiries').insert({
          name, phone, region, content,
          ad_type: adTypes.join(','),
          photo_url,
          privacy_agreed: agreed,
        });
        if (error) throw error;
      }

      msg.classList.add('is-ok');
      msg.textContent = '문의가 접수되었습니다. 빠른 시간 내에 연락드리겠습니다.';
      form.reset();
      preview.textContent = '';
    }catch(err){
      console.error(err);
      msg.classList.add('is-err');
      msg.textContent = '전송 중 오류가 발생했습니다. 전화로 문의해주세요.';
    }finally{
      submitBtn.disabled = false;
      submitBtn.textContent = '견적 문의하기';
    }
  });
}

/* ---------------- Site settings (연락처 등) ---------------- */
async function initSiteSettings(){
  const rows = await safeQuery(
    () => sb.from('site_settings').select('*'),
    []
  );
  const map = {};
  rows.forEach(r => map[r.key] = r.value);

  const phone = map.phone || '';
  const address = map.address || '';
  const hours = map.business_hours || '';
  const areas = map.service_areas || '순천,광양,여수,전남';

  document.querySelectorAll('[data-phone-link]').forEach(el => {
    el.href = phone ? `tel:${phone.replace(/[^0-9]/g,'')}` : '#inquiry';
  });
  document.querySelectorAll('[data-phone-text]').forEach(el => {
    el.textContent = phone || '전화번호 입력 필요';
  });
  document.querySelectorAll('[data-address-text]').forEach(el => {
    el.textContent = address || '주소 입력 필요';
  });
  document.querySelectorAll('[data-hours-text]').forEach(el => {
    el.textContent = hours || '영업시간 입력 필요';
  });
  document.querySelectorAll('[data-areas-text]').forEach(el => {
    el.textContent = areas.split(',').join(' · ');
  });

  const mapBox = document.getElementById('locationMap');
  if (mapBox){
    if (map.map_lat && map.map_lng){
      mapBox.innerHTML = `<iframe title="오시는 길" width="100%" height="100%" style="border:0;min-height:340px" loading="lazy"
        src="https://maps.google.com/maps?q=${map.map_lat},${map.map_lng}&z=16&output=embed"></iframe>`;
    } else {
      mapBox.textContent = '지도 정보를 등록해주세요 (관리자 페이지)';
    }
  }
}

/* ---------------- Reveal on scroll ---------------- */
function initReveal(){
  const els = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold:0.12 });
  els.forEach(el => io.observe(el));
}

function initFooterYear(){
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

function escapeHtml(str){
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
