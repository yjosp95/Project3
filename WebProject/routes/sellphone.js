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

    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, user_row){
    
      var sqlForSelectList = 'SELECT * FROM product_list ORDER BY product_id DESC'
      connection.query(sqlForSelectList, function(err, rows){
        if(err) console.log(err);

        var num_product = rows.length;
        var num_page = Math.ceil(num_product / 6);

        if(idx_page > num_page)
          idx_page = 1;

        // Make Product List
        var html_product = `<div class="row">\n`;
        var i_start = 6 * (idx_page-1);
        var i_end = i_start;

        if(num_product-6 > i_start)
          i_end = i_end + 6;
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
                  <a href="/read/${rows[i].product_id}"><img src="/electro/img/${rows[i].product_img1}" alt="" height="350" width="350"></a>
                  <div class="product-label"><span class="sale">SAFETY</span></div>
                </div>`;

                    //<span class="sale">SAFETY</span>
                    //<span class="new">NEW</span>

          html_product = html_product + `
                <div class="product-body">
                  <p class="product-category">${rows[i].product_manufacturer}</p>
                  <h3 class="product-name"><a href="/read/${rows[i].product_id}">${rows[i].product_title}</a></h3>
                  <h4 class="product-price">${rows[i].product_price}원</h4>
                </div>
                <div class="add-to-cart">
                <form action="/payment/${rows[i].product_id}" method="get">
                  <button class="add-to-cart-btn" type="submit"><i class="fa fa-shopping-cart"></i>구매하기</button>
                </form>
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

        res.render('home', {user: user_row, product: html_product, page: html_page, idx: idx_page});
        connection.release();
      });
    });
  });
});
/* END : GET HOME URL */

/* GET SEARCH URL */
router.get('/search', function(req, res, next) {

  console.log(req.url);

  var search_target = req.query.q;
  var idx_page = req.query.page;
  idx_page = Math.ceil(idx_page);
  var search_category = req.query.category;
  var search_order = req.query.order;

  var sqlForSelectList = `SELECT * FROM product_list WHERE product_title LIKE \'%${search_target}%\'`;

  if(req.query.category != 'ALL')
    sqlForSelectList += ` AND product_manufacturer LIKE \'%${search_category}%\'`;


  var html_sort;

  if(search_order == 'date')
  {
    sqlForSelectList += ` ORDER BY product_id DESC`;

    html_sort = `
    <div style="text-align: right;"><select name="jump" onchange="location.href=this.value">
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=date">최신순</option>
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=hit">조회순</option>
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=wish">찜순</option>
    </select></div>
    `;
  }
  else if(search_order == 'wish')
  {
    sqlForSelectList += ` ORDER BY product_interest DESC`;

    html_sort = `
    <div style="text-align: right;"><select name="jump" onchange="location.href=this.value">
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=wish">찜순</option>
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=date">최신순</option>
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=hit">조회순</option>
    </select></div>
    `;
  }
  else if(search_order == 'hit')
  {
    sqlForSelectList += ` ORDER BY product_hit DESC`;

    html_sort = `
    <div style="text-align: right;"><select name="jump" onchange="location.href=this.value">
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=hit">조회순</option>
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=date">최신순</option>
      <option value="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=wish">찜순</option>
    </select></div>
    `;
  }

  console.log(sqlForSelectList);

    pool.getConnection(function(err, connection){

      var sqlForUserList = "select * FROM tutorial.joinform WHERE customer_id=?";
      connection.query(sqlForUserList, req.cookies.user, function(err, user_row){
      
        connection.query(sqlForSelectList, function(err, rows){
          if(err) console.log(err);
  
          var num_product = rows.length;
          var num_page = Math.ceil(num_product / 6);
  
          if(idx_page > num_page)
            idx_page = 1;
  
          // Make Product List
          var html_product = `<div class="row">\n`;
          var i_start = 6 * (idx_page-1);
          var i_end = i_start;
  
          if(num_product-6 > i_start)
            i_end = i_end + 6;
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
                    <a href="/read/${rows[i].product_id}"><img src="/electro/img/${rows[i].product_img1}" alt="" height="350" width="350"></a>
                    <div class="product-label"><span class="sale">SAFETY</span>`;
  
                      //<span class="sale">SAFETY</span>
                      //<span class="new">NEW</span>
  
            html_product = html_product + `
                    </div>
                  </div>
                  <div class="product-body">
                    <p class="product-category">${rows[i].product_manufacturer}</p>
                    <h3 class="product-name"><a href="/read/${rows[i].product_id}">${rows[i].product_title}</a></h3>
                    <h4 class="product-price">${rows[i].product_price}원</h4>
                  </div>
                  <div class="add-to-cart">
                    <form action="/payment/${rows[i].product_id}" method="get">
                      <button class="add-to-cart-btn" type="submit"><i class="fa fa-shopping-cart"></i>구매하기</button>
                    </form>
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
            var html_page = ` <li><a href="/sellphone/search/?q=${search_target}&page=${idx_page-2}&category=${search_category}&order=${search_order}">${idx_page-2}</a></li>
                              <li><a href=/sellphone/search/?q=${search_target}&page=${idx_page-1}&category=${search_category}&order=${search_order}">${idx_page-1}</a></li>
                              <li class="active">${idx_page}</li>`;
  
            if(num_page >= idx_page+1)
            {
              html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+1}&category=${search_category}&order=${search_order}">${idx_page+1}</a></li>`;
  
              if(num_page >= idx_page+2)
                html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+2}&category=${search_category}&order=${search_order}">${idx_page+2}</a></li>`;
            }
          }
          else
          {
            if(idx_page == 1)
            {
              var html_page = ` <li class="active">1</li>`;
              console.log(idx_page);
              console.log(num_page);
  
              if(num_page >= idx_page+1)
              {
                html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+1}&category=${search_category}&order=${search_order}">${idx_page+1}</a></li>`;
  
                if(num_page >= idx_page+2)
                  html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+2}&category=${search_category}&order=${search_order}">${idx_page+2}</a></li>`;
  
                if(num_page >= idx_page+3)
                  html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+3}&category=${search_category}&order=${search_order}">${idx_page+3}</a></li>`;
  
                if(num_page >= idx_page+4)
                  html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+4}&category=${search_category}&order=${search_order}">${idx_page+4}</a></li>`;
              }
            }
            else
            {
              var html_page = ` 
                              <li><a href="/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=${search_order}">1</a></li>
                              <li class="active">2</li>`;
                              
              if(num_page >= idx_page+1)
              {
                html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+1}&category=${search_category}&order=${search_order}">${idx_page+1}</a></li>`;
  
                if(num_page >= idx_page+2)
                  html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+2}&category=${search_category}&order=${search_order}">${idx_page+2}</a></li>`;
  
                if(num_page >= idx_page+3)
                  html_page = html_page + `<li><a href="/sellphone/search/?q=${search_target}&page=${idx_page+3}&category=${search_category}&order=${search_order}">${idx_page+3}</a></li>`;
              }
            }
          }
  
          console.log(html_page);
          res.render('search', {user: user_row, product: html_product, page: html_page, idx: idx_page, category:search_category, keyword: search_target, sort: html_sort});
          connection.release();
        });
      });
    });
});
/* END : GET SEARCH URL */

