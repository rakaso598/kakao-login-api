// models/User.js
const mongoose = require('mongoose');

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
    kakaoId: {
        type: String,
        required: true,
        unique: true, // 카카오 ID는 고유해야 함
    },
    email: {
        type: String,
        required: true,
    },
    profile: {
        type: String,
        required: false, // 프로필 이미지 필드는 선택 사항
    },
    createdAt: {
        type: Date,
        default: Date.now, // 기본 생성일
    },
});

// 사용자 모델 생성
const User = mongoose.model('User', userSchema);

module.exports = User;
