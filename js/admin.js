// 동아광고 관리자 스크립트
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  $('#loginBtn').addEventListener('click', doLogin);
  $('#logoutBtn').addEventListener('click', doLogout);
  await checkSession();
});

function initTabs(){
  $$('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.admin-tab').forEach(t => t.classList.remove('is-active'));
      $$('.admin-panel').forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      document.getElementById(tab.dataset.panel).classList.add('is-active');
    });
  });
}

async function checkSession(){
  try{
    const { data: { session } } = await sb.auth.getSession();
    if (session){
      showAdmin();
    } else {
      showLogin();
    }
  }catch(e){
    showLogin('Supabase 설정을 먼저 완료해주세요 (js/supabase-client.js)');
  }
}

function showLogin(msg){
  $('#loginView').style.display = 'block';
  $('#adminView').style.display = 'none';
  if (msg) $('#loginMsg').textContent = msg;
}
function showAdmin(){
  $('#loginView').style.display = 'none';
  $('#adminView').style.display = 'block';
  loadAll();
}

async function doLogin(){
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  $('#loginMsg').textContent = '';
  try{
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    showAdmin();
  }catch(e){
    $('#loginMsg').textContent = '로그인 실패: ' + (e.message || e);
  }
}
async function doLogout(){
  await sb.auth.signOut();
  showLogin();
}

function loadAll(){
  loadHero();
  loadPortfolio();
  loadInquiries();
  loadTestimonials();
  loadBlog();
  loadSettings();
}

async function uploadFile(file, folder){
  if (!file) return null;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, file, { upsert:false });
  if (error) throw error;
  return path;
}

