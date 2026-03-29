const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const DB = "db.json";

let db = { users:{}, history:[] };
if(fs.existsSync(DB)){
  db = JSON.parse(fs.readFileSync(DB));
}

function save(){
  fs.writeFileSync(DB, JSON.stringify(db,null,2));
}

// ===== REGISTER =====
app.post("/register",(req,res)=>{
  const {user,pass} = req.body;

  if(!user || !pass){
    return res.json({ok:false,msg:"Thiếu dữ liệu"});
  }

  if(db.users[user]){
    return res.json({ok:false,msg:"Tài khoản đã tồn tại"});
  }

  db.users[user] = {
    pass,
    money:0,
    created:new Date()
  };

  save();
  res.json({ok:true,msg:"Đăng ký thành công"});
});

// ===== LOGIN =====
app.post("/login",(req,res)=>{
  const {user,pass} = req.body;

  const u = db.users[user];
  if(!u || u.pass !== pass){
    return res.json({ok:false,msg:"Sai tài khoản"});
  }

  res.json({
    ok:true,
    money:u.money,
    user:user
  });
});

// ===== NẠP THẺ (CHỜ API THẬT) =====
app.post("/napthe",(req,res)=>{
  const {user,telco,code,serial} = req.body;

  if(!db.users[user]){
    return res.json({ok:false,msg:"User không tồn tại"});
  }

  if(!code || !serial){
    return res.json({ok:false,msg:"Thiếu mã hoặc seri"});
  }

  // 👉 Sau này gắn API thật ở đây
  db.history.push({
    user,
    telco,
    code,
    serial,
    amount:0,
    status:"pending",
    time:new Date()
  });

  save();

  res.json({
    ok:true,
    msg:"Đã gửi thẻ - đang xử lý"
  });
});

// ===== LỊCH SỬ =====
app.get("/history",(req,res)=>{
  const user = req.query.user;
  res.json(db.history.filter(i=>i.user===user));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log("Server chạy port " + PORT);
});
