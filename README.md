# Newsletter Service MVP

주식 및 경제 뉴스 뉴스레터 서비스 MVP입니다.

## 🚀 주요 기능

- ✅ **Google OAuth 로그인** (Supabase 인증)
- ✅ **Rich Text Editor** (TipTap 기반 뉴스레터 작성)
- ✅ **구독자 관리** (CSV 업로드 지원)
- ✅ **이메일 발송** (Resend API 통합)
- ✅ **예약 발송** (날짜/시간 설정)
- ✅ **공개 페이지** (SEO 최적화)

## 🛠 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Email**: Resend API
- **Editor**: TipTap (Rich Text Editor)
- **UI**: Heroicons, React DatePicker

## 🚀 빠른 시작

### 1. 환경 설정

1. 저장소 클론:
```bash
git clone https://github.com/suri-j/newsletter-service-mvp.git
cd newsletter-service-mvp
```

2. 의존성 설치:
```bash
npm install
```

3. 환경 변수 설정 (`.env.local` 파일 생성):
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend 설정 (이메일 발송용)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=newsletter@yourdomain.com
RESEND_FROM_NAME=Your Newsletter Name
```

4. 개발 서버 실행:
```bash
npm run dev
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 다음 스키마 실행:

```sql
-- 사용자 테이블은 Supabase Auth가 자동 생성

-- 뉴스레터 테이블
CREATE TABLE newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 구독자 테이블
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, email)
);

-- 뉴스레터 발송 기록 테이블
CREATE TABLE newsletter_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'scheduled', 'failed')),
  error_message TEXT
);

-- RLS 정책 설정
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- 뉴스레터 정책
CREATE POLICY "Users can manage their own newsletters" ON newsletters
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public newsletters are viewable by everyone" ON newsletters
  FOR SELECT USING (is_public = true);

-- 구독자 정책
CREATE POLICY "Users can manage their own subscribers" ON subscribers
  FOR ALL USING (auth.uid() = user_id);

-- 발송 기록 정책
CREATE POLICY "Users can manage their own newsletter sends" ON newsletter_sends
  FOR ALL USING (auth.uid() = user_id);
```

3. Authentication > Providers에서 Google OAuth 설정

### 3. Resend 설정

1. [Resend](https://resend.com)에서 계정 생성
2. API Key 발급
3. 도메인 인증 (선택사항, 더 나은 전달률을 위해)

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # 대시보드
│   ├── newsletters/       # 뉴스레터 관리
│   ├── subscribers/       # 구독자 관리
│   ├── login/            # 로그인
│   └── api/              # API 라우트
├── components/            # React 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── newsletters/      # 뉴스레터 관련 컴포넌트
│   └── subscribers/      # 구독자 관련 컴포넌트
├── hooks/                # Custom React Hooks
├── lib/                  # 유틸리티 및 설정
└── types/               # TypeScript 타입 정의
```

## 🔗 주요 페이지

- `/` - 홈페이지
- `/login` - 로그인
- `/dashboard` - 대시보드
- `/newsletters` - 뉴스레터 관리
- `/newsletters/create` - 뉴스레터 작성
- `/subscribers` - 구독자 관리
- `/public/[id]` - 공개 뉴스레터 페이지

## 🚀 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. 환경 변수 설정
4. 배포 완료

### 환경 변수 설정 (Vercel)

Vercel 대시보드 > Settings > Environment Variables에서 다음 변수들을 설정:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
RESEND_FROM_NAME
```

## 🔧 개발 가이드

### 새로운 기능 추가

1. 데이터베이스 스키마 변경이 필요한 경우 Supabase에서 마이그레이션 실행
2. TypeScript 타입 정의 업데이트 (`src/lib/database.types.ts`)
3. API 라우트 추가 (`src/app/api/`)
4. 컴포넌트 및 페이지 구현

### 데이터베이스 유틸리티

`src/lib/database.utils.ts`에서 데이터베이스 작업을 위한 헬퍼 함수들을 제공합니다:

- `newsletterOperations`: 뉴스레터 CRUD
- `subscriberOperations`: 구독자 관리
- `sendOperations`: 발송 기록 관리

## 🐛 문제 해결

### 일반적인 문제들

1. **Supabase 연결 오류**: 환경 변수가 올바르게 설정되었는지 확인
2. **Google OAuth 오류**: Supabase에서 Google 프로바이더가 활성화되었는지 확인
3. **이메일 발송 실패**: Resend API 키와 발신자 이메일 확인
4. **빌드 오류**: TypeScript 타입 오류 확인

### 로그 확인

- 브라우저 개발자 도구 콘솔
- Vercel 함수 로그 (배포된 경우)
- Supabase 대시보드 로그

## 📄 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**💡 팁**: 환경 설정이 복잡하다면 Supabase와 Resend 문서를 참고하세요! 