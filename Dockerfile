# AI 아이디어 생성기 - Next.js Docker 설정
# 멀티스테이지 빌드를 사용하여 최적화

# 1단계: 의존성 설치 및 빌드
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package.json ./

# 의존성 설치 (peer dependency 문제 해결)
RUN npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 2단계: 프로덕션 이미지
FROM node:18-alpine AS runner

# 보안을 위한 non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# 프로덕션 의존성만 설치
COPY package.json ./
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# 빌드 결과물 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/env.example ./.env.local

# 소유권 변경
RUN chown -R nextjs:nodejs /app
USER nextjs

# 포트 설정
EXPOSE 3000

# 환경 변수
ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# 앱 시작
CMD ["npm", "start"] 