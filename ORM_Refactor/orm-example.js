/* You'll need to
 * npm install sequelize
 * before running this example. Documentation is at http://sequelizejs.com/
 */

var Sequelize = require("sequelize");
var sequelize = new Sequelize("bangorang", "root", "plantlife");


/* first define the data structure by giving property names and datatypes
 * See http://sequelizejs.com for other datatypes you can use besides STRING. */
var User = sequelize.define('User', {
  username: Sequelize.STRING
}, {
  tableName: 'users',
  timestamps: false
});

var Room = sequelize.define('Room', {
  roomname: Sequelize.STRING
}, {
  tableName: 'room',
  timestamps: false
});

var Message = sequelize.define('Message', {
  createdAt: Sequelize.DATE,
  text: Sequelize.STRING
}, {
  tableName: 'messages',
  timestamps: false
});

User.hasMany(Message, {foreignKey: 'user_id'});
Room.hasMany(Message, {foreignKey: 'room_id'});

//Message.belongsTo(Room);
//Message.belongsTo(User);



User.sync().success(function() {
  console.log("room table created");
});

Room.sync().success(function(){
  console.log("room table created");
});

Message.sync().success(function(){
  console.log("message table created");
});

exports.user = User;
exports.room = Room;
exports.message = Message;