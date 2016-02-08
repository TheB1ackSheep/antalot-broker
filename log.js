var winston = require('winston'),
  clc = require('cli-color'),
  cli = require('clui'),
  Spinner = cli.Spinner;

var error = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({ 
        filename: 'error.log',
        level: 'error' })
    ]
});

var info = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({ 
        filename: 'info.log',
        level: 'info' })
    ]
});

exports.banner = function(){
  console.log(clc.cyan("==============================================="));
  console.log(clc.cyan("             ANTALOT MQTT BROKER"));
  console.log(clc.cyan("==============================================="));
}

var argsToStr = function(args){
  return Array.prototype.slice.call(args, 0).join(" ");
}

exports.info = function(){
  console.log.apply(console, arguments);
  info.log("info", argsToStr(arguments));    
};

exports.warn = function(){
  console.log(clc.yellow(argsToStr(arguments)));
  info.log("info", argsToStr(arguments));
};

exports.success = function(){
  console.log(clc.green(argsToStr(arguments)));
  info.log("info", argsToStr(arguments));
};

exports.error = function(msg, ex){
  console.error(clc.red(argsToStr(arguments)));
  error.log("info", argsToStr(arguments));
  if(ex) {
    console.error(clc.red("\t", ex));
    error.log("error", ex);
  }
};