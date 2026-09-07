// 시공사례 상세 페이지
document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('detailRoot');
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  if (!id){
    root.innerHTML = `<div class="container" style="padding:80px 0;text-align:center;color:var(--ink-faint)">잘못된 접근입니다.</div>`;
    return;
  }

  let project = null;
  let supabaseReady = false;
  try { supabaseReady = typeof SUPABASE_URL === 'string' && SUPABASE_URL.startsWith('http'); } catch(e){}

  if (supabaseReady){
    try{
      const { data, error } = await sb.from('portfolio_projects').select('*').eq('id', id).single();
      if (!error) project = data;
    }catch(e){ console.warn(e); }
  }

  if (!project){
    root.innerHTML = `<div class="container" style="padding:80px 0;text-align:center;color:var(--ink-faint)">시공사례를 찾을 수 없습니다.<br>Supabase 연결 및 데이터 등록 여부를 확인해주세요.</div>`;
    return;
  }

  document.getElementById('pageTitle').textContent = `${project.title} | 동아광고 시공사례`;
  document.getElementById('pageDesc').setAttribute('content', project.description || `${project.region || ''} ${project.service_type || ''} 시공사례`);

  const heroImg = project.after_image_url ? safeUrl(project.after_image_url) : (project.before_image_url ? safeUrl(project.before_image_url) : null);
  const before = project.before_image_url ? safeUrl(project.before_image_url) : null;
  const after = project.after_image_url ? safeUrl(project.after_image_url) : null;
  const process = Array.isArray(project.process_images) ? project.process_images : [];

  root.innerHTML = `
    <div class="detail-hero">
      ${heroImg ? `<img src="${heroImg}" alt="${esc(project.title)}">` : `<div class="hero-placeholder" style="position:absolute;inset:0">사진 등록 필요</div>`}
      <div class="detail-hero-overlay">
        <div class="container detail-hero-info">
          <span class="tag">${esc(project.category)}</span>
          <h1>${esc(project.title)}</h1>
        </div>
      </div>
    </div>

    <div class="container">
      <dl class="detail-meta">
        <div><dt>PROJECT</dt><dd>${esc(project.title)}</dd></div>
        <div><dt>LOCATION</dt><dd>${esc(project.region || '-')}</dd></div>
        <div><dt>SERVICE</dt><dd>${esc(project.service_type || project.category)}</dd></div>
      </dl>

      <div class="process-mini">
        ${['상담','현장실측','디자인','견적','제작','시공'].map((s,i,arr) =>
          `<span class="step">${s}</span>${i<arr.length-1 ? '<span class="arrow">&rarr;</span>' : ''}`
        ).join('')}
      </div>

      ${project.description ? `<div class="desc-block">${esc(project.description).replace(/\n/g,'<br>')}</div>` : ''}

      ${(before || after) ? `
      <div class="ba-grid">
        <div class="ba-item">
          ${before ? `<img src="${before}" alt="시공 전">` : `<div class="hero-placeholder" style="position:absolute;inset:0">BEFORE 사진 등록 필요</div>`}
          <span class="ba-label">BEFORE</span>
        </div>
        <div class="ba-item">
          ${after ? `<img src="${after}" alt="시공 후">` : `<div class="hero-placeholder" style="position:absolute;inset:0">AFTER 사진 등록 필요</div>`}
          <span class="ba-label">AFTER</span>
        </div>
      </div>` : ''}

      ${process.length ? `
      <div class="section-head" style="text-align:left;margin-bottom:24px"><h2 style="font-size:22px">제작 과정</h2></div>
      <div class="ba-grid" style="grid-template-columns:repeat(3,1fr)">
        ${process.map(p => `
          <div class="ba-item">
            <img src="${safeUrl(p.url)}" alt="${esc(p.caption || '제작 과정')}">
            ${p.caption ? `<span class="ba-label">${esc(p.caption)}</span>` : ''}
          </div>`).join('')}
      </div>` : ''}
    </div>
  `;
});

function safeUrl(path){
  try { return publicMediaUrl(path); } catch(e){ return path; }
}
function esc(str){
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
