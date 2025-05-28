# 📋 Newsletter Web Service MVP - Todo List

## 🚀 Phase 1: 프로젝트 초기 설정

### 1.1 개발 환경 구성
- [x] Next.js 14 프로젝트 생성 (App Router 사용)
- [x] TypeScript 설정 추가
- [x] Tailwind CSS 설치 및 설정
- [x] ESLint, Prettier 설정
- [x] 기본 디렉토리 구조 생성 (`/components`, `/lib`, `/hooks`, `/utils`, `/styles`)
- [x] `.env.local` 파일 생성 및 `.gitignore` 업데이트

### 1.2 UI 라이브러리 및 의존성 설치
- [x] Heroicons 또는 Phosphor Icons 설치
- [x] Inter 폰트 설정 (next/font 사용)
- [x] 기본 레이아웃 컴포넌트 생성 (사이드바 + 메인 콘텐츠)
- [x] Tailwind CSS 커스텀 설정 (Notion 스타일 색상 팔레트)

---

## 🔐 Phase 2: 인증 시스템 구축

### 2.1 Supabase 설정
- [x] Supabase 프로젝트 생성
- [x] Supabase JavaScript 클라이언트 설치
- [x] `/lib/supabase.ts` 클라이언트 설정 파일 생성
- [x] 환경 변수에 Supabase URL, ANON_KEY 추가

### 2.2 Google OAuth 설정
- [x] Google Cloud Console에서 OAuth 앱 생성
- [x] Supabase Auth Provider에 Google 설정 추가
- [x] 리다이렉트 URL 설정

### 2.3 인증 컴포넌트 개발
- [x] `useAuth` 커스텀 훅 생성
- [x] 로그인 페이지 (`/app/login/page.tsx`) 생성
- [x] 로그아웃 기능 구현
- [x] 로그인 상태에 따른 라우팅 보호 미들웨어 생성
- [x] 사용자 프로필 표시 컴포넌트 생성

---

## 💾 Phase 3: 데이터베이스 스키마 설계

### 3.1 테이블 생성 (Supabase SQL Editor)
- [x] `users` 테이블 생성 (id, email, name, created_at)
- [x] `newsletters` 테이블 생성 (id, user_id, title, content, created_at, published_at, is_published, scheduled_at)
- [x] `subscribers` 테이블 생성 (id, user_id, email, name, subscribed_at, is_active)
- [x] `newsletter_sends` 테이블 생성 (id, newsletter_id, subscriber_id, sent_at, status)

### 3.2 RLS (Row Level Security) 정책 설정
- [x] `newsletters` 테이블 RLS 정책: 사용자별 접근 제한
- [x] `subscribers` 테이블 RLS 정책: 사용자별 접근 제한
- [x] `newsletter_sends` 테이블 RLS 정책: 사용자별 접근 제한

### 3.3 데이터베이스 함수 및 트리거
- [x] 사용자 가입 시 `users` 테이블 자동 생성 트리거
- [x] 뉴스레터 발송 통계 집계 함수

### 3.4 TypeScript 타입 정의 및 유틸리티
- [x] 데이터베이스 타입 정의 파일 생성 (`database.types.ts`)
- [x] 데이터베이스 유틸리티 함수 생성 (`database.utils.ts`)
- [x] Supabase 클라이언트 타입 안전성 향상
- [x] 대시보드 실제 통계 데이터 연동

---

## ✍️ Phase 4: 뉴스레터 작성 기능

### 4.1 텍스트 에디터 설정
- [x] TipTap 또는 React Quill 라이브러리 설치
- [x] 기본 에디터 컴포넌트 생성
- [x] 툴바 기능 구현 (굵기, 기울임, 링크, 목록 등)
- [x] 에디터 스타일링 (Notion 스타일)

### 4.2 뉴스레터 작성 페이지
- [x] 뉴스레터 작성 페이지 (`/app/create/page.tsx`) 생성
- [x] 제목 입력 필드 생성
- [x] 본문 에디터 영역 생성
- [x] 임시 저장 기능 구현
- [x] 미리보기 기능 구현

