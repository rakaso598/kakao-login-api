// services/userService.js
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Mongoose 사용자 스키마 정의
const userSchema = new mongoose.Schema({
    kakaoId: { type: String, required: true, unique: true }, // 카카오 고유 ID
    email: { type: String, required: true }, // 사용자 이메일
    name: { type: String }, // 사용자 이름
}, { timestamps: true }); // 생성 및 수정 시간을 자동으로 기록

const User = mongoose.model('User', userSchema); // 사용자 모델 생성

// 사용자 정보를 DB에 저장하는 함수
async function saveUser(userInfo) {
    const kakaoId = userInfo.id;
    const existingUser = await User.findOne({ kakaoId });

    if (!existingUser) {
        // 새 사용자 저장
        const newUser = new User({
            kakaoId,
            email: userInfo.kakao_account.email
        });

        await newUser.save();
    }
    return kakaoId; // 사용자 ID 반환
}

// JWT 토큰 생성 함수
function generateToken(kakaoId) {
    const token = jwt.sign({ id: kakaoId }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    return token;
}

module.exports = {
    saveUser,
    generateToken,
    User, // User 모델도 내보내기
};
