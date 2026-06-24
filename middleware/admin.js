const { db } = require('../config/db');
const { checkUserHasPermission } = require('../controllers/permissionController');

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT role FROM users WHERE id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0];
    
    if (user.role !== 'admin' && user.role !== 'developer') {
      return res.status(403).json({ error: '无权限访问此接口' });
    }

    next();
  } catch (error) {
    console.error('管理员权限验证失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 导航管理权限中间件：开发者、管理员或有 NAV_MANAGE 权限的普通用户可访问
const requireNavManagePermission = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT role FROM users WHERE id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0];
    
    // 开发者直接通过
    if (user.role === 'developer') {
      return next();
    }
    
    // 管理员直接通过
    if (user.role === 'admin') {
      return next();
    }
    
    // 普通用户需要检查 NAV_MANAGE 权限
    const hasPermission = await checkUserHasPermission(userId, 'NAV_MANAGE');
    if (!hasPermission) {
      return res.status(403).json({ error: '您没有导航管理权限，请先申请' });
    }
    
    next();
  } catch (error) {
    console.error('导航管理权限验证失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 账户管理权限中间件：开发者、管理员或有 ACCOUNT_MANAGE 权限的普通用户可访问
const requireAccountManagePermission = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const users = await new Promise((resolve, reject) => {
      db.all('SELECT role FROM users WHERE id = ?', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0];
    
    // 开发者直接通过
    if (user.role === 'developer') {
      return next();
    }
    
    // 管理员直接通过
    if (user.role === 'admin') {
      return next();
    }
    
    // 普通用户需要检查 ACCOUNT_MANAGE 权限
    const hasPermission = await checkUserHasPermission(userId, 'ACCOUNT_MANAGE');
    if (!hasPermission) {
      return res.status(403).json({ error: '您没有账户管理权限，请先申请' });
    }
    
    next();
  } catch (error) {
    console.error('账户管理权限验证失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  requireAdmin,
  requireNavManagePermission,
  requireAccountManagePermission
};