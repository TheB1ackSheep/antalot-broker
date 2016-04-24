
var mosca = require('mosca'),
  config = require('./config.js'),
  i = require('./log.js'),
  Retry = require('./retry.js'),
  Firebase = require("firebase");

// Config for mqtt server
var server = new mosca.Server(config.mqtt_setting);

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
  i.info('MQTT server is started.');
});

server.on('clientConnected', (client) => {
  i.info('connection accepted from', client.id);
});

server.on('published', function(packet, client) {
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

String.prototype.isJson = function () {
  try {
      JSON.parse(this.toString());
  } catch (e) {
      return false;
  }
  return true;
};
