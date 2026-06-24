const { db } = require('../config/db');

// 权限编码定义
const PERMISSION_CODES = {
  NAV_MANAGE: { code: 'NAV_MANAGE', name: '导航管理权限' },
  ACCOUNT_MANAGE: { code: 'ACCOUNT_MANAGE', name: '账户管理权限' }
};

// 检查数据库连接状态
const checkDbConnection = async () => {
  try {
    return new Promise((resolve, reject) => {
      db.get('SELECT 1 AS test', (err, row) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  } catch (error) {
    return false;
  }
};

// 执行SQL查询
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// 执行SQL单行查询
const get = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// 执行SQL写入
const run = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ insertId: this.lastID, changes: this.changes });
      }
    });
  });
};

// 检查用户是否拥有某权限
const checkUserHasPermission = async (userId, permissionCode) => {
  const result = await get(
    'SELECT id FROM user_permissions WHERE user_id = ? AND permission_code = ?',
    [userId, permissionCode]
  );
  return result !== undefined;
};

// 检查用户是否有待审批的申请
const checkPendingApplication = async (userId, permissionCode) => {
  const result = await get(
    'SELECT id FROM permission_applications WHERE applicant_id = ? AND permission_code = ? AND status = ?',
    [userId, permissionCode, 'pending']
  );
  return result !== undefined;
};

// 将过期的申请标记为过期
const expireOldApplications = async () => {
  try {
    await run(
      `UPDATE permission_applications SET status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE status = 'pending' AND expires_at < datetime('now')`,
      []
    );
  } catch (error) {
    console.error('Error expiring old applications:', error.message);
  }
};