/* POST SEARCH URL */
router.post('/search', function(req, res, next) {
  var search_target = req.body.target;
  var search_category = req.body.category;

  res.redirect(`/sellphone/search/?q=${search_target}&page=1&category=${search_category}&order=date`);
  connection.release();
});
/* END : POST SEARCH URL */

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
        else if(data[0].customer_kind==2){
          res.write("<script language=\"javascript\">alert('Your ID is currently suspended, please contact the administrator.')</script>");
          res.write("<script language=\"javascript\">window.location=\"login\"</script>");
        }

        else{ //아이디가 있는 경우
           // 쿠키 설정
          res.cookie("user", customer_id , { // user는 쿠키이름, 뒤에는 쿠키값
            expires: new Date(Date.now() + 900000),
            httpOnly: true
          });
          //if(req.cookies) console.log("@@@@@@"+req.cookies);
          res.redirect('/sellphone/home');
          connection.release();
        }
      });
    });
  });

router.post('/login_n', function(req, res, next) {

    var customer_id = req.body.customer_id;
    var datas = [customer_id];

    pool.getConnection(function(err, connection){
        var sqlForInsertBoard = "select * FROM tutorial.joinform WHERE customer_id=?";
        connection.query(sqlForInsertBoard, datas, function(err, data){

          console.log(data);
          if(data == ""){ //아이디가 없는 경우
            res.write("<script language=\"javascript\">alert('The ID does not exist!')</script>");
            res.write("<script language=\"javascript\">window.location=\"login\"</script>");
          }

          else{ //아이디가 있는 경우
             // 쿠키 설정
            res.cookie("user", customer_id , { // user는 쿠키이름, 뒤에는 쿠키값
              expires: new Date(Date.now() + 900000),
              httpOnly: true
            });
            //if(req.cookies) console.log("@@@@@@"+req.cookies);
            res.redirect('/sellphone/home');
            connection.release();
          }
        });
      });
    });

///////////////////////// logout
router.post('/logout', function(req, res, next) {
  res.clearCookie("user");
  res.write("<script language=\"javascript\">alert('Success logout. Thank you!')</script>");
  res.write("<script language=\"javascript\">window.location=\"home\"</script>");
  //res.redirect('/home');
});
////////////////////////

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
              res.write("<script language=\"javascript\">alert('Complete!!')</script>");
              res.write("<script language=\"javascript\">window.location=\"login\"</script>");
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

  router.post('/OK', function(req, res, next) {
    res.render('home');
    connection.release();
  });

router.get('/mypage', function(req, res, next) {
  pool.getConnection(function(err, connection){
/* ---------- simple my information ---------- */
    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

      /* ---------- my deal list ---------- */
      sqlForSelectList = "select * FROM tutorial.deal_list WHERE deal_buyer=?"; //구매이력 정보
      connection.query(sqlForSelectList,req.cookies.user, function(err, rows2){
        if(err) console.log(err);

        sqlForSelectList = "select * FROM tutorial.deal_list WHERE deal_seller=?"; //판매이력 정보
        connection.query(sqlForSelectList,req.cookies.user, function(err, rows3){
          if(err) console.log(err);

          sqlForSelectList = "select * FROM tutorial.interest_list WHERE interest_customer=?"; //찜 정보
          connection.query(sqlForSelectList,req.cookies.user, function(err, rows4){
            if(err) console.log(err);

            sqlForSelectList = "select * FROM tutorial.product_list WHERE product_saler=?"; //찜 정보
            connection.query(sqlForSelectList,req.cookies.user, function(err, rows5){

              if(rows2=="") rows2=null;
              if(rows3=="") rows3=null;
              if(rows4=="") rows4=null;
              if(rows5=="") rows5=null;

              res.render('mypage', {user: rows, buy: rows2, sell: rows3, inter: rows4, state: rows5});
              connection.release();
  //////////////////////////////////////////////////////////////////////////////////
            });
          });
        });
      });
    });
    /* ---------- simple my information ---------- */
  });
});

