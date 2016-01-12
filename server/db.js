var Sequelize = require('sequelize');
var sequelize = new Sequelize('brewskitest1', 'root', ''); //TODO

var User = sequelize.define('User', {
  username: {type: Sequelize.STRING, allowNull: false},
  password: {type: Sequelize.STRING, allowNull: false},
  email: {type: Sequelize.STRING, allowNull: false}
},
{
  timestamps:true
});

var Event = sequelize.define('Event', {
  acceptedAt: Sequelize.STRING,
  acceptedId: Sequelize.INTEGER,
  // eventType: Sequelize.INTEGER,  //NEED TO UNCOMMENT TO ADD BROSKIS
  active: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  accepted: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
  ownerLat: {type: Sequelize.FLOAT(53), allowNull: true, validate: {min: -90.0, max: 90.0}, defaultValue: null},
  ownerLong: {type: Sequelize.FLOAT(53), allowNull: true, validate: {min: -180.0, max: 180.0}, defaultValue: null},
  acceptedLat: {type: Sequelize.FLOAT(53), allowNull: true, validate: {min: -90.0, max: 90.0}, defaultValue: null},
  acceptedLong: {type: Sequelize.FLOAT(53), allowNull: true, validate: {min: -180.0, max: 180.0}, defaultValue: null},
  centerLat: {type: Sequelize.FLOAT(53), allowNull: true, validate: {min: -90.0, max: 90.0}, defaultValue: null},
  centerLong: {type: Sequelize.FLOAT(53), allowNull: true, validate: {min: -180.0, max: 180.0}, defaultValue: null}
},
{
  timestamps: true,
  paranoid: true
});

var Friend = sequelize.define('Friend', {
  friendId: {type: Sequelize.INTEGER, allowNull: false},
},
{
  timestamps:true
});

var Bro = sequelize.define('Bro', {
},
{
  timestamps: true,
  paranoid: true
});

Friend.belongsTo(User);
Event.belongsTo(User);
Bro.belongsTo(User);

User.hasMany(Friend);
User.hasMany(Event);
User.hasMany(Bro);

User.sync();
Event.sync();
Friend.sync();
Bro.sync();

exports.User = User;
exports.Event = Event;
exports.Friend = Friend;
exports.Bro = Bro;



