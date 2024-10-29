require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

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
        const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_CLIENT_ID,
                redirect_uri: process.env.REDIRECT_URI,
                code,
            },
        });

        const { access_token } = tokenResponse.data;

        // 2. 액세스 토큰으로 사용자 정보 요청
        const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        const userInfo = userResponse.data;
        res.cookie('kakao_token', access_token); // 토큰을 쿠키에 저장
        res.json(userInfo); // 사용자 정보 응답
    } catch (error) {
        console.error('카카오 로그인 실패:', error);
        res.status(500).json({ message: '카카오 로그인 중 오류가 발생했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
