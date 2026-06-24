const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

const newPasswords = [
  { username: 'wk8201', password: 'password123' },
  { username: 'testuser', password: 'password456' },
  { username: 'wk1122', password: 'password789' }
];

async function resetPasswords() {
  console.log('=== 直接修改数据库密码 ===\n');
  
  for (const user of newPasswords) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      await new Promise((resolve, reject) => {
        db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, user.username], function(err) {
          if (err) {
            reject(err);
          } else {
            console.log(`✅ ${user.username}: 密码已重置为 "${user.password}"`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.log(`❌ ${user.username}: 密码重置失败 - ${error.message}`);
    }
  }
  
  console.log('\n=== 密码重置完成 ===\n');
  console.log('当前可登录账户列表:');
  console.log('┌────────┬─────────────────────┬──────────┐');
  console.log('│ 用户名 │ 邮箱                │ 密码     │');
  console.log('├────────┼─────────────────────┼──────────┤');
  
  await new Promise((resolve, reject) => {
    db.all('SELECT username, email FROM users', (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      rows.forEach(row => {
        const user = newPasswords.find(u => u.username === row.username);
        const password = user ? user.password : '未知';
        console.log(`│ ${row.username.padEnd(6)} │ ${row.email.padEnd(20)} │ ${password.padEnd(8)} │`);
      });
      
      console.log('└────────┴─────────────────────┴──────────┘');
      console.log('\n⚠️ 注意: 以上密码仅用于演示，请在生产环境中使用安全密码');
      
      db.close();
      resolve();
    });
  });
}

resetPasswords();