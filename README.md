## 카카오 로그인 API 데모 (Node.js)

### ⚠️ 중요: 데모 프로젝트 - 실제 서비스 적용 시 보안 주의 ⚠️

**본 프로젝트는 학습 및 데모 목적으로 구현되었으며, 실제 서비스 환경에서의 보안 및 안정성을 보장하지 않습니다. 따라서, 이 코드를 그대로 실제 서비스에 재사용하는 것은 권장되지 않습니다.**

**실제 서비스 적용 시 발생할 수 있는 보안 문제 및 기타 문제에 대해 책임을 지지 않습니다.**

---

## 프로젝트 개요

본 프로젝트는 Node.js 환경에서 카카오 로그인 API의 기본적인 작동 방식을 보여주는 데모 시스템입니다. 사용자는 카카오 계정을 통해 간편하게 로그인할 수 있으며, 로그인 성공 시 JWT(Json Web Token)가 발급되어 클라이언트 측에서 사용자 인증 상태를 유지하는 것을 시뮬레이션합니다. 또한, 로그인한 사용자의 기본 정보를 MongoDB에 저장하고 클라이언트에 응답으로 전달하는 과정을 포함합니다.

**주요 목표:**

* Node.js 환경에서 카카오 로그인 API 연동 과정 이해
* OAuth 2.0 인증 흐름의 기본적인 이해
* JWT를 이용한 간단한 사용자 인증 방식 학습
* MongoDB를 이용한 사용자 정보 저장 방식 이해

## 주요 기능

* **카카오 로그인 연동**: 카카오 계정을 통한 로그인 프로세스 시뮬레이션
* **액세스 토큰 획득**: 카카오로부터 액세스 토큰을 발급받는 과정 구현
* **사용자 정보 조회**: 발급받은 액세스 토큰으로 카카오 사용자 정보 API 호출
* **JWT 발급 및 쿠키 저장 (데모)**: 로그인 성공 시 JWT를 생성하여 쿠키에 저장 (실제 서비스에서는 보안에 유의해야 함)
* **사용자 정보 MongoDB 저장 (데모)**: 카카오로부터 받은 사용자 정보를 MongoDB에 저장 (실제 서비스에서는 필요한 정보만 저장)
* **클라이언트에 사용자 정보 및 토큰 전달 (데모)**: 클라이언트에게 사용자 정보와 JWT를 JSON 형태로 응답

## 프로젝트 구조
├── models/         # MongoDB 모델 정의 (예: User 모델) 및 JWT 관련 로직
├── node_modules/   # 프로젝트 의존성 모듈
├── services/       # 서비스 관련 로직 (예: 사용자 저장, 토큰 생성)
├── index.js        # 메인 애플리케이션 파일
├── package-lock.json
└── package.json

## 기술 스택

* Node.js
* Express
* MongoDB
* Mongoose
* axios (HTTP 클라이언트)
* cookie-parser (쿠키 처리)
* dotenv (환경 변수 관리)
* JWT (jsonwebtoken)

## 설치 및 실행 방법

1.  **프로젝트 클론:**
    ```bash
    git clone <레포지토리_URL>
    cd <프로젝트_디렉토리>
    ```

2.  **의존성 설치:**
    ```bash
    npm install
    ```

3.  **환경 변수 설정:**
    * `.env` 파일을 생성하고 다음 정보를 입력합니다.
      ```env
      PORT=3000
      MONGODB_URI=<MongoDB 연결 URI>
      KAKAO_CLIENT_ID=<카카오 REST API 키>
      REDIRECT_URI=http://localhost:3000/auth/kakao/callback # 개발 환경 기준
      JWT_SECRET=<JWT 시크릿 키 (안전한 값으로 설정)>
      ```
      **⚠️ 주의:** `.env` 파일은 `.gitignore`에 추가하여 Git으로 관리되지 않도록 해야 합니다.

4.  **애플리케이션 실행:**
    ```bash
    npm start
    ```

    서버가 `http://localhost:3000` 주소에서 실행됩니다.

