const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql');

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

  // const adminData = {
  //   email: 'namvip0105@gmail.com',
  //   password: '123456',
  //   role: 'admin',
  // };

  // const query = 'INSERT INTO admin SET ?';

  // connection.query(query, adminData, (error, results, fields) => {
  //   if (error) throw error;
  //   console.log('Inserted ' + results.affectedRows + ' rows');
  // });

  const results = [];

  fs.createReadStream('/Books_info.csv.csv')
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      console.log(results[0]);
    });
  // const query = 'INSERT INTO books (column1, column2, column3) VALUES ?'; // Thay column1, column2, column3 bằng tên cột trong bảng books của bạn
  // const values = results.map((row) => [row.column1, row.column2, row.column3]); // Thay column1, column2, column3 tương ứng

  // connection.query(query, [values], (error, results, fields) => {
  //   if (error) throw error;
  //   console.log('Inserted ' + results.affectedRows + ' rows');
  // });

  // connection.end();
});

// const results = [];

// fs.createReadStream('path/to/your/file.csv')
//   .pipe(csv())
//   .on('data', (data) => {
//     results.push(data);
//   })
//   .on('end', () => {
//     const query = 'INSERT INTO books (column1, column2, column3) VALUES ?'; // Thay column1, column2, column3 bằng tên cột trong bảng books của bạn
//     const values = results.map((row) => [row.column1, row.column2, row.column3]); // Thay column1, column2, column3 tương ứng

//     connection.query(query, [values], (error, results, fields) => {
//       if (error) throw error;
//       console.log('Inserted ' + results.affectedRows + ' rows');
//     });

//     connection.end();
//   });
