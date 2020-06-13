/* HEADER ZONE */

var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit: 5,
  host: 'localhost',
  user: 'root',
  database: 'tutorial',
  password: ''
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

var idx_page = req.query.page;
idx_page = Math.round(idx_page);

if(isNaN(idx_page))
  idx_page = 1;

console.log('test : ' + idx_page);

pool.getConnection(function(err, connection){

  var sqlForSelectList = 'SELECT product_title, product_price, product_manufacturer FROM product_list'
  connection.query(sqlForSelectList, function(err, rows){
    if(err) console.log(err);

    var num_product = rows.length;
    var num_page = Math.ceil(num_product / 9);

    if(idx_page > num_page)
      idx_page = 1;

    // Make Product List
    var html_product = `<div class="row">\n`;
    var i_start = 9 * (idx_page-1);
    var i_end = i_start;

    if(num_product-9 > i_start)
      i_end = i_end + 9;
    else
      i_end = i_end + num_product - i_start;

    var i = i_start;

    while(i < i_end)
    {
      html_product = html_product + 
      ` <!-- product -->
        <div class="col-md-4 col-xs-6">
          <div class="product">
            <div class="product-img">
              <img src="/electro/img/product01.png" alt="">
              <div class="product-label">`;

                //<span class="sale">SAFETY</span>
                //<span class="new">NEW</span>

      html_product = html_product + `
              </div>
            </div>
            <div class="product-body">
              <p class="product-category">${rows[i].product_manufacturer}</p>
              <h3 class="product-name"><a href="#">${rows[i].product_title}</a></h3>
              <h4 class="product-price">${rows[i].product_price}원</h4>
            </div>
            <div class="add-to-cart">
              <button class="add-to-cart-btn"><i class="fa fa-shopping-cart"></i>찜하기</button>
            </div>
          </div>
        </div>
        <!-- /product -->`;
      
      gap = i_start - i;

      if(gap > 0)
      {
        if(gap % 6 == 0)
          html_product = html_product + `<div class="clearfix visible-lg visible-md visible-sm visible-xs"></div>`;
        else if(gap % 3 == 0)
          html_product = html_product + `<div class="clearfix visible-lg visible-md"></div>`;
        else if(gap % 2 == 0)
          html_product = html_product + `<div class="clearfix visible-sm visible-xs"></div>`;
      }

      i++;
    }

    html_product = html_product + `</div>`;

    if(idx_page > 2)
    {
      var html_page = ` <li><a href="/sellphone/home/?page=${idx_page-2}">${idx_page-2}</a></li>
                        <li><a href=/sellphone/home/?page=${idx_page-1}#">${idx_page-1}</a></li>
                        <li class="active">${idx_page}</li>`;

      if(num_page >= idx_page+1)
      {
        html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+1}">${idx_page+1}</a></li>`;

        if(num_page >= idx_page+2)
          html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+2}">${idx_page+2}</a></li>`;
      }
    }
    else
    {
      if(idx_page == 1)
      {
        var html_page = ` <li class="active">1</li>`;
        console.log(html_page);

        if(num_page >= idx_page+1)
        {
          html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+1}">${idx_page+1}</a></li>`;

          if(num_page >= idx_page+2)
            html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+2}">${idx_page+2}</a></li>`;

          if(num_page >= idx_page+3)
            html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+3}">${idx_page+3}</a></li>`;

          if(num_page >= idx_page+4)
            html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+4}">${idx_page+4}</a></li>`;
        }
      }
      else
      {
        var html_page = ` 
                        <li><a href="/sellphone/home/?page=1">1</a></li>
                        <li class="active">2</li>`;
                        
        if(num_page >= idx_page+1)
        {
          html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+1}">${idx_page+1}</a></li>`;

          if(num_page >= idx_page+2)
            html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+2}">${idx_page+2}</a></li>`;

          if(num_page >= idx_page+3)
            html_page = html_page + `<li><a href="/sellphone/home/?page=${idx_page+3}">${idx_page+3}</a></li>`;
        }
      }
    }

    res.render('home', {product: html_product, page: html_page, idx: idx_page});
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

router.post('/login', function(req, res, next) {

  var customer_id = req.body.customer_id;
  var customer_pw = req.body.customer_pw;

  var datas = [customer_id, customer_pw];

  pool.getConnection(function(err, connection){
      var sqlForInsertBoard = "select * FROM tutorial.joinform WHERE customer_id=? AND customer_pw=?";
      connection.query(sqlForInsertBoard, datas, function(err, data){

        console.log(data);
        if(data == ""){ //아이디가 없는 경우
          res.write("<script language=\"javascript\">alert('The ID does not exist or the password is incorrect!')</script>");
          res.write("<script language=\"javascript\">window.location=\"login\"</script>");
        }

        else{ //아이디가 있는 경우
           // 쿠키 설정
          res.cookie("user", customer_id , { // user는 쿠키이름, 뒤에는 쿠키값
            expires: new Date(Date.now() + 900000),
            httpOnly: true
          });
          res.redirect('/sellphone/home');
          connection.release();
        }
      });
    });
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