function thumb(path, label){
  const url = path ? publicMediaUrlSafe(path) : null;
  return url ? `<img src="${url}" alt="">` : label || '사진없음';
}
function publicMediaUrlSafe(p){ try{ return publicMediaUrl(p); }catch(e){ return null; } }
function esc(str){
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ---------------- HERO ---------------- */
async function loadHero(){
  const { data, error } = await sb.from('hero_slides').select('*').order('sort_order');
  const list = $('#heroList');
  if (error){ list.innerHTML = `<div class="hint">불러오기 실패: ${error.message}</div>`; return; }
  list.innerHTML = data.map(row => `
    <div class="row-item" data-id="${row.id}">
      <div class="thumb">${thumb(row.image_url)}</div>
      <div class="meta">
        <div class="t">${esc(row.headline)}</div>
        <div class="s">${esc(row.subtext || '')} · 순서 ${row.sort_order} · ${row.is_active ? '노출중' : '비활성'}</div>
      </div>
      <div class="row-actions">
        <button data-act="toggle">${row.is_active ? '숨기기' : '노출'}</button>
        <button data-act="order-up">▲</button>
        <button data-act="order-down">▼</button>
        <button data-act="delete" class="danger">삭제</button>
      </div>
    </div>`).join('') || '<div class="hint">등록된 슬라이드가 없습니다.</div>';

  list.querySelectorAll('.row-item').forEach(item => {
    const id = item.dataset.id;
    const row = data.find(r => r.id === id);
    item.querySelector('[data-act="toggle"]').addEventListener('click', async () => {
      await sb.from('hero_slides').update({ is_active: !row.is_active }).eq('id', id);
      loadHero();
    });
    item.querySelector('[data-act="delete"]').addEventListener('click', async () => {
      if (!confirm('삭제하시겠습니까?')) return;
      await sb.from('hero_slides').delete().eq('id', id);
      loadHero();
    });
    item.querySelector('[data-act="order-up"]').addEventListener('click', async () => {
      await sb.from('hero_slides').update({ sort_order: row.sort_order - 1 }).eq('id', id);
      loadHero();
    });
    item.querySelector('[data-act="order-down"]').addEventListener('click', async () => {
      await sb.from('hero_slides').update({ sort_order: row.sort_order + 1 }).eq('id', id);
      loadHero();
    });
  });
}

$('#heroAddBtn')?.addEventListener('click', async () => {
  const msg = $('#heroMsg'); msg.className = 'msg'; msg.textContent = '';
  const headline = $('#heroHeadline').value.trim();
  if (!headline){ msg.classList.add('err'); msg.textContent = '헤드라인을 입력해주세요.'; return; }
  try{
    let image_url = null;
    const file = $('#heroImageFile').files[0];
    if (file) image_url = await uploadFile(file, 'hero');
    const { data: maxRow } = await sb.from('hero_slides').select('sort_order').order('sort_order', { ascending:false }).limit(1);
    const sort_order = maxRow && maxRow[0] ? maxRow[0].sort_order + 1 : 1;
    const { error } = await sb.from('hero_slides').insert({
      headline,
      subtext: $('#heroSubtext').value.trim() || null,
      button_text: $('#heroBtn1Text').value.trim() || null,
      button_link: $('#heroBtn1Link').value.trim() || null,
      button2_text: $('#heroBtn2Text').value.trim() || null,
      button2_link: $('#heroBtn2Link').value.trim() || null,
      image_url, sort_order, is_active: true,
    });
    if (error) throw error;
    msg.classList.add('ok'); msg.textContent = '추가되었습니다.';
    ['heroHeadline','heroSubtext','heroBtn2Text','heroBtn2Link'].forEach(id => $('#'+id).value = '');
    $('#heroImageFile').value = '';
    loadHero();
  }catch(e){ msg.classList.add('err'); msg.textContent = '오류: ' + (e.message || e); }
});

/* ---------------- PORTFOLIO ---------------- */
async function loadPortfolio(){
  const { data, error } = await sb.from('portfolio_projects').select('*').order('sort_order').order('created_at', { ascending:false });
  const list = $('#pfList');
  if (error){ list.innerHTML = `<div class="hint">불러오기 실패: ${error.message}</div>`; return; }
  list.innerHTML = data.map(row => `
    <div class="row-item" data-id="${row.id}">
      <div class="thumb">${thumb(row.after_image_url || row.before_image_url)}</div>
      <div class="meta">
        <div class="t">${esc(row.title)}</div>
        <div class="s">${esc(row.category)} · ${esc(row.region || '')} · ${esc(row.service_type || '')}</div>
      </div>
      <div class="row-actions">
        <a class="btn btn-ghost btn-sm" href="portfolio.html?id=${row.id}" target="_blank" style="padding:7px 12px;font-size:12px">보기</a>
        <button data-act="delete" class="danger">삭제</button>
      </div>
    </div>`).join('') || '<div class="hint">등록된 시공사례가 없습니다.</div>';

  list.querySelectorAll('[data-act="delete"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('삭제하시겠습니까?')) return;
      const id = btn.closest('.row-item').dataset.id;
      await sb.from('portfolio_projects').delete().eq('id', id);
      loadPortfolio();
    });
  });
}

$('#pfAddBtn')?.addEventListener('click', async () => {
  const msg = $('#pfMsg'); msg.className = 'msg'; msg.textContent = '';
  const title = $('#pfTitle').value.trim();
  if (!title){ msg.classList.add('err'); msg.textContent = '프로젝트명을 입력해주세요.'; return; }
  try{
    const beforeFile = $('#pfBeforeFile').files[0];
    const afterFile = $('#pfAfterFile').files[0];
    const before_image_url = beforeFile ? await uploadFile(beforeFile, 'portfolio') : null;
    const after_image_url = afterFile ? await uploadFile(afterFile, 'portfolio') : null;
    const { error } = await sb.from('portfolio_projects').insert({
      title,
      category: $('#pfCategory').value,
      region: $('#pfRegion').value.trim() || null,
      service_type: $('#pfService').value.trim() || null,
      description: $('#pfDesc').value.trim() || null,
      before_image_url, after_image_url,
    });
    if (error) throw error;
    msg.classList.add('ok'); msg.textContent = '추가되었습니다.';
    ['pfTitle','pfRegion','pfService','pfDesc'].forEach(id => $('#'+id).value = '');
    $('#pfBeforeFile').value = ''; $('#pfAfterFile').value = '';
    loadPortfolio();
  }catch(e){ msg.classList.add('err'); msg.textContent = '오류: ' + (e.message || e); }
});

