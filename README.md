# AI 아이디어 생성기 (한국어)

Next.js 기반의 한국어 AI 아이디어 생성기입니다. OpenRouter API와 DeepSeek Chat v3 모델을 활용하여 카테고리별로 창의적인 아이디어를 생성하고, 좋아요 및 저장 기능을 제공합니다.

## 주요 기능

- **5개 카테고리별 AI 아이디어 생성**
  - 프로젝트, 비즈니스 자동화, 스타트업, 블로그, 유튜브
- **실시간 마크다운 렌더링**
- **좋아요(하트) 기능 및 로컬 저장**
  - 최대 10개 아이디어 저장
  - 저장된 아이디어 재조회 및 하이라이트
- **반응형 2단 레이아웃**
- **로딩 상태 및 오류 처리**
- **AI 고유성 강조 문구**

## 기술 스택

- **프론트엔드**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI 컴포넌트**: Radix UI, Lucide React
- **마크다운**: marked
- **AI API**: OpenRouter (DeepSeek Chat v3)
- **스타일링**: @tailwindcss/typography

## 설치 및 실행

1. 저장소 클론
   ```bash
   git clone https://github.com/your-username/ai-idea-generator-ko.git
   cd ai-idea-generator-ko
   ```
2. 패키지 설치
   ```bash
   pnpm install
   ```
3. 환경 변수 설정
   - `.env.local` 파일 생성 후 아래 항목 추가
     ```env
     OPENROUTER_API_KEY=your_openrouter_api_key
     OPENROUTER_MODEL=deepseek-chat
     ```
4. 개발 서버 실행
   ```bash
   pnpm dev
   ```
5. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 폴더 구조

```
ai-idea-generator-ko/
  ├─ app/
  │   ├─ api/generate-idea/route.ts   # AI 아이디어 생성 API
  │   ├─ globals.css
  │   ├─ layout.tsx
  │   └─ page.tsx
  ├─ components/                      # UI 컴포넌트
  ├─ hooks/                           # 커스텀 훅
  ├─ idea-generator.tsx               # 메인 아이디어 생성기 컴포넌트
  ├─ lib/                             # 유틸리티 함수
  ├─ public/                          # 정적 파일
  ├─ styles/                          # 글로벌 스타일
  ├─ tailwind.config.ts
  └─ ...
```

## 특징 및 참고 사항

- 한글 인코딩 문제는 영어 프롬프트 + 한국어 응답 방식으로 해결
- 각 아이디어는 AI가 고유하게 생성하며, 완전히 같은 아이디어는 존재하지 않습니다
- 로컬스토리지에 좋아요 아이디어 최대 10개 저장
- 마크다운 형식의 결과를 실시간 렌더링

## 라이선스

MIT 