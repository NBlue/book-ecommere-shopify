const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'nblue', // Thay username bằng thông tin đăng nhập của bạn
  password: '123456', // Thay password bằng mật khẩu của bạn
  database: 'library_management', // Thay database_name bằng tên database của bạn
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to database: ', error);
    return;
  }

  console.log('Connected to database');

  const query = 'SELECT * FROM reviews';

  connection.query(query, (error, results) => {
    if (error) throw error;
    console.log('RESULTS', results);
  });
});