## API 엔드포인트

* **GET /auth/kakao**: 카카오 로그인 페이지로 리다이렉트합니다.
* **GET /auth/kakao/callback**: 카카오 로그인 성공 후 콜백 URL입니다. 이 엔드포인트에서 액세스 토큰을 획득하고 사용자 정보를 처리하며 JWT를 발급합니다.

## 핵심 코드 설명 (index.js)

```javascript
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const { generateToken, saveUser } = require('./services/authService'); // 인증 서비스 로직 분리
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cookieParser());
app.use(express.json()); // 필요에 따라 JSON 요청 바디 파싱 활성화

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// 카카오 로그인 URL 생성 및 리다이렉션
app.get('/auth/kakao', (req, res) => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=account_email`;
    res.redirect(kakaoAuthUrl);
});

// 카카오 콜백 라우트
app.get('/auth/kakao/callback', async (req, res) => {
    const { code } = req.query;
    try {
        // 1. 인증 코드로 액세스 토큰 요청
        const tokenResponse = await axios.post('[https://kauth.kakao.com/oauth/token](https://kauth.kakao.com/oauth/token)', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_CLIENT_ID,
                redirect_uri: process.env.REDIRECT_URI,
                code,
            },
        });

        const { access_token } = tokenResponse.data;

        // 2. 액세스 토큰으로 사용자 정보 요청
        const userResponse = await axios.get('[https://kapi.kakao.com/v2/user/me](https://kapi.kakao.com/v2/user/me)', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userInfo = userResponse.data;
        const kakaoId = await saveUser(userInfo); // 사용자 정보 DB에 저장 (authService에서 처리)
        const token = generateToken(kakaoId); // JWT 토큰 발급 (authService에서 처리)

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // 쿠키 설정 (보안 고려)
        res.json({ token, userInfo }); // 사용자 정보 및 토큰 응답
    } catch (error) {
        console.error('카카오 로그인 실패:', error);
        res.status(500).json({ message: '카카오 로그인 중 오류가 발생했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

## 추가 정보 및 주의 사항

**보안**: 본 데모 프로젝트는 기본적인 흐름을 보여주는 것에 초점을 맞추고 있습니다. 실제 서비스 환경에서는 다음과 같은 보안 사항을 반드시 고려해야 합니다.

* **HTTPS 사용**: 쿠키를 안전하게 전송하고 중간자 공격을 방지하기 위해 HTTPS를 적용해야 합니다.
* **쿠키 보안 설정**: `httpOnly`, `secure`, `sameSite` 등의 쿠키 옵션을 적절하게 설정하여 XSS 및 CSRF 공격을 방지해야 합니다.
* **JWT 보안**: JWT 시크릿 키를 안전하게 관리하고, 토큰 유효 기간을 적절하게 설정해야 합니다.
* **데이터 검증 및 필터링**: 클라이언트로부터 전달되는 데이터를 엄격하게 검증하고 필터링하여 보안 취약점을 방지해야 합니다.
* **에러 처리**: 상세한 에러 메시지를 클라이언트에 노출하는 것은 보안상 위험할 수 있으므로, 프로덕션 환경에서는 적절한 에러 처리 및 로깅을 구현해야 합니다.

**코드 관리:**

* **서비스 로직 분리**: `authService.js`와 같이 서비스 관련 로직을 별도의 파일로 분리하여 코드의 가독성과 유지보수성을 높이는 것이 좋습니다.
* **환경 변수 관리**: 중요한 설정 정보는 환경 변수를 통해 관리하고, 특히 프로덕션 환경에서는 안전하게 관리해야 합니다.

**데이터베이스:**

* **데이터베이스 설계**: 실제 서비스에서는 사용자 정보 외에도 필요한 데이터를 효율적으로 관리하기 위한 데이터베이스 설계를 고려해야 합니다.

본 데모 코드를 바탕으로 실제 서비스를 개발할 경우에는 위에 언급된 보안 사항들을 충분히 검토하고 적용하여 안전한 시스템을 구축하시기 바랍니다.
