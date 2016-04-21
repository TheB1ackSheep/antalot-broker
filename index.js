
var mosca = require('mosca'),
  cradle = require('cradle'),
  config = require('./config.js'),
  i = require('./log.js'),
  Retry = require('./retry.js');

// Config for database connection
var db = new(cradle.Connection)('http://falook-dev.cloudapp.net', 5984 ).database('antalot');

// Config for mqtt server
var server = new mosca.Server(config.mqtt_setting);

var worker;

/*server.checkPermission = function(user, topic){
  var permissions = user.permissions;
  var hasPermission = false;
  if(permissions)
    for(var permission of permissions)
      if(!hasPermission) hasPermission = topic.match(permission);
      else break;
  return hasPermission !== null;
};*/

// Print the bannner on console
i.banner();

// Bind ready event for mqtt server
server.on('ready', () => {
  // Create Retry instance
  var db_conn = new Retry();
  // Start retry
  db_conn.start(() => {
    i.info('Connecting to database...');
    db.exists(function (err, exists) {
      if (err) {
        // Emit error to retry to connect to db
        db_conn.emit('error', 'Cannot connect to DB', err);
      } else if (exists) {
        db_conn.emit('success', db);
      } else {
        i.warn("Database is not exists.");
        db.create();
        i.success("Database is created.");
        db_conn.emit('success', db);
      }
    });
  });

  // Error event try to reconnect to db every 1 s
  db_conn.error((err, ex) => {
    i.error(err, ex);
    setTimeout(() => {
      db_conn.emit('start');
    }, 1000);
  });

  db_conn.success((db) => {
    i.success("Database connected.");
    i.success("Broker is up and running.");
    /*server.authenticate = (client, username, password, callback) => {
      var user_collection = db.collection('users');
      if(username && password)
        user_collection.find({name:username, passwd:password.toString()}).toArray(function(err, docs){
          var authorized = docs.length > 0;
          if (authorized) client.user = docs[0];
          callback(null, authorized);
        });
      else
        callback(null, false);
    };
    server.authorizePublish = (client, topic, payload, callback) => {
      if(server.checkPermission(client.user, topic)){
        i.success(client.id, 'published.');
        i.info('\tTopic : ', topic);
        i.info('\tMessage : ', payload.toString());
        callback(null, payload);
      }else{
        i.warn('Unauthorize published found.');
        i.warn('\tClient : ', client.id);
      }
    };
    server.authorizeSubscribe = (client, topic, callback) => {
      if(server.checkPermission(client.user, topic)){
        callback(null, true);
        i.success(client.id, 'subscribed.');
        i.info('\tTopic : ', topic);
      }else{
        i.warn('Unauthorize subscribed found.');
        i.warn('\tClient : ', client.id);
        callback(null, false);
      }
    };*/
  });
});

server.on('clientConnected', (client) => {
  i.info('connection accepted from', client.id);
});

server.on('published', function(packet, client) {
  i.info(packet.topic, packet.payload.toString());
});
