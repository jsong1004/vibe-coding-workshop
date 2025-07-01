# AI 아이디어 생성기 (한국어)

Next.js와 AI를 활용한 한국어 아이디어 생성 웹 애플리케이션입니다.

## 주요 기능

- 🎯 5가지 카테고리별 AI 아이디어 생성 (스타트업, 비즈니스 자동화, 블로그, 유튜브, 프로젝트)
- 💾 좋아요 기능으로 아이디어 로컬 저장
- 🔐 Firebase Authentication (이메일/비밀번호 로그인)
- ☁️ Firestore를 통한 클라우드 아이디어 저장
- 📱 반응형 2단 레이아웃 UI
- 🎨 Tailwind CSS로 구현된 세련된 디자인

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **AI**: OpenRouter API (DeepSeek Chat v3 모델)
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Markdown**: marked, @tailwindcss/typography

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd ai-idea-generator-ko
```

### 2. 패키지 설치
```bash
npm install
# 또는
pnpm install
```

### 3. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# OpenRouter API 설정
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free

# Firebase 설정 (모두 NEXT_PUBLIC_ 접두사 필요)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase 설정

#### 4.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 후 생성

#### 4.2 Authentication 설정
1. Firebase 콘솔에서 "Authentication" 선택
2. "시작하기" 클릭
3. "Sign-in method" 탭에서 "이메일/비밀번호" 활성화

#### 4.3 Firestore 데이터베이스 설정
1. Firebase 콘솔에서 "Firestore Database" 선택
2. "데이터베이스 만들기" 클릭
3. **중요**: "테스트 모드에서 시작" 선택 (개발용)
4. 지역 선택 (asia-northeast3 권장)

#### 4.4 Firestore 보안 규칙 설정
개발 중에는 다음 규칙을 사용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ideas 컬렉션: 로그인한 사용자만 자신의 데이터 접근 가능
    match /ideas/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // 테스트용 컬렉션 (연결 확인용)
    match /test/{document} {
      allow read: if request.auth != null;
    }
  }
}
```

### 5. 개발 서버 실행
```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 `http://localhost:3000`에 접속하세요.

## 문제 해결

### Firestore 연결 오류 (400 에러)

1. **데이터베이스 생성 확인**
   - Firebase 콘솔에서 Firestore Database가 정상적으로 생성되었는지 확인

2. **보안 규칙 확인**
   - 위의 보안 규칙이 올바르게 설정되었는지 확인
   - 개발 중에는 더 관대한 규칙 사용 가능

3. **환경변수 확인**
   - `.env.local` 파일의 모든 Firebase 설정이 올바른지 확인
   - 모든 Firebase 환경변수에 `NEXT_PUBLIC_` 접두사가 있는지 확인

4. **네트워크 확인**
   - 브라우저 개발자 도구 콘솔에서 상세 에러 메시지 확인

## 폴더 구조

```
ai-idea-generator-ko/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── generate-idea/ # AI 아이디어 생성 API
│   ├── login/             # 로그인 페이지
│   ├── signup/            # 회원가입 페이지
│   ├── layout.tsx         # 전역 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # React 컴포넌트
│   ├── NavBar.tsx         # 네비게이션 바
│   └── ui/               # shadcn/ui 컴포넌트
├── hooks/                # 커스텀 훅
│   ├── useAuthUser.ts    # 인증 상태 관리
│   └── use-toast.ts      # 토스트 알림
├── lib/                  # 유틸리티 및 설정
│   ├── firebase.ts       # Firebase 초기화
│   └── utils.ts          # 공통 유틸리티
├── idea-generator.tsx    # 메인 아이디어 생성 컴포넌트
└── public/              # 정적 파일
```

## 특징

- ✨ **AI 기반 아이디어 생성**: OpenRouter와 DeepSeek 모델을 사용한 고품질 한국어 아이디어
- 💖 **로컬 저장**: 브라우저 localStorage를 통한 빠른 아이디어 저장
- ☁️ **클라우드 동기화**: 로그인 시 Firestore를 통한 영구 저장
- 🔄 **실시간 새로고침**: 아이디어 저장 후 자동 목록 업데이트
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 최적화
- 🎨 **현대적 UI**: 그라데이션과 애니메이션을 활용한 세련된 디자인

## 개발자 정보

- **개발 기간**: 2025년 1월
- **주요 기술**: Next.js 15, React 19, TypeScript, Tailwind CSS, Firebase
- **AI 모델**: DeepSeek Chat v3 (OpenRouter API)

---

각 아이디어는 AI가 고유하게 생성한 것입니다—완전히 같은 아이디어는 존재하지 않습니다! 🚀 