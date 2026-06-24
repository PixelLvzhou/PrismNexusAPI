#!/usr/bin/env node

/**
 * 数据库初始化脚本
 * 用于在生产环境初始化数据库
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.db');

console.log('===========================================');
console.log('   Prism Nexus 数据库初始化脚本');
console.log('===========================================');
console.log('');

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  }

  console.log('✅ 数据库连接成功');
  console.log('📁 数据库路径:', dbPath);
  console.log('');

  try {
    // 创建用户表
    await createUsersTable();
    
    // 检查是否需要创建默认管理员
    await checkDefaultAdmin();
    
    console.log('');
    console.log('===========================================');
    console.log('✅ 数据库初始化完成！');
    console.log('===========================================');
    
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    db.close();
    process.exit(1);
  }
});

function createUsersTable() {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        status TEXT DEFAULT 'enabled' CHECK(status IN ('enabled', 'disabled')),
        deleted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.run(sql, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ 用户表创建/检查完成');
        resolve();
      }
    });
  });
}

async function checkDefaultAdmin() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count === 0) {
        console.log('');
        console.log('📝 未找到任何用户，是否创建默认管理员？');
        
        const defaultUsername = process.argv[2] || 'admin';
        const defaultEmail = process.argv[3] || 'admin@example.com';
        const defaultPassword = process.argv[4] || 'admin123';

        try {
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);
          
          db.run(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [defaultUsername, defaultEmail, hashedPassword],
            function(err) {
              if (err) {
                reject(err);
              } else {
                console.log('');
                console.log('✅ 默认管理员创建成功！');
                console.log('');
                console.log('   用户名:', defaultUsername);
                console.log('   邮箱:', defaultEmail);
                console.log('   密码:', defaultPassword);
                console.log('');
                console.log('⚠️  请立即登录并修改默认密码！');
                resolve();
              }
            }
          );
        } catch (error) {
          reject(error);
        }
      } else {
        console.log('✅ 数据库中已有', row.count, '个用户');
        resolve();
      }
    });
  });
}
