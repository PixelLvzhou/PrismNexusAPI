const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 创建SQLite数据库连接
const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// 初始化数据库
const initDatabase = async () => {
  try {
    // 创建用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        avatar_url TEXT DEFAULT '',
        status TEXT DEFAULT 'enabled',
        bio TEXT DEFAULT '',
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table created successfully');
      }
    });

    // 为现有表添加字段
    db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'enabled'`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding status column:', err.message);
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding deleted_at column:', err.message);
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding role column:', err.message);
      } else if (!err) {
        console.log('Role column added successfully');
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT ''`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding avatar_url column:', err.message);
      } else if (!err) {
        console.log('Avatar_url column added successfully');
      }
    });

    db.run(`ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding bio column:', err.message);
      } else if (!err) {
        console.log('Bio column added successfully');
      }
    });

    // 迁移现有用户数据，设置默认值
    db.run(`UPDATE users SET role = COALESCE(role, 'user') WHERE role IS NULL`, (err) => {
      if (err) {
        console.error('Error updating role for existing users:', err.message);
      } else {
        console.log('Role migrated for existing users');
      }
    });

    db.run(`UPDATE users SET avatar_url = COALESCE(avatar_url, '') WHERE avatar_url IS NULL`, (err) => {
      if (err) {
        console.error('Error updating avatar_url for existing users:', err.message);
      } else {
        console.log('Avatar_url migrated for existing users');
      }
    });

    db.run(`UPDATE users SET bio = COALESCE(bio, '') WHERE bio IS NULL`, (err) => {
      if (err) {
        console.error('Error updating bio for existing users:', err.message);
      } else {
        console.log('Bio migrated for existing users');
      }
    });

    db.run(`UPDATE users SET status = COALESCE(status, 'enabled') WHERE status IS NULL`, (err) => {
      if (err) {
        console.error('Error updating status for existing users:', err.message);
      } else {
        console.log('Status migrated for existing users');
      }
    });

    // 创建导航信息表
    db.run(`
      CREATE TABLE IF NOT EXISTS navigation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        route TEXT NOT NULL,
        permission TEXT DEFAULT '["user"]',
        status INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating navigation table:', err.message);
      } else {
        console.log('Navigation table created successfully');
      }
    });

    // 创建权限申请表
    db.run(`
      CREATE TABLE IF NOT EXISTS permission_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicant_id INTEGER NOT NULL,
        permission_code TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')),
        approver_id INTEGER,
        reject_reason TEXT,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (applicant_id) REFERENCES users(id),
        FOREIGN KEY (approver_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating permission_applications table:', err.message);
      } else {
        console.log('Permission applications table created successfully');
      }
    });

    // 创建用户权限表
    db.run(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        permission_code TEXT NOT NULL,
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        granted_by INTEGER NOT NULL,
        UNIQUE(user_id, permission_code),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (granted_by) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating user_permissions table:', err.message);
      } else {
        console.log('User permissions table created successfully');
      }
    });
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
};

// 测试数据库连接
const testConnection = async () => {
  try {
    return new Promise((resolve, reject) => {
      db.get('SELECT 1 AS test', (err, row) => {
        if (err) {
          console.error('Database connection test failed:', err.message);
          reject(err);
        } else {
          console.log('Database connection test successful');
          resolve(true);
        }
      });
    });
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  db,
  initDatabase,
  testConnection
};