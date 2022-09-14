const mysql = require('mysql');

const db = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE
});

db.connect();

console.log("conexion creada")

db.query(`USE ${process.env.DB_DATABASE}`, function(err, rows, fields) {
  if (err) throw err;
});

const query = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params,
      (err, rows, fields) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
}

module.exports = {
  db,
  query
};

// db.end();