// 权限申请接口
const applyPermission = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const { permission_code } = req.body;
    const applicantId = req.user.id;

    // 验证权限编码
    if (!permission_code || !PERMISSION_CODES[permission_code]) {
      return res.status(400).json({ error: '无效的权限编码' });
    }

    // 检查申请者是否是管理员
    const applicant = await get('SELECT role FROM users WHERE id = ?', [applicantId]);
    if (!applicant || applicant.role !== 'admin') {
      return res.status(403).json({ error: '只有管理员可以申请权限' });
    }

    // 检查用户是否已拥有该权限
    const hasPermission = await checkUserHasPermission(applicantId, permission_code);
    if (hasPermission) {
      return res.status(400).json({ error: '您已拥有该权限' });
    }

    // 检查是否有待审批的申请
    const hasPending = await checkPendingApplication(applicantId, permission_code);
    if (hasPending) {
      return res.status(400).json({ error: '您已有待审批的申请，请等待审批结果' });
    }

    // 计算过期时间（24小时后）
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 创建申请记录
    const result = await run(
      'INSERT INTO permission_applications (applicant_id, permission_code, status, expires_at) VALUES (?, ?, ?, ?)',
      [applicantId, permission_code, 'pending', expiresAt]
    );

    res.status(201).json({
      success: true,
      message: '申请已提交',
      application_id: result.insertId,
      expires_at: expiresAt
    });
  } catch (error) {
    console.error('权限申请失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 权限申请列表查询接口
const manageApplications = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const { type, page = 1, page_size = 10, status, application_id, reject_reason } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // 先处理过期的申请
    await expireOldApplications();

    switch (type) {
      case 'query': {
        // 构建查询条件
        let whereClause = '';
        const params = [];

        if (status && status !== 'all') {
          whereClause = ' WHERE pa.status = ?';
          params.push(status);
        }

        // 非开发者只能查看自己的申请
        if (currentUserRole !== 'developer') {
          whereClause += whereClause ? ' AND' : ' WHERE';
          whereClause += ' pa.applicant_id = ?';
          params.push(currentUserId);
        }

        const offset = (page - 1) * page_size;

        // 查询申请列表
        const applications = await query(`
          SELECT 
            pa.id,
            pa.applicant_id,
            pa.permission_code,
            pa.status,
            pa.approver_id,
            pa.reject_reason,
            pa.expires_at,
            pa.created_at,
            pa.updated_at,
            u1.username as applicant_name,
            u2.username as approver_name
          FROM permission_applications pa
          LEFT JOIN users u1 ON pa.applicant_id = u1.id
          LEFT JOIN users u2 ON pa.approver_id = u2.id
          ${whereClause}
          ORDER BY pa.created_at DESC
          LIMIT ? OFFSET ?
        `, [...params, page_size, offset]);

        // 查询总数
        const countResult = await get(`
          SELECT COUNT(*) as total FROM permission_applications pa
          ${whereClause}
        `, params);

        res.status(200).json({
          applications,
          pagination: {
            page,
            page_size,
            total: countResult.total,
            total_pages: Math.ceil(countResult.total / page_size)
          }
        });
        break;
      }

      case 'cancel': {
        if (!application_id) {
          return res.status(400).json({ error: '请提供申请记录ID' });
        }

        // 检查申请是否存在且属于当前用户
        const application = await get(
          'SELECT * FROM permission_applications WHERE id = ? AND applicant_id = ? AND status = ?',
          [application_id, currentUserId, 'pending']
        );

        if (!application) {
          return res.status(404).json({ error: '申请记录不存在或无权取消' });
        }

        await run(
          'UPDATE permission_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['cancelled', application_id]
        );

        res.status(200).json({ message: '申请已取消' });
        break;
      }

      case 'approve': {
        if (!application_id) {
          return res.status(400).json({ error: '请提供申请记录ID' });
        }

        // 只有开发者可以审批
        if (currentUserRole !== 'developer') {
          return res.status(403).json({ error: '只有开发者可以审批权限申请' });
        }

        // 检查申请是否存在且为待审批状态
        const application = await get(
          'SELECT * FROM permission_applications WHERE id = ? AND status = ?',
          [application_id, 'pending']
        );

        if (!application) {
          return res.status(404).json({ error: '申请记录不存在或已处理' });
        }

        // 检查用户是否已拥有该权限
        const hasPermission = await checkUserHasPermission(application.applicant_id, application.permission_code);
        if (hasPermission) {
          return res.status(400).json({ error: '该用户已拥有该权限' });
        }

        // 更新申请状态为已通过
        await run(
          'UPDATE permission_applications SET status = ?, approver_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['approved', currentUserId, application_id]
        );

        // 在用户权限表中添加记录
        await run(
          'INSERT INTO user_permissions (user_id, permission_code, granted_by) VALUES (?, ?, ?)',
          [application.applicant_id, application.permission_code, currentUserId]
        );

        res.status(200).json({ message: '审批通过，权限已授予' });
        break;
      }

      case 'reject': {
        if (!application_id) {
          return res.status(400).json({ error: '请提供申请记录ID' });
        }

        // 只有开发者可以审批
        if (currentUserRole !== 'developer') {
          return res.status(403).json({ error: '只有开发者可以审批权限申请' });
        }

        // 检查申请是否存在且为待审批状态
        const application = await get(
          'SELECT * FROM permission_applications WHERE id = ? AND status = ?',
          [application_id, 'pending']
        );

        if (!application) {
          return res.status(404).json({ error: '申请记录不存在或已处理' });
        }

        // 更新申请状态为已驳回
        await run(
          'UPDATE permission_applications SET status = ?, approver_id = ?, reject_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['rejected', currentUserId, reject_reason || '', application_id]
        );

        res.status(200).json({ message: '申请已驳回' });
        break;
      }

      default: {
        return res.status(400).json({ error: '无效的操作类型' });
      }
    }
  } catch (error) {
    console.error('权限申请管理失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取当前用户的权限列表
const getMyPermissions = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    // 开发者默认拥有所有权限
    if (userRole === 'developer') {
      const permissions = Object.values(PERMISSION_CODES).map(p => ({
        code: p.code,
        name: p.name,
        granted: true,
        granted_at: null,
        granted_by: null
      }));
      return res.status(200).json({ permissions });
    }

    // 查询用户的权限
    const userPermissions = await query(`
      SELECT 
        up.permission_code,
        up.granted_at,
        u.username as granted_by_name
      FROM user_permissions up
      LEFT JOIN users u ON up.granted_by = u.id
      WHERE up.user_id = ?
    `, [userId]);

    // 构建权限列表
    const permissions = Object.values(PERMISSION_CODES).map(p => {
      const userPerm = userPermissions.find(up => up.permission_code === p.code);
      return {
        code: p.code,
        name: p.name,
        granted: userPerm !== undefined,
        granted_at: userPerm ? userPerm.granted_at : null,
        granted_by: userPerm ? userPerm.granted_by_name : null
      };
    });

    res.status(200).json({ permissions });
  } catch (error) {
    console.error('获取权限列表失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户的权限列表（用于账户列表展示）
const getUserPermissions = async (userId, userRole) => {
  // 开发者默认拥有所有权限
  if (userRole === 'developer') {
    return Object.values(PERMISSION_CODES).map(p => ({
      code: p.code,
      name: p.name,
      granted: true,
      granted_at: null,
      granted_by: null
    }));
  }

  // 查询用户的权限
  const userPermissions = await query(`
    SELECT 
      up.permission_code,
      up.granted_at,
      u.username as granted_by_name
    FROM user_permissions up
    LEFT JOIN users u ON up.granted_by = u.id
    WHERE up.user_id = ?
  `, [userId]);

  // 构建权限列表
  return Object.values(PERMISSION_CODES).map(p => {
    const userPerm = userPermissions.find(up => up.permission_code === p.code);
    return {
      code: p.code,
      name: p.name,
      granted: userPerm !== undefined,
      granted_at: userPerm ? userPerm.granted_at : null,
      granted_by: userPerm ? userPerm.granted_by_name : null
    };
  });
};

// 直接授予权限（开发者操作）
const grantPermission = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const { user_id, permission_codes } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // 只有开发者可以授予权限
    if (currentUserRole !== 'developer') {
      return res.status(403).json({ error: '只有开发者可以授予权限' });
    }

    // 验证用户ID
    if (!user_id) {
      return res.status(400).json({ error: '请提供用户ID' });
    }

    // 验证权限编码
    if (!permission_codes || !Array.isArray(permission_codes)) {
      return res.status(400).json({ error: '请提供权限编码列表' });
    }

    // 检查目标用户是否存在
    const targetUser = await get('SELECT id, role FROM users WHERE id = ?', [user_id]);
    if (!targetUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 开发者不能给自己或其他开发者授予权限
    if (targetUser.role === 'developer') {
      return res.status(400).json({ error: '不能修改开发者的权限' });
    }

    // 获取用户当前已有的权限
    const existingPermissions = await query(
      'SELECT permission_code FROM user_permissions WHERE user_id = ?',
      [user_id]
    );
    const existingCodes = existingPermissions.map(p => p.permission_code);

    // 需要添加的权限（前端选中但数据库中没有的）
    const codesToAdd = permission_codes.filter(code =>
      PERMISSION_CODES[code] && !existingCodes.includes(code)
    );

    // 需要删除的权限（数据库中有但前端没选中的）
    const codesToRemove = existingCodes.filter(code =>
      !permission_codes.includes(code)
    );

    // 添加新权限
    for (const code of codesToAdd) {
      await run(
        'INSERT INTO user_permissions (user_id, permission_code, granted_by) VALUES (?, ?, ?)',
        [user_id, code, currentUserId]
      );
    }

    // 删除被取消的权限
    for (const code of codesToRemove) {
      await run(
        'DELETE FROM user_permissions WHERE user_id = ? AND permission_code = ?',
        [user_id, code]
      );
    }

    res.status(200).json({ message: '权限配置成功' });
  } catch (error) {
    console.error('权限授予失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  applyPermission,
  manageApplications,
  getMyPermissions,
  getUserPermissions,
  grantPermission,
  checkUserHasPermission,
  PERMISSION_CODES
};
