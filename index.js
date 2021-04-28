var express = require('express');
var app = express();
const cors = require('cors')//若是其他應用要連線 heroku 取用 API 資料時，有可能會發生 CORS 問題。要加此行

app.use(cors());//若是其他應用要連線 heroku 取用 API 資料時，有可能會發生 CORS 問題。要加此行
// var engine = require('ejs-locals');
var bodyParser = require('body-parser');
var admin = require("firebase-admin");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
var serviceAccount = require("./project-37d56-firebase-adminsdk-n4m3k-3a9f827894.json");

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
   databaseURL: "https://project-37d56-default-rtdb.firebaseio.com"
});


var fireData = admin.database();
console.log(fireData);



//新增USERS
app.post('/api/:username/addUsers', function (req, res) {
   res.header('Access-Control-Allow-Origin', '*');//若是其他應用要連線 heroku 取用 API 資料時，有可能會發生 CORS 問題。要加此行
   res.header('Access-Control-Allow-Headers', '*');//若是其他應用要連線 heroku 取用 API 資料時，有可能會發生 CORS 問題。要加此行 
   const username = req.param('username');   
   console.log(username )
   var data = req.body;
    var path = 'Users/'+username
   console.log(path)
   var contentRef = fireData.ref(path).push();
   
   var key = contentRef.key;
   data.id = key;

   var setdata = {
      "id": data.id,
      // "name": data.name,      
   };
   contentRef.set(setdata).then(function () {

      fireData.ref(path).once('value', function (snapshot) {
         
         res.send(
            {
               "success": true,
               "result": snapshot.val(),
               "message": "新增資料成功"
            }
         );
      })
   })
})


//獲取Todo資料
app.get('/api/:username/getTodo', function (req, res) {
   const username = req.param('username');   
   console.log(username )
   var path = 'Users/'+username+'/todos'

   fireData.ref(path).once('value', function (snapshot) {
      var data = snapshot.val()
      var newTodos = [];
      for (var item in data) {
         newTodos.push(
            {
               "id": data[item].id,
               "content": data[item].content,
               "timetodo": data[item].timetodo,
               "complete": data[item].complete
            }
         );
      }
      console.log(newTodos)
      res.send(
         {
            "success": true,
            "list": newTodos,

            "message": "讀取成功"
         }
      );



   })
})


//新增Todos
app.post('/api/:username/addTodo', function (req, res) {
   res.header('Access-Control-Allow-Origin', '*');//若是其他應用要連線 heroku 取用 API 資料時，有可能會發生 CORS 問題。要加此行
   res.header('Access-Control-Allow-Headers', '*');//若是其他應用要連線 heroku 取用 API 資料時，有可能會發生 CORS 問題。要加此行 
   const username = req.param('username');   
   console.log(username )
   var path = 'Users/'+username+'/todos'
   
   var data = req.body;
   console.log(data)
   var contentRef = fireData.ref(path).push();
   var key = contentRef.key;
   data.id = key;

   var setdata = {
      "id": data.id,
      "content": data.content,
      "timetodo": data.timetodo,
      // "complete": false
   };

   contentRef.set(setdata).then(function () {
      fireData.ref(path).once('value', function (snapshot) {

         res.send(
            {
               "success": true,
               "result": snapshot.val(),
               "message": "新增資料成功"
            }
         );
      })
   })
})

//新增
// app.post('/createTodo',function(req,res){
//    const data = req.body;
//    console.log(data )
//    var contentRef = fireData.ref('todos').push();
//    const key = contentRef.key;
//    data.id = key;


// }


// // Delete
// app.delete('/removeTodo/:id', (req, res, next) => {
//    res
//        .status(200)
//        .json({
//            message: 'Delete success',
//        })});


// 刪除Todo
app.delete('/api/:username/deleteTodo/:id', function (req, res) {
   const username = req.param('username');   
   console.log(username )
   var path = 'Users/'+username+'/todos'
   const id = req.param('id');   
   console.log(id )
   if (!req) {
      res.sendStatus(403);
  }
   fireData.ref(path).child(id).remove()
      .then(function () {
         fireData.ref(path).once('value', function (snapshot) {
            res.send(
               {
                  "success": true,
                  // "result": snapshot.val(),
                  "message": "刪除資料成功"
               }
            )
         })
      })
})
//修改Todo
app.put('/api/:username/updataTodo/:id', function (req, res) {
   // 顯示 id 及 修改內容
   const username = req.param('username');   
   console.log(username )
   var path = 'Users/'+username+'/todos'
   const id = req.param('id'); 
   console.log(id ,JSON.stringify( req.body));
   if (!req.body) {
       res.sendStatus(403);
   }
   const content = req.body.content;
   fireData.ref(path).child(id).update({content})
   .then(function () {
               fireData.ref(path).once('value', function (snapshot) {
                  res.send(
                     {
                        "success": true,
                        "result": snapshot.val(),
                        "message": "修改資料成功"
                     }
                  )
               })
            })
})

// //修改Todo
// app.post('/updataTodo/:id', function (req, res) {
//    const id = req.param('id');
//    var content = req.body.content;
//    fireData.ref('todos').child(id).update({ "content": content, "completed": false })
//       .then(function () {
//          fireData.ref('todos').once('value', function (snapshot) {
//             res.send(
//                {
//                   "success": true,
//                   "result": snapshot.val(),
//                   "message": "修改資料成功"
//                }
//             )
//          })
//       })
// })



// 監聽 port
var port = process.env.PORT || 3000;
app.listen(port);