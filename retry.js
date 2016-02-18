"use strict";
module.exports = class Retry{
  constructor() {
    this.event = new (require('events'));
    setImmediate( function(_self){
      _self.emit('start');
    }, this.event);
  }
  
  error(cb) {
    this.event.on('error', cb);
  }
  
  success(cb) {
    this.event.on('success', cb);
  }
  
  start(cb) {
    this.event.on('start', cb);
  }
  
  emit() {
    this.event.emit.apply(this.event, arguments);
  }
  
};