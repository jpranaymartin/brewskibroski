// Requirements
var Sequelize = require('sequelize');

var dbName = "brewskitest1";
var dbUser = "root";
var dbPass = "";

var sequelize = null;

if (process.env.DATABASE_URL) {
  // the application is executed on Heroku ... use the postgres database
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    logging:  true //false
  })
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
}, {
  timestamps: true
});

// Relationships Setup

Friend.belongsTo(User);
Event.belongsTo(User);

User.hasMany(Friend);
User.hasMany(Event);

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