/* ---------------- INQUIRIES ---------------- */
const STATUS_LIST = ['접수','상담중','견적완료','제작중','완료'];
async function loadInquiries(){
  const { data, error } = await sb.from('inquiries').select('*').order('created_at', { ascending:false });
  const list = $('#inqList');
  if (error){ list.innerHTML = `<div class="hint">불러오기 실패: ${error.message}</div>`; return; }
  list.innerHTML = data.map(row => `
    <div class="row-item" data-id="${row.id}">
      <div class="thumb">${thumb(row.photo_url)}</div>
      <div class="meta">
        <div class="t">${esc(row.name)} · ${esc(row.phone)}</div>
        <div class="s">${new Date(row.created_at).toLocaleString('ko-KR')} · ${esc(row.ad_type || '')} · ${esc(row.region || '')}</div>
        <div class="s">${esc(row.content || '')}</div>
      </div>
      <div class="row-actions">
        <select class="status-select" data-act="status">
          ${STATUS_LIST.map(s => `<option ${s===row.status?'selected':''}>${s}</option>`).join('')}
        </select>
        <button data-act="delete" class="danger">삭제</button>
      </div>
    </div>`).join('') || '<div class="hint">접수된 문의가 없습니다.</div>';

  list.querySelectorAll('.row-item').forEach(item => {
    const id = item.dataset.id;
    item.querySelector('[data-act="status"]').addEventListener('change', async (e) => {
      await sb.from('inquiries').update({ status: e.target.value }).eq('id', id);
    });
    item.querySelector('[data-act="delete"]').addEventListener('click', async () => {
      if (!confirm('삭제하시겠습니까?')) return;
      await sb.from('inquiries').delete().eq('id', id);
      loadInquiries();
    });
  });
}

/* ---------------- TESTIMONIALS ---------------- */
async function loadTestimonials(){
  const { data, error } = await sb.from('testimonials').select('*').order('sort_order');
  const list = $('#tsList');
  if (error){ list.innerHTML = `<div class="hint">불러오기 실패: ${error.message}</div>`; return; }
  list.innerHTML = data.map(row => `
    <div class="row-item" data-id="${row.id}">
      <div class="thumb">${thumb(row.image_url)}</div>
      <div class="meta">
        <div class="t">${esc(row.customer_name || '익명')}</div>
        <div class="s">${esc(row.content)}</div>
      </div>
      <div class="row-actions">
        <button data-act="toggle">${row.is_active ? '숨기기' : '노출'}</button>
        <button data-act="delete" class="danger">삭제</button>
      </div>
    </div>`).join('') || '<div class="hint">등록된 후기가 없습니다.</div>';

  list.querySelectorAll('.row-item').forEach(item => {
    const id = item.dataset.id;
    const row = data.find(r => r.id === id);
    item.querySelector('[data-act="toggle"]').addEventListener('click', async () => {
      await sb.from('testimonials').update({ is_active: !row.is_active }).eq('id', id);
      loadTestimonials();
    });
    item.querySelector('[data-act="delete"]').addEventListener('click', async () => {
      if (!confirm('삭제하시겠습니까?')) return;
      await sb.from('testimonials').delete().eq('id', id);
      loadTestimonials();
    });
  });
}

$('#tsAddBtn')?.addEventListener('click', async () => {
  const msg = $('#tsMsg'); msg.className = 'msg'; msg.textContent = '';
  const content = $('#tsContent').value.trim();
  if (!content){ msg.classList.add('err'); msg.textContent = '후기 내용을 입력해주세요.'; return; }
  try{
    const file = $('#tsImageFile').files[0];
    const image_url = file ? await uploadFile(file, 'testimonials') : null;
    const { error } = await sb.from('testimonials').insert({
      customer_name: $('#tsName').value.trim() || null,
      content, image_url,
    });
    if (error) throw error;
    msg.classList.add('ok'); msg.textContent = '추가되었습니다.';
    $('#tsName').value = ''; $('#tsContent').value = ''; $('#tsImageFile').value = '';
    loadTestimonials();
  }catch(e){ msg.classList.add('err'); msg.textContent = '오류: ' + (e.message || e); }
});

