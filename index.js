
var mosca = require('mosca'),
  mongo = require('mongodb').MongoClient,
  config = require('./config.js'),
  i = require('./log.js'),
  Retry = require('./retry.js');

var db_url = 'mongodb://localhost/';

var server = new mosca.Server(config.mqtt_setting);

i.banner();

server.on('ready', function() {
  var db_conn = new Retry();
  db_conn.start(function() {
    i.info('Connecting to database...');
    mongo.connect(db_url, function(err, db) {
      if(err){
        db_conn.emit('error', 'Cannot connect to DB', new Error(err));
        return;
      }
      db_conn.emit('success', db);
    });
  });
  db_conn.error(function(err, ex) {
    i.error(err, ex);
    setTimeout(function() {
      db_conn.emit('start');
    }, 1000);

  });
  
  db_conn.success(function(db) {
    i.success("Database connected.");
    i.info("Broker is up and running.")
    server.authenticate = function(client, username, password, callback) {
      var user_collection = db.collection('users');
      user_collection.find({username:username, pwd:password.toString()}).toArray(function(err, docs){
        var authorized = docs.length > 0;
        if (authorized) client.user = username;
        callback(null, authorized);
      });
    }
    server.authorizePublish = function(client, topic, payload, callback) {
      callback(null, payload);
    }
    server.authorizeSubscribe = function(client, topic, callback) {
      callback(null, true);
    } 
  });  
});

server.on('clientConnected', function(client) {
  i.info('connection accepted from', client.id);
});