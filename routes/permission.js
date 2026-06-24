const express = require('express');
const { applyPermission, manageApplications, getMyPermissions, grantPermission } = require('../controllers/permissionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 权限申请接口 - 需要管理员权限
router.post('/apply', authenticateToken, applyPermission);

// 权限申请列表管理接口 - 需要认证
router.post('/applications', authenticateToken, manageApplications);

// 获取当前用户权限接口 - 需要认证
router.get('/my-permissions', authenticateToken, getMyPermissions);

// 直接授予权限接口 - 仅开发者可用
router.post('/grant', authenticateToken, grantPermission);

module.exports = router;
