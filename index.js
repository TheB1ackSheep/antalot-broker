
var mqtt      = require('mqtt'),
    fs        = require('fs');
    config    = require('./config.js'),
    i         = require('./log.js'),
    Retry     = require('./retry.js'),
    Firebase  = require("firebase");
    
i.banner();

new mqtt.SecureServer({
	 key: fs.readFileSync(__dirname + '/ssl/privkey.pem'),
	 cert: fs.readFileSync(__dirname + '/ssl/cert.pem'),
}, function(client) {
  var self = this;
  
  if (!self.clients) self.clients = {};

  client.on('connect', function(packet) {
    client.connack({returnCode: 0});
    client.id = packet.clientId;
    self.clients[client.id] = client;
  });
  
  client.on('publish', function(packet) {
    for (var k in self.clients) {
    	self.clients[k].publish({topic: packet.topic, payload: packet.payload});
    }
    
    i.info(packet.topic, packet.payload.toString());

  // run check for topic convention
  var topic = packet.topic;
  var payload = packet.payload.toString();
  var slugs = topic.split('/');

  // get rid of the first array elem
  slugs.splice(0,1);

  for(key in slugs){
    if(!slugs[key].match('^[a-z0-9-]+$'))
      return;
  }

  // now slug is follow by convention
  var db = new Firebase('https://antalot.firebaseio.com/');

  var factory_slug = topic.split('/')[1];
  var machine_slug = topic.split('/')[2];
  var board_slug = topic.split('/')[3];
  var sensor_slug = topic.split('/')[4];

  /*if(topic.match('^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$')){
    // if board published its info with topic /[FACTORY_SLUG]/[MACHINE_SLUG]/[BOARD_SLUG]
    if(payload.isJson()){
        db.child('/factories/'+factory_slug+'/machines/'+machine_slug+'/boards/'+board_slug+'/info').update(JSON.parse(payload));
    }else{
      i.error('board name "'+board_slug+'" is published invalid data');
    }
  }else */

  if(topic.match('^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/info$')){
    // if sensor published its output /[FACTORY_SLUG]/[MACHING_SLUG]/[BOARD_SLUG]/[SENSOR_SLUG]
    if(payload.isJson() && typeof JSON.parse(payload) === 'object'){
      db.child('/factories/'+factory_slug+'/machines/'+machine_slug+'/boards/'+board_slug+'/sensors/'+sensor_slug+'/info').update(JSON.parse(payload));
    }else{
      i.error('sensor name "'+sensor_slug+'" is published invalid data');
    }

  }else if(topic.match('^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\/output$')){
    if(payload.match('^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$')){
        // check payload is either int or float
        db.child('/factories/'+factory_slug+'/machines/'+machine_slug+'/boards/'+board_slug+'/sensors/'+sensor_slug+'/output').push({ timestamp: new Date().getTime(), value: payload});
    }else{
      i.error('sensor name "'+sensor_slug+'" is published invalid data');
    }

  }
  
  });

  client.on('subscribe', function(packet) {
    var granted = [];
    for (var i = 0; i < packet.subscriptions.length; i++) {
      granted.push(packet.subscriptions[i].qos);
    }
    client.suback({granted: granted, messageId: packet.messageId});
  });

  client.on('pingreq', function(packet) {
    client.pingresp();
  });

  client.on('disconnect', function(packet) {
    client.stream.end();
  });

  client.on('close', function(err) {
    delete self.clients[client.id];
  });

  client.on('error', function(err) {
    client.stream.end();
    console.log('error!');
  });
  
}).listen(8883);


String.prototype.isJson = function () {
  try {
      JSON.parse(this.toString());
  } catch (e) {
      return false;
  }
  return true;
};
