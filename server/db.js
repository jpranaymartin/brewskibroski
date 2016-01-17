// Requirements
var Sequelize = require('sequelize');
var url = require('url');

var dbName = "brewskitest1";
var dbUser = "root";
var dbPass = "";

var sequelize = null;

// Heroku-ClearDB Code
// if (process.env.CLEARDB_DATABASE_URL) {
//   // the application is executed on Heroku ... use the postgres database
//   var dbUrl = url.parse(process.env.CLEARDB_DATABASE_URL);
//   sequelize = new Sequelize(dbUrl.pathname.slice(1), dbUrl.auth.split(":")[0],  dbUrl.auth.split(":")[1], {
//     dialect:  'mysql',
//     protocol: 'mysql',
//     host:     dbUrl.hostname,
//     logging:  true
//   })


if(process.env.CLEARDB_DATABASE_URL){
  sequelize = new Sequelize(process.env.CLEARDB_DATABASE_URL);
// } else if(process.env.DATABASE_URL){
//   sequelize = new Sequelize(process.env.DATABASE_URL);
} else {
  // the application is executed on the local machine ... use mysql
  sequelize = new Sequelize(dbName, dbUser, dbPass);
}

// Sequelize Models
// based on SQL schema

// User Schema
var User = sequelize.define('User', {
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  currentEvent: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true
});

// Event Schema
var Event = sequelize.define('Event', {
  acceptedAt: Sequelize.STRING,
  acceptedId: Sequelize.INTEGER,
  eventType: Sequelize.INTEGER,
  ownerName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  acceptedName: {
    type: Sequelize.STRING,
    allowNull: true
  },
  message: {
    type: Sequelize.STRING
  },
  accepted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  ownerLat: {
    type: Sequelize.FLOAT(53),
    allowNull: true,
    validate: {
      min: -90.0,
      max: 90.0
    },
    defaultValue: null
  },
  ownerLong: {
    type: Sequelize.FLOAT(53),
    allowNull: true,
    validate: {
      min: -180.0,
      max: 180.0
    },
    defaultValue: null
  },
  acceptedLat: {
    type: Sequelize.FLOAT(53),
    allowNull: true,
    validate: {
      min: -90.0,
      max: 90.0
    },
    defaultValue: null
  },
  acceptedLong: {
    type: Sequelize.FLOAT(53),
    allowNull: true,
    validate: {
      min: -180.0,
      max: 180.0
    },
    defaultValue: null
  },
  centerLat: {
    type: Sequelize.FLOAT(53),
    allowNull: true,
    validate: {
      min: -90.0,
      max: 90.0
    },
    defaultValue: null
  },
  centerLong: {
    type: Sequelize.FLOAT(53),
    allowNull: true,
    validate: {
      min: -180.0,
      max: 180.0
    },
    defaultValue: null
  },
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true
});

// Friend Schema
var Friend = sequelize.define('Friend', {
  friendId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Relationships Setup

// Friend.belongsTo(User);
// Event.belongsTo(User);
//
// User.hasMany(Friend);
// User.hasMany(Event);

// Create the tables in the database

User.sync();
Event.sync();
Friend.sync();

// Make all Models available in Router

exports.User = User;
exports.Event = Event;
exports.Friend = Friend;
exports.Sequelize = Sequelize;
exports.seq = sequelize;