router.get('/mypage/update', function(req, res, next) {
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

      res.render('mypage_update', {user: rows});
      connection.release();
    });
  });
});

router.post('/mypage/update', function(req, res, next) {
  pool.getConnection(function(err, connection){
    var pw = req.body.customer_pw;
    var email = req.body.customer_email;
    var name = req.body.customer_name;
    var address = req.body.customer_address;
    var phone = req.body.customer_phone;

    var datas=[pw,email,name,address,phone,req.cookies.user];

    var sqlForSelectList = "update tutorial.joinform set customer_pw=?, customer_email=?, customer_name=?, customer_address=?, customer_phone=? where customer_id=?";
    connection.query(sqlForSelectList,datas, function(err, rows){
      if(err) console.log(err);
      res.redirect('/sellphone/mypage');
      connection.release();
    });
  });
});

router.get('/charge/:customer_id', function(req, res, next) {
  var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

        res.render('charge', {user: rows});
        connection.release();

    });
  });
});

router.post('/charge/:customer_id', function(req, res, next) {
  var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList2 = "update tutorial.joinform set customer_wallet=? where customer_id=?";
      connection.query(sqlForSelectList2,[parseInt(rows[0].customer_wallet,10)+parseInt(req.body.product_wallet,10),req.cookies.user], function(err, rows){
        if(err) console.log(err);
        res.write("<script language=\"javascript\">alert('Charge Success!!')</script>");
        res.write("<script language=\"javascript\">window.location=history.go(-2)</script>");
       // res.write("<script language=\"javascript\">window.location.href = document.referrer</script>");
        //res.redirect('/home');
        // history.back()
        connection.release();
      });
    });
  });
});

