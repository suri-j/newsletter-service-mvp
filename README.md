# 📨 Newsletter Service MVP

주식 및 경제 뉴스 뉴스레터 서비스 - 완전한 MVP 구현

## 🌟 주요 기능

- ✅ **Google OAuth 인증** (+ 이메일 로그인 지원)
- ✅ **Rich Text Editor** (TipTap 기반)
- ✅ **뉴스레터 작성 및 관리**
- ✅ **구독자 관리** (CSV 업로드 지원)
- ✅ **이메일 발송** (Resend 통합)
- ✅ **예약 발송**
- ✅ **SEO 최적화된 공개 페이지**
- ✅ **실시간 대시보드 및 통계**
- ✅ **데모 모드** (환경 설정 없이 체험 가능)

## 🚀 빠른 시작

### 1. 데모 모드로 체험
환경 설정 없이 바로 체험하려면:
1. 배포된 사이트 접속
2. "데모 모드로 시작하기" 클릭
3. 모든 기능 체험 가능

### 2. 실제 환경 설정

#### 필수 환경 변수
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 이메일 발송 (선택사항)
RESEND_API_KEY=your_resend_api_key
```

#### 선택적 환경 변수
```env
# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📦 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Google OAuth
- **Email**: Resend
- **Editor**: TipTap
- **Deployment**: Vercel

## 🛠️ 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 빌드
npm run build
```

## 📋 데이터베이스 스키마

프로젝트에는 완전한 SQL 스키마가 포함되어 있습니다:
- `users` - 사용자 정보
- `newsletters` - 뉴스레터 콘텐츠
- `subscribers` - 구독자 관리
- `newsletter_sends` - 발송 기록

## 🔧 설정 가이드

### Supabase 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL 에디터에서 제공된 스키마 실행
3. 환경 변수에 URL과 anon key 추가

### Google OAuth 설정 (선택사항)
자세한 설정은 `GOOGLE_OAUTH_SETUP.md` 참고

### Resend 설정 (선택사항)
1. [Resend](https://resend.com)에서 API 키 생성
2. 환경 변수에 추가

## 🎯 배포

### Vercel 배포
1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포

### 환경 변수 설정 (Vercel)
Vercel 대시보드에서 다음 환경 변수 추가:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY` (선택사항)

## 📱 사용법

### 관리자
1. 로그인 (Google OAuth 또는 이메일)
2. 뉴스레터 작성
3. 구독자 관리
4. 이메일 발송 및 예약

### 구독자
1. 공개 페이지에서 구독
2. 이메일로 뉴스레터 수신
3. 언제든지 구독 해지 가능

## 🔍 주요 페이지

- `/` - 홈페이지
- `/login` - 로그인 (데모 모드 지원)
- `/dashboard` - 관리자 대시보드
- `/create` - 뉴스레터 작성
- `/newsletters` - 뉴스레터 관리
- `/subscribers` - 구독자 관리
- `/send` - 이메일 발송
- `/scheduled` - 예약 발송 관리
- `/test-status` - 환경 상태 확인

## 🆘 문제 해결

### 무한 로딩
- `/test-status`에서 환경 상태 확인
- 데모 모드 사용 권장

### Google OAuth 오류
- `GOOGLE_OAUTH_SETUP.md` 참고
- 리다이렉트 URI 확인

### 이메일 발송 실패
- Resend API 키 확인
- 도메인 인증 상태 확인

## 📄 라이선스

MIT License

## 🤝 기여

이슈 및 PR 환영합니다!

---

**💡 팁**: 환경 설정이 복잡하다면 데모 모드로 먼저 체험해보세요! 