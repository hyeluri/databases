var mysql = require('mysql');
var q = require('Q');
var async = require('async');
var _ = require('underscore');


/* You'll need to fill the following out with your mysql username and password.
 * database: "chat" specifies that we're using the database called
 * "chat", which we created by running schema.sql.*/
var dbConnection = mysql.createConnection({
  user: "root",
  password: "plantlife",
  database: "chat"
});

dbConnection.connect();

exports.saveMessage = function(message, callback){
  console.log(message);

  dbConnection.beginTransaction(function(err) {
    console.log("1");
    async.parallel([
        function(cb){
          console.log("2");
          dbConnection.query('INSERT INTO users (username) SELECT * FROM (SELECT ?) AS tmp WHERE NOT EXISTS (SELECT username FROM users WHERE username=?) LIMIT 1', [message.username, message.username], cb);
        },
        function(cb){
          console.log("3");
          dbConnection.query('INSERT INTO room (roomname) SELECT * FROM (SELECT ?) AS tmp WHERE NOT EXISTS (SELECT roomname FROM room WHERE roomname=?) LIMIT 1', [message.roomname, message.roomname], cb);
        }],
        function(err, results){
          console.log("4");
          if(!err || _.every(err, function(er){return !er;}) ){
            dbConnection.query('INSERT INTO messages (text, id_users, id_room) VALUES (?, (SELECT id from users where username=?), (SELECT id from room where roomname=?))', [message.message, message.username, message.roomname], function(err){
              if (!!err) {
                console.log("5");
                dbConnection.rollback(function() {
                  throw err;
                });
              }else{
                console.log("6");
                dbConnection.commit(function(err){
                  if(!!err){
                    console.log("7");
                    dbConnection.rollback(function(){
                      throw err;
                    });
                  }
                  console.log('nice typing Harish');
                  callback(null,true);
                });
              }
            });
          }else{
            console.log(err);
            callback(err);
          }
    });
  });
};

exports.readMessages = function(callback){
  //console.log(message);
  dbConnection.query('select messages.text,messages.createdAt, users.username, room.roomname from messages,users,room where messages.id_users = users.id and messages.id_room = room.id;', function(err, rows){
      if(!!err){
        console.log("error querying db");
        callback(err);
      }else{
        callback(null,rows);
      }
  });
};