router.get('/sell', function(req, res, next) {
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      res.render('sell', {user: rows});
      connection.release();
    });
  });
});
router.post('/sell', upload.fields([{ name: 'img1' }, { name: 'img2' }, { name: 'img3' }]), function(req, res, next) {
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      //console.log(req.files.img1);
      if(err) console.log(err);
      var product_saler = rows[0].customer_id;
      var product_manufacturer = req.body.manufacturer;
      var product_title = req.body.product_name;
      var product_description = req.body.product_info;
      var product_price = req.body.price;
      var product_status = req.body.status;
      var product_trade_facetoface = req.body.trade_facetoface;
      var product_trade_point = req.body.trade_point;
      var product_date = new Date().toISOString().substr(0, 10).replace('T', ' ');
      var product_locate = rows[0].customer_address;
      var product_state = "판매 중";
      var product_color = req.body.product_color;
      var product_storage = req.body.product_storage;
      var img1;
      var img2;
      var img3;
      if(req.files.img1 == null) img1=null;
      else img1=req.files.img1[0].filename;
      if(req.files.img2 == null) img2=null;
      else img2=req.files.img2[0].filename;
      if(req.files.img3 == null) img3=null;
      else img3=req.files.img3[0].filename;
      var datas = [product_saler, product_manufacturer, product_title, product_description, product_price, product_status, product_trade_facetoface, product_trade_point, product_date, product_locate,product_color,product_storage,img1,img2,img3, product_state];
      var sqlForSelectList2 ="INSERT INTO tutorial.Product_list(product_saler, product_manufacturer, product_title, product_description ,product_price, product_status,product_trade_facetoface,product_trade_point,product_date,product_locate,product_color,product_storage,product_img1,product_img2,product_img3,product_state) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
      connection.query(sqlForSelectList2,datas,function(err,rowss){
        console.log(req.files.img1[0].filename);
        console.log(datas);
        if(err) console.log(err);
        console.log("rows : " + JSON.stringify(rowss));

        var sqlForSelectList3 ="select * FROM tutorial.product_list WHERE product_img1 = ?";
        connection.query(sqlForSelectList3,img1,function(err,rowsss){
          // console.log(datass);
          if(err) console.log(err);
          // var deal_seller = rows[0].customer_id;
          // var deal_buyer = '-';
          // var deal_address = '-';
          // var deal_name = '-';
          // var deal_phone = '-';
          // var deal_couier = '-';
          // var deal_img1 = img1;
          // var deal_title = req.body.product_name;
          // var deal_price = req.body.price;
          // var deal_tracking_nunber = '-';
          // var deal_product = rowsss[0].product_id;
          // var deal_date = '-';
          // var datass = [deal_seller, deal_buyer, deal_address, deal_name ,deal_phone, deal_couier,deal_img1,deal_title,deal_price,deal_tracking_nunber,deal_product,deal_date];
          // var sqlForSelectList4 ="INSERT INTO tutorial.deal_list(deal_seller, deal_buyer, deal_address, deal_name ,deal_phone, deal_couier,deal_img1,deal_title,deal_price,deal_tracking_nunber,deal_product,deal_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
          // connection.query(sqlForSelectList4,datass,function(err,rowssss){
          //   console.log(datass);
          //   if(err) console.log(err);
          //   console.log("rows : " + JSON.stringify(rowssss));
            if(product_title != null) res.redirect('home');
            connection.release();
          // });
        });
      });
    });
  });
});
// 글조회
router.get('/read/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList2 = "select * from tutorial.product_list where product_id=?";
      connection.query(sqlForSelectList2,product_id,function(err, rowss){
       // console.log("#######"+(rowss[0].product_hit + 1));
        if(err) console.error(err);
        var sqlForSelectList3 = "update tutorial.product_list set product_hit = ? where product_id=?";
        connection.query(sqlForSelectList3,[rowss[0].product_hit + 1,product_id],function(err,rowsss){
        //  console.log("@@@@@@@@@"+rowss[0].product_hit + 1);
          if(err) console.error(err);
          var sqlForSelectList4 = "select * from tutorial.question_list where question_product=?";
          connection.query(sqlForSelectList4,product_id,function(err,rowssss){
            if(err) console.error(err);
            var sqlForSelectList5 = "select * from tutorial.answer_list";
            connection.query(sqlForSelectList5,product_id,function(err,rowsssss){
              if(err) console.error(err);
            //  console.log(rowsssss);
              var sqlForSelectList6 = "select * from tutorial.interest_list where interest_customer=?";
              connection.query(sqlForSelectList6,req.cookies.user,function(err,rowssssss){
                if(err) console.error(err);
             //   console.log(rowssssss);
                var sqlForSelectList7 = "select * from tutorial.review_list where review_saler=?";
                connection.query(sqlForSelectList7,rowss[0].product_saler,function(err,rowsssssss){
                  if(err) console.error(err);
                  //console.log(rowsssssss[0].review_creator);
                  var sqlForSelectList8 = "select * from tutorial.joinform where customer_id=?";
                  connection.query(sqlForSelectList8,rowss[0].product_saler,function(err,rowssssssss){
                    if(err) console.error(err);
                    console.log(rowssssssss[0]);
                    var sqlForSelectList9 = "select * from tutorial.deal_list where deal_product=?";
                    connection.query(sqlForSelectList9,rowss[0].product_id,function(err,rowsssssssss){
                      if(err) console.error(err);
                      console.log(rowsssssssss[0]);
                      res.render('read', {user: rows, row: rowss[0], question: rowssss, answer: rowsssss, interest:rowssssss, review:rowsssssss,saler:rowssssssss,deal:rowsssssssss});
                      connection.release();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// 사이트 소개
router.get('/intro', function(req, res, next) {
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

      res.render('intro', {user: rows});
      connection.release();
    });
  });
});

router.get('/ask', function(req, res, next) {
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id=?";
    connection.query(sqlForSelectList, req.cookies.user ,function(err, rows){
      if(err) console.log(err);
      res.render('ask', {user: rows});
      connection.release();
    });
  });
});

router.get('/ask_read/:ask_id', function(req, res, next) {
  var ask_id = req.params.ask_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id=?";
    connection.query(sqlForSelectList, req.cookies.user ,function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList2 = "select * FROM tutorial.ask_list where ask_id=?";
      connection.query(sqlForSelectList2, ask_id ,function(err, rowss){
        if(err) console.log(err);
        res.render('ask_read', {user: rows, ask:rowss});
        connection.release();
      });
    });
  });
});

router.post('/ask_read/:ask_id', function(req, res, next) {
  var ask_id = req.params.ask_id;
  console.log("!!!!!!!!!!!!!");
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id=?";
    connection.query(sqlForSelectList, req.cookies.user ,function(err, rows){
      if(err) console.log(err);
      var ask_answer =req.body.ask_answer;
      var ask_adate = new Date().toISOString().substr(0, 19).replace('T', ' ');
      console.log([ask_answer,ask_adate,'답변 완료',ask_id]);
      var sqlForSelectList2 = "update tutorial.ask_list set ask_answer=?, ask_adate=?, ask_state=? where ask_id=?";
      connection.query(sqlForSelectList2, [ask_answer,ask_adate,'답변 완료',ask_id] ,function(err, rowss){
        if(err) console.log(err);
        res.redirect('/sellphone/ask_read/'+ask_id);
        connection.release();
      });
    });
  });
});

router.post('/ask', function(req, res, next) {
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id=?";
    connection.query(sqlForSelectList, req.cookies.user ,function(err, rows){
      if(err) console.log(err);
      var ask_question = req.body.ask_question;
      var ask_customer = req.cookies.user;
      var ask_state = '답변대기';
      var ask_answer = '';
      var ask_qdate =  new Date().toISOString().substr(0, 19).replace('T', ' ');
      var ask_adate = '';
      var datas = [ask_question,ask_customer,ask_state,ask_answer,ask_qdate,ask_adate];
      var sqlForSelectList2 = "INSERT INTO tutorial.ask_list(ask_question,ask_customer,ask_state,ask_answer,ask_qdate,ask_adate) VALUES (?,?,?,?,?,?)";
      connection.query(sqlForSelectList2, datas ,function(err, rowss){
        if(err) console.log(err);
        console.log(datas);
        res.redirect('/sellphone/ask_list');
        connection.release();
      });
    });
  });
});

router.get('/ask_list', function(req, res, next) {
  // var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList = "select * FROM tutorial.ask_list";
      connection.query(sqlForSelectList, function(err, rowss){
        if(err) console.log(err);
        res.render('ask_list', {user: rows, ask:rowss});
        connection.release();
      });
    });
  });
});

router.post('/read_delete/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "delete FROM tutorial.product_list where product_id =?";
    connection.query(sqlForSelectList,product_id, function(err, rows){
      if(err) console.log(err);

        res.redirect('/home');
        connection.release();

    });
  });
});

