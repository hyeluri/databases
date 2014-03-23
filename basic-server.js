/* Import node's http module: */
var express = require("express");
var http = require("http");
var path = require('path');
var fs = require('fs');
var dbHelpers = require('./SQL/persistent_server');
var orm = require('./ORM_Refactor/orm-example');

// var databaseUrl = process.env.mongoURL || "localMongo";
// var collections = ["messages"];
// var db = require("mongojs")(databaseUrl, collections);

var app = express();

var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, '../client')));
app.set('port', process.env.PORT || 3000);


var server = http.createServer(app);
console.log("Listening on port "+ app.get('port'));
server.listen(app.get('port'));



app.all("*", function(req, res, next){
  res.set(defaultCorsHeaders);
  next();
});

app.post('/classes/bangorang', function(req, res){
  var message = req.body;

  var newUser = orm.user.findOrCreate({
    username: message.username
  }).success( function(newUser){
    //var userId = newUser.id;
    // console.log("user: ", newUser.username, " created");
    var newRoom = orm.room.findOrCreate({
      roomname: message.roomname
    }).success(function(newRoom, created){
      //console.log(newUser, newRoom);
      var newMessage = orm.message.create({
        text : message.message,
        user_id: newUser.id,
        room_id: newRoom.id
      });
    }).error(function(){
      console.log("some shit broke");
    });

    res.send(newUser.username);
  });
});

app.get('/classes/:messages',function(req,res){
   // res.send(200, {"results": app.messageStorage});
    // db.messages.find({}).sort({createdAt:-1}, function(err,msgResults){
    //   if(!err){
    //     res.send({results: msgResults});
    //   }else{
    //     console.log(err);
    //     res.send(500,"error occurred");
    //   }
    // });
  dbHelpers.readMessages(function(err,results){
    if(!err){
      res.send(200, {"results":results});
    }
  });
  
});

app.post('/classes/:messages',function(req,res){
    //app.messageStorage.push(req.body);
    // db.messages.save(req.body,function(err,result){
    //   if(!err){
    //     console.log("now we're logging " + result);
    //     res.send(201,"posted");
    //   }else{
    //     console.log(err);
    //     res.send(500,"error occurred");
    //   }
    // });
    //req.body.createdAt = new Date();
    //console.log(req.body);
    dbHelpers.saveMessage(req.body,function(err,fine){
      if(!err){
        res.send("inserted successfully");
      }
    });
    // res.send(req.body);


});

app.use(function(req, res, next){
  fs.readFile(__dirname + "/404.html", {encoding: "utf-8"}, function(err, html){
    if(!!err){
      console.log(err);
    }
    res.status(404).send(html);
  });
});
