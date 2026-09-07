# 동아광고 홈페이지

순천 지역 간판·광고물 제작업체 "동아광고"의 영업형 홈페이지입니다.
정적 HTML/CSS/JS + Supabase(DB, 로그인, 이미지 저장소)로 구성되어 있으며 빌드 과정 없이 바로 배포할 수 있습니다.

## 폴더 구조

```
index.html            메인 페이지 (HERO, 서비스, 시공사례, 프로세스, 강점, 후기, 광고정보, 견적문의, 오시는 길)
portfolio.html         시공사례 상세 페이지 (?id=UUID)
blog.html               광고정보 글 상세 페이지 (?slug=...)
admin.html              관리자 페이지 (HERO/시공사례/문의/후기/블로그/설정 관리)
css/style.css           디자인 시스템
js/supabase-client.js   Supabase 프로젝트 연결 설정 (직접 입력 필요)
js/main.js              메인 페이지 로직 (히어로 슬라이더, 데이터 렌더링, 문의 폼)
js/portfolio-detail.js  시공사례 상세 로직
js/admin.js             관리자 CRUD 로직
SUPABASE_SCHEMA.sql     테이블/보안정책(RLS) 생성 스크립트 (필수 실행)
SUPABASE_SEED_BLOG.sql  일반 정보성 블로그 글 3개 (선택 실행)
robots.txt / sitemap.xml
```

## 처음 설정하는 방법 (반드시 필요)

1. **Supabase 프로젝트 생성**: https://supabase.com 에서 새 프로젝트를 만듭니다.
2. **스키마 실행**: Supabase 대시보드 > SQL Editor 에서 `SUPABASE_SCHEMA.sql` 전체를 실행합니다.
   (선택) `SUPABASE_SEED_BLOG.sql`도 실행하면 일반 정보성 글 3개가 미리 채워집니다.
3. **Storage 버킷 생성**: Storage 메뉴에서 `dongah-ad-media` 라는 이름의 **Public** 버킷을 만듭니다.
4. **연결 정보 입력**: `js/supabase-client.js`의 `SUPABASE_URL`, `SUPABASE_ANON_KEY`를
   Project Settings > API 에서 확인한 값으로 바꿉니다.
5. **관리자 계정 생성**: Authentication > Users 에서 관리자용 이메일/비밀번호 계정을 하나 만듭니다.
   (이 계정으로 `admin.html`에 로그인합니다.)
6. 로컬에서 확인하려면 `index.html`을 정적 서버로 띄우면 됩니다 (예: VSCode Live Server, `npx serve` 등).
   `file://`로 그냥 열어도 대부분 동작하지만, Storage 업로드 등은 실제 배포 도메인에서 테스트하는 것을 권장합니다.

## 지금 당장 채워야 할 실제 정보 (제가 임의로 만들지 않은 항목)

스펙 원칙("실제로 확인되지 않은 내용은 지어내지 않는다")에 따라 아래 항목은 전부
**빈 값 / 플레이스홀더**로 되어 있고, `admin.html` 접속 후 채우면 사이트에 바로 반영됩니다.

- [ ] 전화번호, 영업시간, 주소, 카카오톡 채널, 지도 좌표 → 관리자 `사이트 설정` 탭
- [ ] HERO 배경 사진 4장 (현재는 "시공사진 등록 필요" 플레이스홀더로 표시됨) → 관리자 `HERO 관리` 탭
- [ ] 시공사례 사진/내용 (현재 0건) → 관리자 `시공사례 관리` 탭
- [ ] 고객후기 (현재 0건, 실제 후기만 등록) → 관리자 `고객후기 관리` 탭
- [ ] 서비스 목록은 스펙에 주신 기본값(간판/현수막/실사출력/썬팅·시트/광고물 제작/옥외광고)으로
      미리 채워져 있지만, 실제 취급하지 않는 항목이 있다면 Supabase `services` 테이블에서 수정/삭제하세요.
      (관리자 UI에는 아직 서비스 편집 화면을 만들지 않았습니다 — 필요하시면 추가해드릴게요.)

## 도메인 연결 전 체크리스트

- `index.html`, `portfolio.html`, `blog.html`의 `<link rel="canonical">` / `og:url` / 구조화데이터 `url`
  값이 `https://example.com/`로 되어 있습니다. 실제 도메인으로 교체해주세요.
- `sitemap.xml`, `robots.txt`의 `example.com`도 실제 도메인으로 교체해주세요.
- OG 이미지(`og-image.jpg`)는 아직 없습니다. 실제 대표 이미지를 준비해 루트에 추가하고 경로를 확인해주세요.

## 향후 확장하면 좋은 부분

- 서비스 카테고리 관리자 편집 화면 추가
- 시공사례 다중 사진(갤러리)·제작과정 사진 업로드 UI (현재는 DB 컬럼만 준비됨: `gallery_images`, `process_images`)
- 이미지 WebP/AVIF 자동 변환 (현재는 업로드 원본 그대로 저장 - Supabase Storage의 image transformation 기능 또는 업로드 전 클라이언트 압축 적용 권장)
- 문의 접수 시 알림(카카오톡/문자/이메일) 연동
