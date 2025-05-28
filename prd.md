# 📄 Product Requirements Document (PRD)  
## 📨 뉴스레터 웹서비스 MVP – 주식 및 경제 뉴스 기반

---

## 1. 프로젝트 개요 (Project Overview)

**목표**  
주식 및 경제 뉴스에 관심 있는 사람들을 대상으로 이메일 뉴스레터를 발송할 수 있는 웹서비스를 개발합니다. 사용자는 구글 로그인으로 가입한 뒤, 직접 콘텐츠를 작성하고 구독자를 관리하며, 원하는 시간에 뉴스레터를 발송할 수 있습니다.

**대상 사용자**
- 경제 뉴스 콘텐츠를 제작하거나 큐레이션하려는 개인 또는 소규모 팀
- 경제 정보를 이메일로 정기 수신하고 싶은 일반 사용자

**핵심 가치**
- 콘텐츠 작성과 이메일 발송을 누구나 쉽게  
- 깔끔하고 직관적인 Notion 스타일 UI  
- 예약 발송 기능 포함  
- SEO를 고려한 공개 뉴스레터 링크 생성

---

## 2. 핵심 기능 (Core Functionalities)

| 기능             | 설명 |
|------------------|------|
| **구글 로그인**     | Supabase Auth + Google OAuth 사용 |
| **뉴스레터 작성**   | 제목, 본문, 강조 텍스트 포함한 텍스트 에디터 (TipTap 또는 React Quill) |
| **구독자 관리**     | 이메일 수동 추가 / CSV 업로드, 구독자 목록 조회 및 삭제 |
| **뉴스레터 발송**   | Resend API 사용, 단일/다수 이메일 전송 지원 |
| **예약 발송 기능**  | 선택한 날짜/시간에 자동 전송 (Supabase Edge Functions 또는 cron) |
| **뉴스레터 공개 링크** | SEO가 적용된 공개 웹페이지로 발행 (Next.js SSR 활용) |

---

## 3. 디자인 가이드 (Design)

| 항목             | 내용 |
|------------------|------|
| **스타일 참고**     | Notion 웹페이지 스타일 |
| **레이아웃**       | 좌측 사이드바 + 우측 콘텐츠 영역 (대시보드 구성) |
| **폰트**          | Inter 또는 system-ui |
| **UI 구성 요소**   | Tailwind CSS 기반: 라이트 톤, 깔끔한 테두리, 여백 중심 |
| **아이콘**        | Heroicons 또는 Phosphor Icons |
| **반응형 대응**     | 모바일에서는 카드형 레이아웃으로 변환, Tailwind로 구성 |

---

## 4. 기술 스택 및 구조 (Tech Stack & Structure)

### 기술 스택 요약
| 영역          | 사용 기술 |
|---------------|-----------|
| 프론트엔드     | **Next.js** (App Router), **Tailwind CSS** |
| 인증           | **Supabase Auth** (Google OAuth) |
| 백엔드 & DB   | **Supabase** (PostgreSQL, Edge Functions) |
| 이메일 발송    | **Resend API** (SMTP-free 이메일 전송) |

---

### 디렉토리 구조 (예시)

```
/app or /pages         # 라우팅
/components/           # 재사용 UI 컴포넌트
/lib/                  # Supabase, Resend 클라이언트 설정
/hooks/                # 커스텀 훅 (useAuth 등)
/utils/                # 유틸 함수
/styles/               # Tailwind 및 커스텀 스타일
/public/               # 공개 파일 (아이콘, 이미지 등)
.env.local             # 환경 변수 (.gitignore 필수)
```

---

## 5. 추가 요구사항 (Additional Requirements)

- **SEO 최적화**:
  - 공개 뉴스레터 페이지에 `Next.js`의 메타 태그 설정
  - OG 태그 및 제목 자동 적용

- **보안 정책**:
  - Supabase의 RLS(Row-Level Security) 정책 적용: 사용자별 데이터 격리
  - Resend API Key는 서버 측에서만 호출하도록 구성

- **기초 통계 기능** (옵션):
  - 발송 수, 구독자 수 표기 정도 (오픈률은 MVP에서는 제외 가능)

---

## ✅ 다음 단계 추천

이 PRD를 기반으로 다음 항목들을 제작/검토해보세요:

1. **와이어프레임 제작** – Notion 스타일을 반영한 작성 화면 및 대시보드
2. **DB 테이블 설계 (Supabase 기준)** – 사용자, 뉴스레터, 구독자 테이블 정의
3. **Next.js 기본 템플릿 구성** – Tailwind, Supabase 연동 포함
4. **Resend API 연동 코드 예시** – 실제 발송 로직 구현