### 4.3 뉴스레터 저장 기능
- [x] 뉴스레터 생성 API 엔드포인트 (database.utils.ts 활용)
- [x] 뉴스레터 수정 API 엔드포인트 (database.utils.ts 활용)
- [x] 뉴스레터 삭제 API 엔드포인트 (database.utils.ts 활용)
- [x] 클라이언트 사이드 저장 함수 구현

### 4.4 뉴스레터 관리 페이지
- [x] 뉴스레터 목록 페이지 (`/app/newsletters/page.tsx`) 생성
- [x] 뉴스레터 상태 표시 (임시저장, 발행됨, 예약됨)
- [x] 뉴스레터 편집/삭제 기능
- [x] 사이드바 네비게이션 업데이트

---

## 👥 Phase 5: 구독자 관리 기능

### 5.1 구독자 목록 페이지
- [x] 구독자 목록 페이지 (`/app/subscribers/page.tsx`) 생성
- [x] 구독자 테이블 컴포넌트 생성
- [x] 페이지네이션 구현
- [x] 검색 기능 구현

### 5.2 구독자 추가 기능
- [x] 수동 이메일 추가 모달 컴포넌트
- [x] 구독자 추가 API 엔드포인트 (`database.utils.ts` 활용)
- [x] 이메일 유효성 검증 함수
- [x] 중복 이메일 체크 기능

### 5.3 CSV 업로드 기능
- [x] 파일 업로드 컴포넌트 생성 (`/components/subscribers/CSVUpload.tsx`)
- [x] CSV 파싱 유틸리티 함수 생성 (papaparse 라이브러리 사용)
- [x] 대량 구독자 추가 API 엔드포인트 (`database.utils.ts` 활용)
- [x] 업로드 진행률 표시 컴포넌트

### 5.4 구독자 관리 기능
- [x] 구독자 삭제 기능
- [x] 구독자 상태 변경 (활성/비활성)
- [x] 구독자 정보 수정 기능

---

## 📧 Phase 6: 이메일 발송 시스템

### 6.1 Resend API 설정
- [x] Resend 계정 생성 및 API 키 발급
- [x] Resend SDK 설치
- [x] `/lib/resend.ts` 클라이언트 설정 파일 생성
- [x] 환경 변수에 Resend API 키 추가

### 6.2 이메일 템플릿 개발
- [x] HTML 이메일 템플릿 컴포넌트 생성
- [x] 뉴스레터 콘텐츠를 HTML로 변환하는 함수
- [x] 이메일 스타일링 (인라인 CSS)
- [x] 구독 취소 링크 추가

### 6.3 이메일 발송 기능
- [x] 단일 이메일 발송 API 엔드포인트 (`/api/send/single/route.ts`)
- [x] 다중 이메일 발송 API 엔드포인트 (`/api/send/batch/route.ts`)
- [x] 발송 상태 추적 기능
- [x] 발송 실패 처리 및 재시도 로직

### 6.4 발송 관리 UI
- [x] 뉴스레터 발송 페이지 생성
- [x] 발송 대상 선택 컴포넌트
- [x] 발송 확인 모달
- [x] 발송 진행률 표시

---

## ⏰ Phase 7: 예약 발송 기능

### 7.1 예약 발송 UI
- [x] 날짜/시간 선택 컴포넌트 생성 (`DateTimePicker.tsx`)
- [x] 예약 발송 설정 모달 (`ScheduleModal.tsx`)
- [x] 예약된 발송 목록 페이지 (`/app/scheduled/page.tsx`)

### 7.2 예약 발송 백엔드
- [x] 예약 발송 API 엔드포인트 (`/api/schedule/route.ts`)
- [x] 예약 발송 처리 로직 구현
- [x] 예약 취소/수정 기능
- [x] 예약 발송 상태 업데이트
- [x] 사이드바에 예약된 발송 메뉴 추가

---

## 🌐 Phase 8: 공개 뉴스레터 페이지

