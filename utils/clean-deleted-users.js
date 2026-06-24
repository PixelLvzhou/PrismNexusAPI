const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('Connected to SQLite database\n');

db.all(`SELECT id, username, email, deleted_at FROM users WHERE deleted_at IS NOT NULL`, (err, deletedUsers) => {
  if (err) {
    console.error('Error querying deleted users:', err.message);
    db.close();
    return;
  }

  console.log('即将删除的已删除账户:');
  console.log('='.repeat(60));
  console.log('ID  | 用户名 | 邮箱');
  console.log('='.repeat(60));
  deletedUsers.forEach(user => {
    console.log(`${user.id.toString().padEnd(3)} | ${user.username.padEnd(6)} | ${user.email}`);
  });
  console.log('='.repeat(60));
  console.log(`共 ${deletedUsers.length} 个账户待删除\n`);

  db.run(`DELETE FROM users WHERE deleted_at IS NOT NULL`, function(err) {
    if (err) {
      console.error('Error deleting users:', err.message);
      db.close();
      return;
    }

    console.log(`成功删除 ${this.changes} 个已删除账户\n`);

    db.all(`SELECT id, username, email, status, created_at FROM users ORDER BY id`, (err, activeUsers) => {
      if (err) {
        console.error('Error querying active users:', err.message);
        db.close();
        return;
      }

      console.log('剩余可登录账户列表:');
      console.log('='.repeat(70));
      console.log('ID  | 用户名 | 邮箱 | 状态 | 创建时间');
      console.log('='.repeat(70));
      activeUsers.forEach(user => {
        console.log(`${user.id.toString().padEnd(3)} | ${user.username.padEnd(6)} | ${user.email.padEnd(20)} | ${user.status.padEnd(6)} | ${user.created_at}`);
      });
      console.log('='.repeat(70));
      console.log(`\n提示: 密码采用 bcrypt 加密存储，无法直接查看明文密码`);
      console.log(`如需重置密码，请使用 /api/auth/reset-password 接口`);

      db.close();
    });
  });
});