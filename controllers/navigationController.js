const { db } = require('../config/db');

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

const run = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ insertId: this.lastID });
      }
    });
  });
};

const checkDbConnection = async () => {
  try {
    return new Promise((resolve) => {
      db.get('SELECT 1 AS test', (err) => {
        resolve(!err);
      });
    });
  } catch (error) {
    return false;
  }
};

const getNavigations = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败' });
    }

    const navigations = await query(
      'SELECT id, name, route, permission, status, created_at, updated_at FROM navigation WHERE status = 1 ORDER BY created_at DESC'
    );

    const currentUserRole = req.user?.role || 'user';

    const result = navigations.map(item => ({
      ...item,
      permission: JSON.parse(item.permission)
    })).filter(nav => {
      const permissions = nav.permission || [];
      
      if (permissions.includes('all')) {
        return true;
      }
      
      return permissions.includes(currentUserRole);
    });

    res.status(200).json({ navigations: result });
  } catch (error) {
    console.error('查询导航信息失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

const getAllNavigations = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败' });
    }

    const navigations = await query(
      'SELECT id, name, route, permission, status, created_at, updated_at FROM navigation ORDER BY created_at DESC'
    );

    const currentUserRole = req.user?.role || 'user';

    const result = navigations.map(item => ({
      ...item,
      permission: JSON.parse(item.permission)
    })).filter(nav => {
      // 开发者看到全部导航
      if (currentUserRole === 'developer') {
        return true;
      }
      
      const permissions = nav.permission || [];
      
      if (permissions.includes('all')) {
        return true;
      }
      
      return permissions.includes(currentUserRole);
    });

    res.status(200).json({ navigations: result });
  } catch (error) {
    console.error('查询所有导航信息失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

const createNavigation = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败' });
    }

    const { name, route, permission, status } = req.body;

    if (!name || !route) {
      return res.status(400).json({ error: '请提供导航名称和路由' });
    }

    const permissions = permission && Array.isArray(permission) 
      ? JSON.stringify(permission) 
      : '["user"]';

    const navStatus = status !== undefined ? (status ? 1 : 0) : 1;

    const result = await run(
      'INSERT INTO navigation (name, route, permission, status) VALUES (?, ?, ?, ?)',
      [name, route, permissions, navStatus]
    );

    res.status(201).json({ message: '导航信息创建成功', id: result.insertId });
  } catch (error) {
    console.error('创建导航信息失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

const updateNavigation = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败' });
    }

    const { id } = req.params;
    const { name, route, permission, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: '请提供导航ID' });
    }

    const existingNav = await query('SELECT * FROM navigation WHERE id = ?', [id]);
    if (existingNav.length === 0) {
      return res.status(404).json({ error: '导航信息不存在' });
    }

    const updateFields = [];
    const params = [];

    if (name) {
      updateFields.push('name = ?');
      params.push(name);
    }
    if (route) {
      updateFields.push('route = ?');
      params.push(route);
    }
    if (permission && Array.isArray(permission)) {
      updateFields.push('permission = ?');
      params.push(JSON.stringify(permission));
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      params.push(status ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '请提供要修改的字段' });
    }

    params.push(id);

    await run(
      `UPDATE navigation SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    res.status(200).json({ message: '导航信息更新成功' });
  } catch (error) {
    console.error('更新导航信息失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

const deleteNavigation = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败' });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: '请提供导航ID' });
    }

    const existingNav = await query('SELECT * FROM navigation WHERE id = ?', [id]);
    if (existingNav.length === 0) {
      return res.status(404).json({ error: '导航信息不存在' });
    }

    await run('DELETE FROM navigation WHERE id = ?', [id]);

    res.status(200).json({ message: '导航信息删除成功' });
  } catch (error) {
    console.error('删除导航信息失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getNavigations,
  getAllNavigations,
  createNavigation,
  updateNavigation,
  deleteNavigation
};