/* ---------------- BLOG ---------------- */
async function loadBlog(){
  const { data, error } = await sb.from('blog_posts').select('*').order('published_at', { ascending:false });
  const list = $('#bgList');
  if (error){ list.innerHTML = `<div class="hint">불러오기 실패: ${error.message}</div>`; return; }
  list.innerHTML = data.map(row => `
    <div class="row-item" data-id="${row.id}">
      <div class="thumb">${thumb(row.thumbnail_url)}</div>
      <div class="meta">
        <div class="t">${esc(row.title)}</div>
        <div class="s">${esc(row.category || '')} · /${esc(row.slug)} · ${row.is_published ? '게시중' : '비공개'}</div>
      </div>
      <div class="row-actions">
        <a class="btn btn-ghost btn-sm" href="blog.html?slug=${encodeURIComponent(row.slug)}" target="_blank" style="padding:7px 12px;font-size:12px">보기</a>
        <button data-act="toggle">${row.is_published ? '비공개' : '게시'}</button>
        <button data-act="delete" class="danger">삭제</button>
      </div>
    </div>`).join('') || '<div class="hint">등록된 글이 없습니다.</div>';

  list.querySelectorAll('.row-item').forEach(item => {
    const id = item.dataset.id;
    const row = data.find(r => r.id === id);
    item.querySelector('[data-act="toggle"]').addEventListener('click', async () => {
      await sb.from('blog_posts').update({ is_published: !row.is_published }).eq('id', id);
      loadBlog();
    });
    item.querySelector('[data-act="delete"]').addEventListener('click', async () => {
      if (!confirm('삭제하시겠습니까?')) return;
      await sb.from('blog_posts').delete().eq('id', id);
      loadBlog();
    });
  });
}

$('#bgAddBtn')?.addEventListener('click', async () => {
  const msg = $('#bgMsg'); msg.className = 'msg'; msg.textContent = '';
  const title = $('#bgTitle').value.trim();
  const slug = $('#bgSlug').value.trim();
  const content = $('#bgContent').value.trim();
  if (!title || !slug || !content){ msg.classList.add('err'); msg.textContent = '제목/슬러그/본문은 필수입니다.'; return; }
  try{
    const file = $('#bgThumbFile').files[0];
    const thumbnail_url = file ? await uploadFile(file, 'blog') : null;
    const { error } = await sb.from('blog_posts').insert({
      title, slug, content,
      category: $('#bgCategory').value.trim() || null,
      meta_description: $('#bgMetaDesc').value.trim() || null,
      thumbnail_url,
    });
    if (error) throw error;
    msg.classList.add('ok'); msg.textContent = '추가되었습니다.';
    ['bgTitle','bgSlug','bgCategory','bgMetaDesc','bgContent'].forEach(id => $('#'+id).value = '');
    $('#bgThumbFile').value = '';
    loadBlog();
  }catch(e){ msg.classList.add('err'); msg.textContent = '오류: ' + (e.message || e); }
});

/* ---------------- SETTINGS ---------------- */
const SETTING_FIELDS = {
  phone:'setPhone', business_hours:'setHours', address:'setAddress', service_areas:'setAreas',
  kakao_channel:'setKakao', sns_instagram:'setInstagram', map_lat:'setLat', map_lng:'setLng',
};

async function loadSettings(){
  const { data, error } = await sb.from('site_settings').select('*');
  if (error) return;
  const map = {}; data.forEach(r => map[r.key] = r.value);
  Object.entries(SETTING_FIELDS).forEach(([key, elId]) => { $('#'+elId).value = map[key] || ''; });
}

$('#setSaveBtn')?.addEventListener('click', async () => {
  const msg = $('#setMsg'); msg.className = 'msg'; msg.textContent = '';
  try{
    const rows = Object.entries(SETTING_FIELDS).map(([key, elId]) => ({ key, value: $('#'+elId).value.trim() }));
    for (const row of rows){
      const { error } = await sb.from('site_settings').upsert(row);
      if (error) throw error;
    }
    msg.classList.add('ok'); msg.textContent = '저장되었습니다.';
  }catch(e){ msg.classList.add('err'); msg.textContent = '오류: ' + (e.message || e); }
});
