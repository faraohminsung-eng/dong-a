// ============================================================
// Supabase 프로젝트 연결 정보
// 1) Supabase에서 새 프로젝트를 만들고 SUPABASE_SCHEMA.sql을 실행하세요.
// 2) 아래 두 값을 자신의 프로젝트 값으로 바꿔주세요.
//    Supabase 대시보드 > Project Settings > API 에서 확인 가능
// ============================================================
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// 아직 설정 전(플레이스홀더 값)이면 클라이언트를 만들지 않고 넘어갑니다.
// 각 페이지의 스크립트는 SUPABASE_URL이 http(s)로 시작하는지 확인한 뒤에만 sb를 사용합니다.
let sb = null;
if (/^https?:\/\//.test(SUPABASE_URL)) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn('[Supabase] 아직 연결 설정 전입니다. js/supabase-client.js 를 확인해주세요. 기본값으로 미리보기됩니다.');
}

// Storage public 버킷 이름
const MEDIA_BUCKET = 'dongah-ad-media';

function publicMediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path; // 이미 완전한 URL
  const { data } = sb.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data ? data.publicUrl : null;
}
