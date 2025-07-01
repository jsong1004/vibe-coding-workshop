# 🐳 Docker로 AI 아이디어 생성기 실행하기

이 가이드는 Docker를 사용하여 AI 아이디어 생성기를 컨테이너화하고 실행하는 방법을 설명합니다.

## 📋 사전 요구사항

- Docker (20.10.0 이상)
- Docker Compose (1.29.0 이상)

## 🚀 빠른 시작

### 1. Docker Compose를 사용한 실행 (권장)

```bash
# 이미지 빌드 및 컨테이너 실행
docker-compose up --build

# 백그라운드에서 실행
docker-compose up -d --build
```

### 2. Docker 명령어로 직접 실행

```bash
# 이미지 빌드
docker build -t ai-idea-generator .

# 컨테이너 실행
docker run -p 3000:3000 --name ai-idea-app ai-idea-generator
```

## 🔧 환경 변수 설정

프로덕션 환경에서 사용할 때는 환경 변수를 설정해야 합니다:

```bash
# .env 파일 생성 (예시)
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-api-url.com
FIREBASE_API_KEY=your-firebase-api-key
# ... 기타 필요한 환경 변수들
```

Docker Compose에서 환경 변수 사용:

```yaml
# docker-compose.yml에 추가
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
  - FIREBASE_API_KEY=${FIREBASE_API_KEY}
```

## 📊 컨테이너 관리

### 상태 확인
```bash
# 실행 중인 컨테이너 확인
docker ps

# 로그 확인
docker logs ai-idea-generator-app

# 헬스체크 확인
curl http://localhost:3000/api/health
```

### 중지 및 제거
```bash
# Docker Compose로 중지
docker-compose down

# 볼륨까지 제거
docker-compose down -v

# 직접 중지
docker stop ai-idea-app
docker rm ai-idea-app
```

## 🏭 프로덕션 배포

### 1. 이미지 태깅 및 푸시
```bash
# 이미지 태깅
docker tag ai-idea-generator your-registry/ai-idea-generator:latest

# 레지스트리에 푸시
docker push your-registry/ai-idea-generator:latest
```

### 2. 클라우드 배포 (예: AWS ECS, Google Cloud Run)
```bash
# Google Cloud Run 예시
gcloud run deploy ai-idea-generator \
  --image your-registry/ai-idea-generator:latest \
  --platform managed \
  --port 3000 \
  --allow-unauthenticated
```

## 🔍 트러블슈팅

### 자주 발생하는 문제들

1. **포트 충돌**
   ```bash
   # 다른 포트로 실행
   docker run -p 3001:3000 ai-idea-generator
   ```

2. **권한 문제**
   ```bash
   # Docker를 sudo 없이 실행하도록 설정
   sudo usermod -aG docker $USER
   ```

3. **빌드 캐시 문제**
   ```bash
   # 캐시 없이 빌드
   docker build --no-cache -t ai-idea-generator .
   ```

## 📈 성능 최적화

### 멀티스테이지 빌드 활용
현재 Dockerfile은 멀티스테이지 빌드를 사용하여:
- 빌드 단계에서 개발 의존성 설치
- 런타임 단계에서는 프로덕션에 필요한 파일만 포함
- 최종 이미지 크기 최소화

### 리소스 제한
```bash
# 메모리 및 CPU 제한
docker run -p 3000:3000 \
  --memory="512m" \
  --cpus="0.5" \
  ai-idea-generator
```

## 🔐 보안 고려사항

1. **Non-root 사용자 실행**: 컨테이너는 `nextjs` 사용자로 실행됩니다
2. **최소 권한 원칙**: 필요한 포트만 노출
3. **환경 변수 보안**: 민감한 정보는 Docker secrets 사용 권장

## 📝 도움말

문제가 발생하면:
1. [Docker 공식 문서](https://docs.docker.com/) 참조
2. `docker logs` 명령어로 로그 확인
3. GitHub Issues에 문제 보고

---

Happy Dockerizing! 🐳✨ 