router.get('/read_update/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

      var sqlForSelectList2 = "select * FROM tutorial.product_list where product_id =?";
      connection.query(sqlForSelectList2,product_id, function(err, rowss){
        if(err) console.log(err);
            res.render('read_update', {user: rows, product:rowss});
            connection.release();
      });
    });
  });
});

router.post('/read_update/:product_id',upload.fields([{ name: 'img1' }, { name: 'img2' }, { name: 'img3' }]), function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

      var sqlForSelectList2 = "select * FROM tutorial.product_list where product_id =?";
      connection.query(sqlForSelectList2,product_id, function(err, rowss){
        if(err) console.log(err);
        var product_manufacturer = req.body.manufacturer;
        var product_title = req.body.product_name;
        var product_description = req.body.product_info;
        var product_price = req.body.price;
        var product_status = req.body.status;
        var product_trade_facetoface = req.body.trade_facetoface;
        var product_trade_point = req.body.trade_point;
        var product_date = new Date().toISOString().substr(0, 10).replace('T', ' ');
        var product_color = req.body.product_color;
        var product_storage = req.body.product_storage;
        var img1=null;//rowss[0].product_img1;
        var img2=null;//rowss[0].product_img2;
        var img3=null;//rowss[0].product_img3;
        console.log("!!!!!!!!!!");
        // console.log(req.body);
        if(req.files.img1 == null) img1=rowss[0].product_img1;
        else img1=req.files.img1[0].filename;
        if(req.files.img2 == null) img2=rowss[0].product_img2;
        else img2=req.files.img2[0].filename;
        if(req.files.img3 == null) img3=rowss[0].product_img3;
        else img3=req.files.img3[0].filename;
        var datas = [product_manufacturer, product_title, product_description, product_price, product_status, product_trade_facetoface, product_trade_point, product_date, product_color,product_storage,img1,img2,img3,product_id];
        var sqlForSelectList3 = "update tutorial.product_list set product_manufacturer=?, product_title=?, product_description=?, product_price=?, product_status=?, product_trade_facetoface=?, product_trade_point=?, product_date=?, product_color=?,product_storage=?,product_img1=?,product_img2=?,product_img3=? where product_id=?";
        connection.query(sqlForSelectList3,datas, function(err, rowsss){
          if(err) console.log(err);
            res.redirect('/sellphone/read/'+product_id);
            connection.release();
        });
      });
    });
  });
});

router.get('/announcement', function(req, res, next) {
  // var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList2 = "select * FROM tutorial.notice_list";
      connection.query(sqlForSelectList2, function(err, rowss){
        if(err) console.log(err);
          res.render('announcement', {user: rows, notice:rowss});
          connection.release();
      });
    });
  });
});

router.get('/announcement_write', function(req, res, next) {
  // var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList = "select * FROM tutorial.notice_list";
      connection.query(sqlForSelectList, function(err, rowss){
        if(err) console.log(err);
          res.render('announcement_write', {user: rows, notice:rowss});
          connection.release();
      });
    });
  });
});

router.post('/announcement_write', function(req, res, next) {
  // var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var notice_title = req.body.notice_title;
      var notice_content = req.body.notice_content;
      var notice_date = new Date().toISOString().substr(0, 10).replace('T', ' ');
      var datas=[notice_title,notice_content,notice_date];
      console.log(datas);
      var sqlForSelectList = "INSERT INTO tutorial.notice_list(notice_title,notice_content,notice_date) VALUES (?,?,?)";
      connection.query(sqlForSelectList,datas, function(err, rowss){
        if(err) console.log(err);
          res.redirect('announcement');
          connection.release();
      });
    });
  });
});

router.get('/announcement_read/:notice_id', function(req, res, next) {
  var notice_id = req.params.notice_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList2 = "select * FROM tutorial.notice_list where notice_id =?";
      connection.query(sqlForSelectList2,notice_id, function(err, rowss){
        if(err) console.log(err);
        res.render('announcement_read', {user: rows, notice:rowss});
        connection.release();
      });
    });
  });
});

router.get('/payment/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectLis2 = "select * FROM tutorial.product_list where product_id =?";
      connection.query(sqlForSelectLis2,product_id, function(err, rowss){
        if(err) console.log(err);
          res.render('payment', {user: rows, product:rowss});
          connection.release();
      });
    });
  });
});

router.post('/payment/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectLis2 = "select * FROM tutorial.product_list where product_id =?";
      connection.query(sqlForSelectLis2,product_id, function(err, rowss){
        if(err) console.log(err);
        
          var check = req.body.point;
          var product_trade;
          if(check == null){
            product_trade='직거래';
          }
          else{
            product_trade='포인트거래';
          }
          var sqlForSelectLis4 = "update tutorial.product_list set product_state=?,product_trade=?, product_buyer=? where product_id=?";
          connection.query(sqlForSelectLis4,['거래 중',product_trade,req.cookies.user, product_id], function(err, rowsss){
            if(err) console.log(err);
            var customer_wallet;
            var customer_wait_money;
            if(check==null){
              customer_wallet = rows[0].customer_wallet;
              customer_wait_money = 0;
            }
            else {
              console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
              customer_wallet = parseInt(rows[0].customer_wallet,10) - parseInt(rowss[0].product_price,10);
              customer_wait_money = rowss[0].product_price;
            }
            var sqlForSelectList5 = "update tutorial.joinform set customer_wallet=? where customer_id=?";
            connection.query(sqlForSelectList5,[customer_wallet, req.cookies.user], function(err, rowsss){
              if(err) console.log(err);
              var sqlForSelectList6 = "select * FROM tutorial.joinform where customer_id =?";
              connection.query(sqlForSelectList6,rowss[0].product_saler, function(err, rowssss){
                if(err) console.log(err);
                var sqlForSelectList7 = "update tutorial.joinform set customer_wait_money=? where customer_id=?";
                connection.query(sqlForSelectList7,[parseInt(rowssss[0].customer_wait_money,10)+parseInt(customer_wait_money,10), rowss[0].product_saler], function(err, rowsss){
                  if(err) console.log(err);
                    res.redirect('/sellphone/read/'+product_id);
                    connection.release();
                });
              });
            });
          });
    
      });
    });
  });
});

