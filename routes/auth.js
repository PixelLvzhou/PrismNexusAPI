const express = require('express');
const { register, login, sendVerificationCode, resetPassword, getProfile, manageAccounts, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireAccountManagePermission } = require('../middleware/admin');

const router = express.Router();

// 注册接口
router.post('/auth/register', register);

// 登录接口
router.post('/auth/login', login);

// 发送验证码接口
router.post('/auth/send-code', sendVerificationCode);

// 重置密码接口
router.post('/auth/reset-password', resetPassword);

// 获取当前用户信息接口
router.get('/auth/me', authenticateToken, getProfile);

// 更新个人信息接口
router.post('/auth/update-profile', authenticateToken, updateProfile);

// 账户管理接口（需要管理员权限或 ACCOUNT_MANAGE 权限）
router.post('/auth/accounts', authenticateToken, requireAccountManagePermission, manageAccounts);

module.exports = router;
