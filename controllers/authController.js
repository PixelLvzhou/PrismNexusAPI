const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const redis = require('redis');
const { db } = require('../config/db');
const { getUserPermissions, checkUserHasPermission } = require('./permissionController');

// 加载环境变量
require('dotenv').config();

// 验证码存储机制
let verificationCodeStore = null;
let useRedis = false;

// 尝试连接Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

redisClient.on('error', (err) => {
  console.error('Redis connection failed, will use memory storage:', err.message);
  // 初始化内存存储
  verificationCodeStore = new Map();
  useRedis = false;
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully');
  verificationCodeStore = redisClient;
  useRedis = true;
});

// 初始化内存存储作为备选
if (!verificationCodeStore) {
  verificationCodeStore = new Map();
  useRedis = false;
}

// 生成6位随机验证码
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 存储验证码
const storeVerificationCode = async (key, code, expiration = 60) => {
  try {
    if (useRedis) {
      await verificationCodeStore.set(key, code, 'EX', expiration);
    } else {
      // 内存存储，带过期时间
      const item = {
        code,
        expireAt: Date.now() + expiration * 1000
      };
      verificationCodeStore.set(key, item);
    }
    return true;
  } catch (error) {
    console.error('Failed to store verification code:', error.message);
    return false;
  }
};

// 获取验证码
const getVerificationCode = async (key) => {
  try {
    if (useRedis) {
      return await verificationCodeStore.get(key);
    } else {
      const item = verificationCodeStore.get(key);
      if (!item) return null;

      // 检查是否过期
      if (Date.now() > item.expireAt) {
        verificationCodeStore.delete(key);
        return null;
      }
      return item.code;
    }
  } catch (error) {
    console.error('Failed to get verification code:', error.message);
    return null;
  }
};

// 删除验证码
const deleteVerificationCode = async (key) => {
  try {
    if (useRedis) {
      await verificationCodeStore.del(key);
    } else {
      verificationCodeStore.delete(key);
    }
    return true;
  } catch (error) {
    console.error('Failed to delete verification code:', error.message);
    return false;
  }
};

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 发送验证码邮件
const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: '密码重置验证码',
      text: `您的密码重置验证码是: ${code}，有效期为5分钟。`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error.message);
    return false;
  }
};

// 严格版邮箱格式正则
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// 邮箱校验函数
const validateEmail = (email) => {
  // 步骤1：空值/空格校验
  if (!email || email.trim() === '') {
    return { valid: false, msg: '邮箱不能为空' };
  }

  // 步骤2：严格格式校验
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, msg: '请填写正确的邮箱' };
  }

  // 步骤3：域名白名单校验
  const whiteListDomains = ['qq.com', '163.com', '126.com', 'yeah.net', 'vip.163.com', 'vip.126.com', 'foxmail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || !whiteListDomains.includes(domain)) {
    return { valid: false, msg: '仅支持QQ邮箱/网易邮箱' };
  }

  return { valid: true, msg: '' };
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

// 执行SQL插入
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