router.post('/trade/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectLis2 = "select * FROM tutorial.product_list where product_id =?";
      connection.query(sqlForSelectLis2,product_id, function(err, rowss){
        if(err) console.log(err);
        var sqlForSelectList3 ="select * FROM tutorial.joinform where customer_id =?";
        connection.query(sqlForSelectList3,rowss[0].product_buyer, function(err, rowsss){
          if(err) console.log(err);  
          var deal_buyer = rowsss[0].customer_id;
          var deal_name = rowsss[0].customer_name;
          var deal_phone = rowsss[0].customer_phone;
          var deal_address = rowsss[0].customer_address;
          var deal_date = new Date().toISOString().substr(0, 10).replace('T', ' ');
          var deal_seller = rows[0].customer_id;
          var deal_img1 = rowss[0].product_img1;
          var deal_title = rowss[0].product_title;
          var deal_price = rowss[0].product_price;
          var deal_product = rowss[0].product_id;
          var datas = [deal_seller, deal_buyer, deal_address, deal_name ,deal_phone, deal_img1,deal_title,deal_price,deal_product,deal_date];        
          var sqlForSelectList4 ="INSERT INTO tutorial.deal_list(deal_seller, deal_buyer, deal_address, deal_name ,deal_phone,deal_img1,deal_title,deal_price,deal_product,deal_date) VALUES (?,?,?,?,?,?,?,?,?,?)";
          connection.query(sqlForSelectList4,datas, function(err, rowsss){
            if(err) console.log(err);          
            var sqlForSelectList5 ="update tutorial.product_list set product_state=? where product_id=?";
            connection.query(sqlForSelectList5,['거래 완료',product_id], function(err, rowsss){
              if(err) console.log(err);
              var trade_price;
              if(rowss[0].product_trade == '직거래') {
                trade_price = 0;
              }         
              else {
                trade_price = deal_price;
              }
              var sqlForSelectList6 ="update tutorial.joinform set customer_wallet=?, customer_wait_money=? where customer_id=?";
              connection.query(sqlForSelectList6,[parseInt(rows[0].customer_wallet,10)+parseInt(trade_price,10),parseInt(rows[0].customer_wait_money,10)-parseInt(trade_price,10),req.cookies.user], function(err, rowsss){
                if(err) console.log(err);          
                res.redirect('/sellphone/read/'+product_id);
                connection.release();       
              });         
            });       
          });      
        });
      });
    });
  });
});

router.post('/question/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      console.log("@@@@@@@@@@@@@@@@@@@@@");
      if(err) console.log(err);
      var sqlForSelectList2 = "select * from tutorial.product_list where product_id=?";
      connection.query(sqlForSelectList2,product_id,function(err, rowss){
        console.log("#######"+(rowss[0].product_interest + 1));
        if(err) console.error(err);
        //var question_id
        var question_content = req.body.question;
        var question_product = rowss[0].product_id;
        var question_date = new Date().toISOString().substr(0, 19).replace('T', ' ');
        var question_title = rowss[0].product_title;
        var question_creator = req.cookies.user;
        var question_complite = '답변대기';
        var datas = [question_content,question_product,question_date,question_title,question_creator,question_complite];
        var sqlForSelectList3 = "INSERT INTO tutorial.question_list(question_content,question_product,question_date,question_title,question_creator,question_complite) VALUES (?,?,?,?,?,?)";
        connection.query(sqlForSelectList3,datas,function(err,rowsss){
          console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
          console.log(rowsss);
          if(err) console.error(err);
          var sqlForSelectList4 = "update tutorial.product_list set product_hit=? where product_id=?";
          connection.query(sqlForSelectList4,[rowss[0].product_hit -1,product_id],function(err,rowssss){
            console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
            if(err) console.error(err);
            res.redirect('/sellphone/read/'+product_id);
            connection.release();
          });
        });
      });
    });
  });
});

router.post('/answer/:product_id/:question_id', function(req, res, next) {
  var product_id = req.params.product_id;
  var question_id = req.params.question_id;
  console.log(question_id+product_id);
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      console.log("@@@@@@@@@@@@@@@@@@@@@");
      if(err) console.log(err);
      var sqlForSelectList2 = "select * from tutorial.product_list where product_id=?";
      connection.query(sqlForSelectList2,product_id,function(err, rowss){
        console.log("#######"+(question_id));
        if(err) console.error(err);
        //var question_id
        var answer_content = req.body.answer;
        var answer_target = question_id;
        var answer_answer;
        if(rows[0].customer_kind == 0) answer_answer = rowss[0].product_saler;
        else answer_answer = '관리자';
        var answer_date = new Date().toISOString().substr(0, 19).replace('T', ' ');
        var datas = [answer_content,answer_target,answer_date,answer_answer];
        var sqlForSelectList3 = "INSERT INTO tutorial.answer_list(answer_content,answer_target,answer_date,answer_answer) VALUES (?,?,?,?)";
        connection.query(sqlForSelectList3,datas,function(err,rowsss){
          console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
          console.log(rowsss);
          if(err) console.error(err);
          var sqlForSelectList4 = "update tutorial.product_list set product_hit=? where product_id=?";
          connection.query(sqlForSelectList4,[rowss[0].product_hit -1,rowss[0].product_id],function(err,rowssss){
            console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
            if(err) console.error(err);
            var sqlForSelectList5 = "update tutorial.question_list set question_complite=? where question_id=?";
            connection.query(sqlForSelectList5,['답변완료',question_id],function(err,rowssss){
              console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
              if(err) console.error(err);
              res.redirect('/sellphone/read/'+rowss[0].product_id);
              connection.release();
            });
          });
        });
      });
    });
  });
});

