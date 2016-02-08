
var mosca = require('mosca'),
  mongo = require('mongodb').MongoClient,
  config = require('./config.js'),
  i = require('./log.js'),
  Retry = require('./retry.js');

var db_url = 'mongodb://localhost/';

var server = new mosca.Server(config.mqtt_setting);

i.banner();

server.on('ready', () => {
  var db_conn = new Retry();
  db_conn.start(() => {
    i.info('Connecting to database...');
    mongo.connect(db_url, (err, db) => {
      if(err){
        db_conn.emit('error', 'Cannot connect to DB', new Error(err));
        return;
      }
      db_conn.emit('success', db);
    });
  });
  db_conn.error((err, ex) => {
    i.error(err, ex);
    setTimeout(() => {
      db_conn.emit('start');
    }, 1000);

  });
  
  db_conn.success((db) => {
    i.success("Database connected.");
    i.info("Broker is up and running.")
    server.authenticate = (client, username, password, callback) => {
      var user_collection = db.collection('users');
      user_collection.find({username:username, pwd:password.toString()}).toArray(function(err, docs){
        var authorized = docs.length > 0;
        if (authorized) client.user = username;
        callback(null, authorized);
      });
    }
    server.authorizePublish = (client, topic, payload, callback) => {
      callback(null, payload);
    }
    server.authorizeSubscribe = (client, topic, callback) => {
      callback(null, true);
    } 
  });  
});

server.on('clientConnected', (client) => {
  i.info('connection accepted from', client.id);
});