### 8.1 공개 페이지 개발
- [x] 공개 뉴스레터 페이지 (`/app/public/[id]/page.tsx`) 생성
- [x] SSR을 활용한 SEO 최적화
- [x] 공개 URL 생성 함수
- [x] 뉴스레터 공개/비공개 설정 기능 (`/api/newsletters/[id]/public/route.ts`)

### 8.2 SEO 최적화
- [x] 메타 태그 동적 생성 (`generateMetadata` 함수)
- [x] OG (Open Graph) 태그 설정
- [x] 트위터 카드 설정
- [ ] 구조화 데이터 (JSON-LD) 추가

### 8.3 공개 페이지 UI 기능
- [x] 뉴스레터 목록에 공개/비공개 토글 버튼 추가
- [x] 공개 URL 복사 기능
- [x] 공개 상태 배지 표시
- [x] 데이터베이스 스키마에 `is_public` 컬럼 추가

---

## 📊 Phase 9: 대시보드 및 통계

### 9.1 대시보드 페이지
- [x] 메인 대시보드 페이지 (`/app/dashboard/page.tsx`) 생성
- [x] 통계 카드 컴포넌트 (총 뉴스레터 수, 구독자 수, 발송 수)
- [x] 최근 뉴스레터 목록 컴포넌트
- [x] 최근 활동 타임라인

### 9.2 통계 기능
- [x] 뉴스레터별 발송 통계 API
- [x] 구독자 증감 통계
- [ ] 월별/주별 통계 차트 (Chart.js 또는 Recharts)

---

## 📱 Phase 10: 반응형 디자인 및 UI/UX 개선

### 10.1 모바일 대응
- [ ] 사이드바 모바일 네비게이션으로 변환
- [ ] 카드형 레이아웃 구현
- [ ] 터치 친화적 버튼 크기 조정
- [ ] 모바일 에디터 최적화

### 10.2 UI/UX 개선
- [ ] 로딩 스피너 및 스켈레톤 UI 추가
- [ ] 토스트 알림 시스템 구현
- [ ] 에러 페이지 생성 (404, 500)
- [ ] 폼 유효성 검사 강화

---

## 🔒 Phase 11: 보안 및 성능 최적화

### 11.1 보안 강화
- [ ] API 엔드포인트 인증 미들웨어 추가
- [ ] 입력값 검증 및 보안 취약점 체크
- [ ] CSRF 토큰 구현
- [ ] Rate Limiting 설정

### 11.2 성능 최적화
- [ ] 이미지 최적화 (next/image 활용)
- [ ] 코드 스플리팅 및 동적 임포트
- [ ] 데이터베이스 쿼리 최적화
- [ ] 캐싱 전략 구현

---

## 🧪 Phase 12: 테스트 및 배포

### 12.1 테스트 작성
- [ ] 주요 컴포넌트 단위 테스트 (Jest + Testing Library)
- [ ] API 엔드포인트 통합 테스트
- [ ] E2E 테스트 (Playwright 또는 Cypress)

### 12.2 배포 준비
- [ ] Vercel 배포 설정
- [ ] 환경 변수 프로덕션 설정
- [ ] 도메인 연결 및 SSL 설정
- [ ] 에러 모니터링 도구 연동 (Sentry)

---

## 📝 Phase 13: 문서화 및 마무리

### 13.1 문서 작성
- [x] README.md 파일 업데이트
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성
- [ ] 개발자 가이드 작성

### 13.2 최종 검토
- [ ] 기능 완성도 체크리스트 검토
- [ ] 크로스 브라우저 테스트
- [ ] 성능 벤치마크 측정
- [ ] 사용자 피드백 수집 및 반영

---

## 🎯 우선순위 가이드

**🔴 필수 (MVP 핵심)**
- Phase 1-6: 기본 기능 구현

**🟡 중요 (런칭 전 완성)**
- Phase 7-8: 예약 발송, 공개 페이지

**🟢 개선사항 (런칭 후 점진적 개발)**
- Phase 9-13: 통계, 최적화, 테스트

---

**총 예상 개발 기간: 4-6주** (1인 개발 기준) 