router.post('/interest/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      console.log("@@@@@@@@@@@@@@@@@@@@@");
      if(err) console.log(err);
      var sqlForSelectList2 = "select * from tutorial.product_list where product_id=?";
      connection.query(sqlForSelectList2,product_id,function(err, rowss){
        console.log("#######"+(rowss[0].product_interest + 1));
        if(err) console.error(err);
        var sqlForSelectList3 = "update tutorial.product_list set product_interest = ?, product_hit=? where product_id=?";
        connection.query(sqlForSelectList3,[rowss[0].product_interest + 1,rowss[0].product_hit -1,product_id],function(err,rowsss){
          console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
          if(err) console.error(err);
          var interest_customer = req.cookies.user;
          var interest_saler = rowss[0].product_saler;
          var interest_product = product_id;
          var interest_img1 = rowss[0].product_img1;
          var interest_title = rowss[0].product_title;
          var interest_price = rowss[0].product_price;
          var datas = [interest_customer,interest_saler,interest_product,interest_img1,interest_title,interest_price];
          var sqlForSelectList4 = "INSERT INTO tutorial.interest_list(interest_customer,interest_saler,interest_product,interest_img1,interest_title,interest_price) VALUES (?,?,?,?,?,?)";
          connection.query(sqlForSelectList4,datas,function(err,rowsss){
            console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
            if(err) console.error(err);
            res.redirect('/sellphone/read/'+product_id);
            connection.release();
          });
        });
      });
    });
  });
});

router.post('/delete_interest/:product_id/:interest_id', function(req, res, next) {
  var interest_id = req.params.interest_id;
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      console.log("@@@@@@@@@@@@@@@@@@@@@");
      if(err) console.log(err);
      var sqlForSelectList2 = "select * from tutorial.product_list where product_id=?";
      connection.query(sqlForSelectList2,product_id,function(err, rowss){
        console.log("#######"+(rowss[0].product_interest + 1));
        if(err) console.error(err);
        var sqlForSelectList3 = "update tutorial.product_list set product_interest = ?, product_hit=? where product_id=?";
        connection.query(sqlForSelectList3,[rowss[0].product_interest - 1,rowss[0].product_hit -1,product_id],function(err,rowsss){
          console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
          if(err) console.error(err);
          var sqlForSelectList4 = "delete from tutorial.interest_list where interest_id=?";
          connection.query(sqlForSelectList4,interest_id,function(err,rowsss){
            console.log("$$$$$$$$$$$$$$");
            if(err) console.error(err);
            res.redirect('/sellphone/read/'+product_id);
            connection.release();
          });
        });
      });
    });
  });
});


router.post('/read_delete/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "delete FROM tutorial.product_list where product_id =?";
    connection.query(sqlForSelectList,product_id, function(err, rows){
      if(err) console.log(err);
        res.redirect('/home');
        connection.release();
    });
  });
});

router.get('/read_update/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

      var sqlForSelectList2 = "select * FROM tutorial.product_list where product_id =?";
      connection.query(sqlForSelectList2,product_id, function(err, rowss){
        if(err) console.log(err);
            res.render('read_update', {user: rows, product:rowss});
            connection.release();
      });
    });
  });
});

router.post('/read_update/:product_id',upload.fields([{ name: 'img1' }, { name: 'img2' }, { name: 'img3' }]), function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

      var sqlForSelectList2 = "select * FROM tutorial.product_list where product_id =?";
      connection.query(sqlForSelectList2,product_id, function(err, rowss){
        if(err) console.log(err);
        var product_manufacturer = req.body.manufacturer;
        var product_title = req.body.product_name;
        var product_description = req.body.product_info;
        var product_price = req.body.price;
        var product_status = req.body.status;
        var product_trade_facetoface = req.body.trade_facetoface;
        var product_trade_point = req.body.trade_point;
        var product_date = new Date().toISOString().substr(0, 10).replace('T', ' ');
        var product_color = req.body.product_color;
        var product_storage = req.body.product_storage;
        var img1=null;//rowss[0].product_img1;
        var img2=null;//rowss[0].product_img2;
        var img3=null;//rowss[0].product_img3;
        console.log("!!!!!!!!!!");
        // console.log(req.body);
        if(req.files.img1 == null) img1=rowss[0].product_img1;
        else img1=req.files.img1[0].filename;
        if(req.files.img2 == null) img2=rowss[0].product_img2;
        else img2=req.files.img2[0].filename;
        if(req.files.img3 == null) img3=rowss[0].product_img3;
        else img3=req.files.img3[0].filename;
        var datas = [product_manufacturer, product_title, product_description, product_price, product_status, product_trade_facetoface, product_trade_point, product_date, product_color,product_storage,img1,img2,img3,product_id];
        var sqlForSelectList3 = "update tutorial.product_list set product_manufacturer=?, product_title=?, product_description=?, product_price=?, product_status=?, product_trade_facetoface=?, product_trade_point=?, product_date=?, product_color=?,product_storage=?,product_img1=?,product_img2=?,product_img3=? where product_id=?";
        connection.query(sqlForSelectList3,datas, function(err, rowsss){
          if(err) console.log(err);
            res.redirect('/sellphone/read/'+product_id);
            connection.release();
        });
      });
    });
  });
});