// 注册控制器
const register = async (req, res) => {
  try {
    // 检查数据库连接
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const { username, password, email, code } = req.body;

    // 验证输入
    if (!username || !password || !email || !code) {
      return res.status(400).json({ error: '请提供用户名、密码、邮箱和验证码' });
    }

    // 邮箱校验
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.msg });
    }

    // 用户名长度校验（4-8个字符）
    if (username.length < 4 || username.length > 8) {
      return res.status(400).json({ error: '用户名长度必须在4-8个字符之间' });
    }

    // 用户名字符规则校验
    // 只能包含：汉字或字母（大小写）、数字、下划线（_）、减号（-），不能以特殊字符开头
    const usernameRegex = /^[\u4e00-\u9fa5a-zA-Z0-9][\u4e00-\u9fa5a-zA-Z0-9_-]*$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: '用户名只能包含汉字、字母、数字、下划线(_)和减号(-)，且不能以特殊字符开头' });
    }

    // 敏感词过滤
    const sensitiveWords = ['admin', '管理员', '违法违规'];
    for (const word of sensitiveWords) {
      if (username.toLowerCase().includes(word.toLowerCase())) {
        return res.status(400).json({ error: '用户名包含敏感词，请重新输入' });
      }
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUserByUsername.length > 0) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUserByEmail.length > 0) {
      return res.status(400).json({ error: '邮箱已存在' });
    }

    // 验证验证码
    const key = `reg:${email}`;
    const storedCode = await getVerificationCode(key);
    if (!storedCode) {
      return res.status(400).json({ error: '验证码已过期，请重新发送' });
    }

    if (storedCode !== code) {
      return res.status(400).json({ error: '验证码错误' });
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 插入新用户，包含新增字段的默认值
    await run(
      'INSERT INTO users (username, email, password, role, avatar_url, status, bio) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, 'user', '', 'enabled', '']
    );

    // 删除验证码
    await deleteVerificationCode(key);

    // 返回注册成功信息
    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    console.error('注册失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 登录控制器
const login = async (req, res) => {
  try {
    // 检查数据库连接
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '请提供用户名和密码' });
    }

    // 查找用户（排除已删除的账户）
    const users = await query(
      'SELECT * FROM users WHERE username = ? AND deleted_at IS NULL',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const user = users[0];

    // 检查账号状态
    if (user.status === 'disabled') {
      return res.status(403).json({ error: '账号已被封禁，请联系作者进行解封' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成 JWT 令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 返回令牌和用户信息
    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 发送验证码接口
const sendVerificationCode = async (req, res) => {
  try {
    // 检查数据库连接
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const { type, username, email } = req.body;

    // 验证type参数
    if (!type || (type !== 'reg' && type !== 'mod')) {
      return res.status(400).json({ error: '请提供有效的type参数（reg或mod）' });
    }

    let key;

    if (type === 'reg') {
      // 注册模式，只需要邮箱参数
      if (!email) {
        return res.status(400).json({ error: '请提供邮箱' });
      }

      // 邮箱校验
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({ error: emailValidation.msg });
      }

      // 检查邮箱是否已存在
      const existingUserByEmail = await query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (existingUserByEmail.length > 0) {
        return res.status(400).json({ error: '该邮箱已被使用' });
      }

      key = `reg:${email}`;
    } else if (type === 'mod') {
      // 修改模式，保持现有逻辑
      if (!username || !email) {
        return res.status(400).json({ error: '请提供用户名和邮箱' });
      }

      // 邮箱校验
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({ error: emailValidation.msg });
      }

      // 检查用户名和邮箱绑定关系
      const users = await query(
        'SELECT * FROM users WHERE username = ? AND email = ?',
        [username, email]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: '用户名和邮箱不匹配' });
      }

      key = `${username}:${email}`;
    }

    // 生成验证码
    const code = generateVerificationCode();

    // 存储验证码，有效期5分钟
    const stored = await storeVerificationCode(key, code, 300);
    if (!stored) {
      return res.status(500).json({ error: '验证码存储失败，请稍后重试' });
    }

    // 发送验证码邮件
    const sent = await sendVerificationEmail(email, code);
    if (!sent) {
      return res.status(500).json({ error: '邮件发送失败，请稍后重试' });
    }

    // 返回成功信息
    res.status(200).json({ message: '验证码已发送到您的邮箱' });
  } catch (error) {
    console.error('发送验证码失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 重置密码接口
const resetPassword = async (req, res) => {
  try {
    // 检查数据库连接
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const { type, username, email, code, newPassword } = req.body;

    // 验证type参数
    if (!type || (type !== 'reg' && type !== 'mod')) {
      return res.status(400).json({ error: '请提供有效的type参数（reg或mod）' });
    }

    let key;
    let user;

    if (type === 'reg') {
      // 注册模式
      if (!email || !code) {
        return res.status(400).json({ error: '请提供邮箱和验证码' });
      }

      key = `reg:${email}`;
    } else if (type === 'mod') {
      // 修改模式
      if (!username || !email || !code) {
        return res.status(400).json({ error: '请提供用户名、邮箱和验证码' });
      }

      // 检查用户名和邮箱绑定关系
      const users = await query(
        'SELECT * FROM users WHERE username = ? AND email = ?',
        [username, email]
      );

      if (users.length === 0) {
        return res.status(400).json({ error: '用户名和邮箱不匹配' });
      }

      user = users[0];
      key = `${username}:${email}`;
    }

    // 验证验证码
    const storedCode = await getVerificationCode(key);
    if (!storedCode) {
      return res.status(400).json({ error: '验证码已过期，请重新发送' });
    }

    if (storedCode !== code) {
      return res.status(400).json({ error: '验证码错误' });
    }

    // 根据是否传密码来决定操作类型
    if (newPassword) {
      // 传入了密码，执行修改密码操作
      if (type === 'mod' && !user) {
        return res.status(400).json({ error: '用户信息不存在' });
      }

      // 加密新密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      if (type === 'mod') {
        // 更新密码
        await run(
          'UPDATE users SET password = ? WHERE id = ?',
          [hashedPassword, user.id]
        );
      }

      // 删除验证码
      await deleteVerificationCode(key);

      // 返回成功信息
      res.status(200).json({ message: '密码修改成功' });
    } else {
      // 未传密码，只执行验证操作
      // 不删除验证码，因为后续还需要使用
      // 返回成功信息
      res.status(200).json({ message: '验证成功' });
    }
  } catch (error) {
    console.error('重置密码失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取当前用户信息接口
const getProfile = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const userId = req.user.id;

    const users = await query(
      'SELECT id, username, email, role, avatar_url, status, bio FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const user = users[0];

    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        status: user.status,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 账户管理接口
const manageAccounts = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const { type, id, username, email, role, status, bio } = req.body;
    const currentUserId = req.user.id;

    const currentUser = await query(
      'SELECT role FROM users WHERE id = ?',
      [currentUserId]
    );
    if (currentUser.length === 0) {
      return res.status(404).json({ error: '当前用户不存在' });
    }
    const currentRole = currentUser[0].role;

    const getTargetUser = async (targetId) => {
      const users = await query(
        'SELECT role FROM users WHERE id = ?',
        [targetId]
      );
      return users.length > 0 ? users[0] : null;
    };

    const checkDeveloperExists = async () => {
      const developers = await query(
        'SELECT id FROM users WHERE role = ?',
        ['developer']
      );
      return developers.length;
    };

    const countAdmins = async () => {
      const admins = await query(
        'SELECT id FROM users WHERE role = ?',
        ['admin']
      );
      return admins.length;
    };

    switch (type) {
      case 'query': {
        const users = await query(
          'SELECT id, username, email, role, avatar_url, status, bio, created_at FROM users ORDER BY created_at DESC'
        );
        // 为每个用户添加权限信息
        const usersWithPermissions = await Promise.all(
          users.map(async (user) => {
            const permissions = await getUserPermissions(user.id, user.role);
            return { ...user, permissions };
          })
        );
        res.status(200).json({ users: usersWithPermissions, currentRole });
        break;
      }
      case 'update': {
        if (!id) {
          return res.status(400).json({ error: '请提供用户ID' });
        }

        const targetUser = await getTargetUser(id);
        if (!targetUser) {
          return res.status(404).json({ error: '目标用户不存在' });
        }

        if (targetUser.role === 'developer') {
          return res.status(403).json({ error: '无法修改开发者账户' });
        }

        const updateFields = [];
        const params = [];

        if (username) {
          updateFields.push('username = ?');
          params.push(username);
        }
        if (email) {
          updateFields.push('email = ?');
          params.push(email);
        }
        if (bio) {
          updateFields.push('bio = ?');
          params.push(bio);
        }

        if (updateFields.length === 0) {
          return res.status(400).json({ error: '请提供要修改的字段' });
        }

        params.push(id);

        await run(
          `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          params
        );

        res.status(200).json({ message: '账户信息更新成功' });
        break;
      }
      case 'delete': {
        if (!id) {
          return res.status(400).json({ error: '请提供用户ID' });
        }

        // 非开发者需要 ACCOUNT_MANAGE 权限才能执行操作
        if (currentRole !== 'developer') {
          const hasPermission = await checkUserHasPermission(currentUserId, 'ACCOUNT_MANAGE');
          if (!hasPermission) {
            return res.status(403).json({ error: '您没有账户管理权限，请先申请' });
          }
        }

        const targetUser = await getTargetUser(id);
        if (!targetUser) {
          return res.status(404).json({ error: '目标用户不存在' });
        }

        if (targetUser.role === 'developer') {
          return res.status(403).json({ error: '无法删除开发者账户' });
        }

        if (currentRole === 'admin' && targetUser.role === 'admin') {
          return res.status(403).json({ error: '管理员无法删除其他管理员账户' });
        }

        await run(
          'DELETE FROM users WHERE id = ?',
          [id]
        );

        res.status(200).json({ message: '账户已删除' });
        break;
      }
      case 'status': {
        if (!id || !status) {
          return res.status(400).json({ error: '请提供用户ID和状态' });
        }

        if (status !== 'enabled' && status !== 'disabled') {
          return res.status(400).json({ error: '状态值只能是 enabled 或 disabled' });
        }

        // 管理员需要 ACCOUNT_MANAGE 权限才能执行操作
        if (currentRole === 'admin') {
          const hasPermission = await checkUserHasPermission(currentUserId, 'ACCOUNT_MANAGE');
          if (!hasPermission) {
            return res.status(403).json({ error: '您没有账户管理权限，请先申请' });
          }
        }

        const targetUser = await getTargetUser(id);
        if (!targetUser) {
          return res.status(404).json({ error: '目标用户不存在' });
        }

        if (targetUser.role === 'developer') {
          return res.status(403).json({ error: '无法修改开发者账户状态' });
        }

        if (currentRole === 'admin' && targetUser.role === 'admin') {
          return res.status(403).json({ error: '管理员无法修改其他管理员账户状态' });
        }

        await run(
          'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [status, id]
        );

        res.status(200).json({ message: '账户状态更新成功' });
        break;
      }
      case 'role': {
        if (!id || !role) {
          return res.status(400).json({ error: '请提供用户ID和权限等级' });
        }

        // 非开发者需要 ACCOUNT_MANAGE 权限才能执行操作
        if (currentRole !== 'developer') {
          const hasPermission = await checkUserHasPermission(currentUserId, 'ACCOUNT_MANAGE');
          if (!hasPermission) {
            return res.status(403).json({ error: '您没有账户管理权限，请先申请' });
          }
        }

        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({ error: '权限等级只能是 admin 或 user' });
        }

        const targetUser = await getTargetUser(id);
        if (!targetUser) {
          return res.status(404).json({ error: '目标用户不存在' });
        }

        if (targetUser.role === 'developer') {
          return res.status(403).json({ error: '无法修改开发者账户权限' });
        }

        if (currentRole === 'admin' && targetUser.role === 'admin') {
          return res.status(403).json({ error: '管理员无法修改其他管理员账户权限' });
        }

        if (role === 'admin') {
          const adminCount = await countAdmins();
          if (adminCount >= 3) {
            return res.status(403).json({ error: '管理员数量已达到上限（最多3个）' });
          }
        }

        await run(
          'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [role, id]
        );

        res.status(200).json({ message: '账户权限更新成功' });
        break;
      }
      default: {
        return res.status(400).json({ error: '无效的操作类型' });
      }
    }
  } catch (error) {
    console.error('账户管理操作失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

const fs = require('fs');
const path = require('path');

const updateProfile = async (req, res) => {
  try {
    const isConnected = await checkDbConnection();
    if (!isConnected) {
      return res.status(500).json({ error: '数据库连接失败，请稍后重试' });
    }

    const userId = req.user.id;
    const { username, bio, avatar_base64 } = req.body;

    const updateFields = [];
    const params = [];

    if (username) {
      updateFields.push('username = ?');
      params.push(username);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      params.push(bio);
    }

    if (avatar_base64) {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const base64Data = avatar_base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `avatar_${userId}_${Date.now()}.png`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);

      const avatarUrl = `http://localhost:3000/uploads/${filename}`;
      updateFields.push('avatar_url = ?');
      params.push(avatarUrl);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: '请提供要修改的字段' });
    }

    params.push(userId);

    await run(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    res.status(200).json({ message: '个人信息更新成功' });
  } catch (error) {
    console.error('更新个人信息失败:', error.message);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  register,
  login,
  sendVerificationCode,
  resetPassword,
  getProfile,
  manageAccounts,
  updateProfile
};