-- ============================================================
-- Storage 버킷 및 업로드 정책
-- (이미 CLI로 적용됨 - 참고/재실행용 파일)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('dongah-ad-media', 'dongah-ad-media', true)
on conflict (id) do nothing;

-- 공개 읽기 (버킷이 public이라 실제 이미지 URL 접근엔 필요 없지만 명시적으로 추가)
drop policy if exists "public read dongah media" on storage.objects;
create policy "public read dongah media" on storage.objects
  for select using (bucket_id = 'dongah-ad-media');

-- 누구나 견적문의 사진만 업로드 가능 (비로그인 방문자용)
drop policy if exists "public insert inquiry photos" on storage.objects;
create policy "public insert inquiry photos" on storage.objects
  for insert with check (
    bucket_id = 'dongah-ad-media'
    and (storage.foldername(name))[1] = 'inquiries'
  );

-- 로그인한 관리자는 전체 폴더에 업로드/수정/삭제 가능
drop policy if exists "admin insert dongah media" on storage.objects;
create policy "admin insert dongah media" on storage.objects
  for insert to authenticated with check (bucket_id = 'dongah-ad-media');

drop policy if exists "admin update dongah media" on storage.objects;
create policy "admin update dongah media" on storage.objects
  for update to authenticated using (bucket_id = 'dongah-ad-media');

drop policy if exists "admin delete dongah media" on storage.objects;
create policy "admin delete dongah media" on storage.objects
  for delete to authenticated using (bucket_id = 'dongah-ad-media');