router.get('/member_manage', function(req, res, next) {
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform";
    connection.query(sqlForSelectList, function(err, rows){
      if(err) console.log(err);
      res.render('member_manage', {user: rows});
      connection.release();
    });
  });
});

router.post('/idstop/:customer_id', function(req, res, next) {
  var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id";
    connection.query(sqlForSelectList,customer_id, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList = "update tutorial.joinform set customer_kind=? where customer_id=?";
      connection.query(sqlForSelectList,[2,customer_id], function(err, rows){
        if(err) console.log(err);
        console.log(rows);
        res.redirect('/sellphone/member_manage');
        connection.release();
      });
    });
  });
});

router.post('/stopcancel/:customer_id', function(req, res, next) {
  var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id";
    connection.query(sqlForSelectList,customer_id, function(err, rows){
      if(err) console.log(err);
      var sqlForSelectList = "update tutorial.joinform set customer_kind=? where customer_id=?";
      connection.query(sqlForSelectList,[0,customer_id], function(err, rows){
        if(err) console.log(err);
        console.log(rows);
        res.redirect('/sellphone/member_manage');
        connection.release();
      });
    });
  });
});

router.get('/member_mypage/:customer_id', function(req, res, next) {
  var customer_id = req.params.customer_id;
  pool.getConnection(function(err, connection){

    var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
      if(err) console.log(err);

      var sqlForSelectList = "select * FROM tutorial.joinform where customer_id =?";
      connection.query(sqlForSelectList,customer_id, function(err, rowss){
        if(err) console.log(err);

          res.render('member_mypage', {user: rows, customer:rowss});
          connection.release();

      });

    });
  });
});


router.post('/review/:product_id', function(req, res, next) {
  var product_id = req.params.product_id;
  pool.getConnection(function(err, connection){
    var sqlForSelectList = "select * FROM tutorial.joinform WHERE customer_id=?";
    connection.query(sqlForSelectList,req.cookies.user, function(err, rows){
  //    console.log("@@@@@@@@@@@@@@@@@@@@@");
      if(err) console.log(err);
      var sqlForSelectList2 = "select * from tutorial.product_list where product_id=?";
      connection.query(sqlForSelectList2,product_id,function(err, rowss){
  //      console.log("#######");
        if(err) console.error(err);
        //var question_id
        var review_content = req.body.review_content;
        var review_date = new Date().toISOString().substr(0, 19).replace('T', ' ');
        var review_star = req.body.rating;
        var review_creator = rows[0].customer_id;
        var review_saler = rowss[0].product_saler;
        var review_target = rowss[0].product_title;
        var datas = [review_content,review_date,review_star,review_creator,review_saler,review_target];
  //      console.log(datas);
        var sqlForSelectList3 = "INSERT INTO tutorial.review_list(review_content,review_date,review_star,review_creator,review_saler,review_target) VALUES (?,?,?,?,?,?)";
        connection.query(sqlForSelectList3,datas,function(err,rowsss){
     //     console.log(rowsss);
          if(err) console.error(err);
          var sqlForSelectList4 = "update tutorial.product_list set product_hit=? where product_id=?";
          connection.query(sqlForSelectList4,[rowss[0].product_hit -1,rowss[0].product_id],function(err,rowssss){
        //    console.log("@@@@@@@@@"+rowss[0].product_interest + 1);
            if(err) console.error(err);
            var sqlForSelectList5 = "select * from tutorial.review_list where review_saler=?";
            connection.query(sqlForSelectList5,review_saler,function(err,rowsssss){
              var sqlForSelectList6 = "select * from tutorial.joinform where customer_id=?";
              connection.query(sqlForSelectList6,review_saler,function(err,rowssssss){
                var customer_star1 = rowssssss[0].customer_star1;
                var customer_star2 = rowssssss[0].customer_star2;
                var customer_star3 = rowssssss[0].customer_star3;
                var customer_star4 = rowssssss[0].customer_star4;
                var customer_star5 = rowssssss[0].customer_star5;
                console.log("@@@@@@@@@@@@@@@@"+review_star);
                if(review_star == 1) {customer_star1 = customer_star1 + 1; }
                else if(review_star == 2) {customer_star2 = customer_star2 + 1; }
                else if(review_star == 3) {customer_star3 = customer_star3 + 1; }
                else if(review_star == 4) {customer_star4 = customer_star4 + 1; }
                else if(review_star == 5) {customer_star5 = customer_star5 + 1; }
                var datass = [customer_star1,customer_star2,customer_star3,customer_star4,customer_star5,rowss[0].product_saler];
                var sqlForSelectList7 = "update tutorial.joinform set customer_star1=?,customer_star2=?,customer_star3=?,customer_star4=?,customer_star5=? where customer_id=?";
                connection.query(sqlForSelectList7,datass,function(err,rowsssssss){
                  console.log(datass);
                  if(err) console.error(err);
                  res.redirect('/sellphone/read/'+rowss[0].product_id);
                  connection.release();
                });
                // res.redirect('/sellphone/read/'+rowss[0].product_id);
                // connection.release();
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
