-- ============================================================
-- 동아광고 홈페이지 - Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 전체 실행하세요.
-- ============================================================

-- 1. 사이트 설정 (연락처, 주소 등 - key/value)
create table if not exists site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

insert into site_settings (key, value) values
  ('company_name', '동아광고'),
  ('phone', ''),                    -- 예: 062-000-0000
  ('kakao_channel', ''),            -- 카카오톡 채널 링크
  ('address', ''),                  -- 예: 전남 순천시 ...
  ('business_hours', ''),           -- 예: 평일 09:00 - 18:00
  ('map_lat', ''),
  ('map_lng', ''),
  ('service_areas', '순천,광양,여수,전남'),
  ('sns_instagram', ''),
  ('sns_blog', '')
on conflict (key) do nothing;

-- 2. HERO 슬라이드
create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text,               -- 없으면 프론트에서 플레이스홀더 표시
  image_url_mobile text,
  headline text not null,
  subtext text,
  button_text text,
  button_link text,
  button2_text text,
  button2_link text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

insert into hero_slides (headline, subtext, button_text, button_link, button2_text, button2_link, sort_order) values
  ('순천의 광고를 디자인합니다.', '간판 · 현수막 · 실사출력 · 광고물 제작 · 시공', '무료 견적문의', '#inquiry', '시공사례 보기', '#portfolio', 1),
  ('매장의 첫인상을 만듭니다.', '기획부터 디자인, 제작과 시공까지', '간판 제작 문의', '#inquiry', null, null, 2),
  ('필요한 광고를 정확하게 만듭니다.', '현수막 · 실사출력 · 시트 · 각종 광고물', '서비스 보기', '#services', null, null, 3),
  ('디자인부터 시공까지 한 번에', '동아광고가 책임지고 제작합니다.', '견적문의', '#inquiry', null, null, 4)
on conflict do nothing;

-- 3. 서비스 (동아광고가 만드는 것)
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category text not null,        -- 간판 / 현수막 / 실사출력 / 썬팅·시트 / 광고물 제작 / 옥외광고
  items text,                    -- 쉼표구분 세부항목
  description text,
  icon text,                     -- 아이콘 키워드(프론트 매핑)
  sort_order int not null default 0,
  is_active boolean not null default true
);

insert into services (category, items, icon, sort_order) values
  ('간판', 'LED 채널간판,갈바간판,돌출간판,입체문자', 'signage', 1),
  ('현수막', '일반 현수막,대형 현수막,행사용 현수막', 'banner', 2),
  ('실사출력', '대형출력,포스터,시트지,인테리어 출력', 'print', 3),
  ('썬팅·시트', '유리창 시트,매장 시트,광고용 필름', 'film', 4),
  ('광고물 제작', '아크릴,포맥스,안내판,각종 사인물', 'craft', 5),
  ('옥외광고', '건물 광고,기업 광고,상가 광고', 'building', 6)
on conflict do nothing;

-- 4. 시공사례
create table if not exists portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  region text,                  -- 예: 순천 ○○동
  category text not null,       -- 간판/현수막/실사출력/썬팅/기업/음식점/카페/병원/학원/기타
  service_type text,            -- 예: LED 채널간판
  description text,
  before_image_url text,
  after_image_url text,
  process_images jsonb default '[]'::jsonb,   -- [{url, caption}]
  gallery_images jsonb default '[]'::jsonb,
  is_featured boolean default false,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- 5. 문의(견적요청)
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  ad_type text,                 -- 간판/현수막/실사출력/썬팅·시트/광고물/기타 (쉼표구분 다중선택 가능)
  region text,
  content text,
  photo_url text,
  privacy_agreed boolean not null default false,
  status text not null default '접수',  -- 접수/상담중/견적완료/제작중/완료
  created_at timestamptz default now()
);

-- 6. 고객후기 (실제 후기만 등록, 없으면 빈 테이블 유지)
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text,
  content text not null,
  image_url text,
  related_project_id uuid references portfolio_projects(id) on delete set null,
  is_active boolean default true,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- 7. 광고정보 / 블로그 (SEO 콘텐츠)
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text,
  content text not null,          -- HTML 또는 마크다운
  thumbnail_url text,
  meta_description text,
  is_published boolean default true,
  published_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table site_settings enable row level security;
alter table hero_slides enable row level security;
alter table services enable row level security;
alter table portfolio_projects enable row level security;
alter table inquiries enable row level security;
alter table testimonials enable row level security;
alter table blog_posts enable row level security;

-- 공개 읽기: 활성/게시된 항목만
drop policy if exists "public read site_settings" on site_settings;
create policy "public read site_settings" on site_settings for select using (true);

drop policy if exists "public read hero_slides" on hero_slides;
create policy "public read hero_slides" on hero_slides for select using (is_active = true);

drop policy if exists "public read services" on services;
create policy "public read services" on services for select using (is_active = true);

drop policy if exists "public read portfolio" on portfolio_projects;
create policy "public read portfolio" on portfolio_projects for select using (true);

drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials for select using (is_active = true);

drop policy if exists "public read blog" on blog_posts;
create policy "public read blog" on blog_posts for select using (is_published = true);

-- 문의: 누구나 등록 가능(insert), 읽기/수정은 관리자만
drop policy if exists "public insert inquiries" on inquiries;
create policy "public insert inquiries" on inquiries for insert with check (true);

-- 관리자(로그인 사용자)는 전체 테이블 읽기/쓰기 가능
drop policy if exists "admin all site_settings" on site_settings;
create policy "admin all site_settings" on site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all hero_slides" on hero_slides;
create policy "admin all hero_slides" on hero_slides for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all services" on services;
create policy "admin all services" on services for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all portfolio" on portfolio_projects;
create policy "admin all portfolio" on portfolio_projects for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all inquiries" on inquiries;
create policy "admin all inquiries" on inquiries for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all testimonials" on testimonials;
create policy "admin all testimonials" on testimonials for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "admin all blog_posts" on blog_posts;
create policy "admin all blog_posts" on blog_posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
-- Storage 버킷 (Supabase 대시보드 > Storage 에서 수동 생성 권장)
--   버킷 이름: dongah-ad-media  (Public 버킷으로 생성)
--   업로드 경로 예: hero/, portfolio/, inquiries/, blog/
--   파일명은 반드시 영문/숫자(UUID)로 저장 - 한글 파일명 업로드 실패 이슈 있음
-- ============================================================
