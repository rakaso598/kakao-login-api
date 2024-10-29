// services/authService.js
const User = require('../models/User'); // 사용자 모델 임포트
const jwt = require('jsonwebtoken');

async function saveUser(userInfo) {
    const kakaoId = userInfo.id;
    const existingUser = await User.findOne({ kakaoId });

    if (!existingUser) {
        // 새 사용자 저장
        const newUser = new User({
            kakaoId,
            email: userInfo.kakao_account.email, // 필요시 추가
            profile: userInfo.properties.profile_image, // 필요시 추가
            // 추가 필드
        });

        await newUser.save();
    }
    return kakaoId; // 사용자 ID 반환
}

function generateToken(kakaoId) {
    return jwt.sign({ kakaoId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = {
    saveUser,
    generateToken,
};
