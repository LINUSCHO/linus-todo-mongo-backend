# Cloudtype 배포 가이드

## 🚀 Cloudtype 배포 설정 완료

### ✅ 수정된 설정들

#### 1. **포트 및 호스트 설정**
```javascript
// index.js
const PORT = process.env.PORT || process.env.CLOUDTYPE_PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 서버가 ${HOST}:${PORT}에서 실행 중입니다.`);
});
```

#### 2. **CORS 설정 업데이트**
```javascript
// Cloudtype 도메인 추가
const allowedOrigins = [
  'https://linus-todo-mongo-backend.cloudtype.app',
  // ... 기타 도메인들
];
```

#### 3. **환경변수 설정**
```env
# config.env
NODE_ENV=production
ALLOWED_ORIGINS=https://linus-todo-mongo-backend.cloudtype.app,...
```

#### 4. **배포 파일 추가**
- `Procfile`: Cloudtype 배포용
- `cloudtype.json`: Cloudtype 설정 파일

### 🔧 Cloudtype에서 설정해야 할 환경변수

Cloudtype 대시보드에서 다음 환경변수를 설정하세요:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://gyehyung3346:!C1g2h30416@cluster0.jfb76nj.mongodb.net/todo
ALLOWED_ORIGINS=https://linus-todo-mongo-backend.cloudtype.app,http://localhost:3000,http://localhost:5001,http://localhost:5173,http://localhost:8080
CORS_CREDENTIALS=true
CLOUDTYPE_DEPLOYMENT=true
```

### 📋 배포 체크리스트

- [x] 포트를 동적 포트로 설정 (`process.env.PORT`)
- [x] 호스트를 `0.0.0.0`으로 설정 (외부 접근 허용)
- [x] CORS 설정에 Cloudtype 도메인 추가
- [x] `Procfile` 생성
- [x] `cloudtype.json` 설정 파일 생성
- [x] 환경변수를 production으로 변경
- [x] GitHub에 푸시 완료

### 🌐 접속 URL

배포 후 다음 URL로 접속하세요:
- **메인 페이지**: `https://linus-todo-mongo-backend.cloudtype.app/`
- **API 엔드포인트**: `https://linus-todo-mongo-backend.cloudtype.app/api/todos`

### 🔍 문제 해결

#### 접속이 안 될 때:
1. **Cloudtype 로그 확인**: 대시보드에서 빌드/런타임 로그 확인
2. **환경변수 확인**: MongoDB URI와 CORS 설정이 올바른지 확인
3. **포트 확인**: Cloudtype이 자동으로 할당한 포트 사용 확인
4. **CORS 오류**: 브라우저 개발자 도구에서 CORS 에러 메시지 확인

#### 로그 확인 방법:
```bash
# Cloudtype 대시보드에서 로그 확인
# 또는 CLI 사용 (설치된 경우)
cloudtype logs --app linus-todo-mongo-backend
```

### 📊 API 테스트

배포 후 다음 명령어로 API 테스트:

```bash
# 메인 페이지 테스트
curl https://linus-todo-mongo-backend.cloudtype.app/

# API 테스트
curl https://linus-todo-mongo-backend.cloudtype.app/api/todos

# 할일 생성 테스트
curl -X POST https://linus-todo-mongo-backend.cloudtype.app/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Cloudtype 배포 테스트", "priority": "high"}'
```

### 🎯 주요 변경사항 요약

1. **포트 바인딩**: `0.0.0.0:PORT`로 모든 인터페이스에서 접근 가능
2. **동적 포트**: Cloudtype이 할당하는 포트 자동 감지
3. **CORS 허용**: Cloudtype 도메인을 허용된 오리진에 추가
4. **프로덕션 설정**: NODE_ENV를 production으로 변경
5. **배포 파일**: Procfile과 cloudtype.json 추가

이제 Cloudtype에서 자동으로 재배포가 시작될 것입니다! 🚀
