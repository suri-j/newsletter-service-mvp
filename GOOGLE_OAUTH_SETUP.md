# Google OAuth 설정 가이드

## 📋 단계별 설정 방법

### 1️⃣ Google Cloud Console 설정

1. **Google Cloud Console** 접속: https://console.cloud.google.com/
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** → **Credentials** 이동
4. **+ CREATE CREDENTIALS** → **OAuth client ID** 선택
5. **Application type**: `Web application` 선택
6. **Name**: `Newsletter Service` (또는 원하는 이름)

### 2️⃣ Authorized URLs 설정

**Authorized JavaScript origins:**
```
http://localhost:3001
http://localhost:3002
https://your-domain.com (프로덕션용)
```

**Authorized redirect URIs:**
```
https://your-supabase-project-id.supabase.co/auth/v1/callback
http://localhost:3001/auth/callback
http://localhost:3002/auth/callback
```

### 3️⃣ Supabase 대시보드 설정

1. **Supabase 대시보드**: https://app.supabase.com/
2. 프로젝트 선택
3. **Authentication** → **Providers** → **Google**
4. **Enable sign in with Google** 토글 ON
5. Google에서 받은 **Client ID**와 **Client Secret** 입력
6. **Save** 클릭

### 4️⃣ 환경 변수 업데이트

`.env.local` 파일에 추가 (선택사항):
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## ⚠️ 일반적인 문제 해결

### 문제: "Unsupported provider: provider is not enabled"
- Supabase에서 Google 프로바이더가 비활성화된 상태
- 해결: Supabase 대시보드에서 Google 프로바이더 활성화

### 문제: "Invalid redirect URI"
- Google Cloud Console의 Authorized redirect URIs에 Supabase 콜백 URL이 없음
- 해결: `https://your-project-id.supabase.co/auth/v1/callback` 추가

### 문제: "This app isn't verified"
- Google 앱 검증이 필요한 경우
- 해결: 테스트 사용자 추가 또는 앱 검증 신청

## 🧪 테스트 방법

1. 브라우저에서 `http://localhost:3001/login` 접속
2. "Google로 로그인" 버튼 클릭
3. Google 로그인 팝업이 나타나는지 확인
4. 로그인 후 대시보드로 리다이렉트되는지 확인

## 📞 도움이 필요하시면

위 설정을 완료한 후에도 문제가 계속되면:
1. Supabase 프로젝트 URL 확인
2. Google Cloud Console의 설정 재확인
3. 브라우저 캐시 및 쿠키 삭제 후 재시도 