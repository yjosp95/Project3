/* HEADER ZONE */

var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 5,
  host: 'localhost',
  user: 'root',
  database: 'tutorial',
  password: '960315wjd!'
});

var multer = require('multer');

//////////////////////////////////////////////////////////////////////////////

/* ROUTER ZONE */

/* GET EMPTY URL ==> HOME URL */
router.get('/', function(req, res, next) {
    res.redirect('/sellphone/home');
});
/* END : GET EMPTY URL */

/* GET HOME URL */
router.get('/home', function(req, res, next) {
  pool.getConnection(function(err, connection){

    var sqlForSelectList = 'SELECT idx, creator_id, title, hit FROM board'
    connection.query(sqlForSelectList, function(err, rows){
      if(err) console.log(err);

      res.render('home', {row: rows});
      connection.release();
    });
  });
});
/* END : GET HOME URL */


/* --------------- JYH --------------- */
router.get('/login', function(req, res, next) {
  res.render('login');
  connection.release();
});

router.get('/joinform', function(req, res, next) {
  res.render('joinform');
  connection.release();
});

router.post('/joinform', function(req, res, next) {

  var customer_id = req.body.customer_id;
  var customer_pw = req.body.customer_pw;
  var customer_email = req.body.customer_email;
  var customer_name = req.body.customer_name;
  var customer_address = req.body.customer_address;
  var customer_phone = req.body.customer_phone;

  var datas = [customer_id, customer_pw, customer_email, customer_name ,customer_address, customer_phone];

  pool.getConnection(function(err, connection){
      var sqlForInsertBoard = "select * FROM tutorial.joinform WHERE customer_id=?";
      connection.query(sqlForInsertBoard, [customer_id], function(err, data){

        console.log(data);
        if(data == ""){
          sqlForInsertBoard = "insert into joinform(customer_id, customer_pw, customer_email, customer_name ,customer_address, customer_phone) values(?,?,?,?,?,?)";
          connection.query(sqlForInsertBoard, datas, function(err, rows){
              if(err) console.log(err);
              console.log(JSON.stringify(rows));
              res.render('OK');
              connection.release();
          });
        }

        else{
          res.write("<script language=\"javascript\">alert('This ID is already in use!')</script>");
          res.write("<script language=\"javascript\">window.location=\"joinform\"</script>");
        }
      });
    });
  });

router.get('/OK', function(req, res, next) {
  res.render('OK');
  connection.release();
});
/* --------------- JYH --------------- */








module.exports = router;
