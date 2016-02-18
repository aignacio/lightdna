//LightDNA - Module that connect MQTT Lights
var exports = module.exports = {};
var colors = require('colors/safe');

colors.setTheme({
  dimmer: 'magenta',
  current: 'green',
  pir: 'rainbow',
  ldr: 'grey',
  temperature: 'gray',
  ip: 'grey',
  rssi: 'cyan',
  status: 'white',
  msp: 'gray',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

var timePoll    = require("../../config/mqttAddress");
var mongoose    = require("../../config/database");
var IPv4Broker  = require("../../config/mqttAddress");
var async       = require('async');
var config      = require('../models/cfgSchema');
var LightsGroup = require('../models/groupMasterSchema');
var Lights      = require('../models/lightSchema');
var mqtt        = require('mqtt');
var server      = mqtt.connect('mqtt:'+IPv4Broker.mqttIPv4);
var connected   = 0;

server.on('connect', function () {
  // console.log(colors.debug('[MQTT] Connected to the broker server IPv4:'+IPv4Broker));
  connected = 1;
});

var getData = function(){
  if (connected) {
    server.publish('lights', 'R0001');
    server.publish('lights', 'R0005');
    server.publish('lights', 'R0253');
    server.publish('lights', 'R0254');
  }
  setTimeout(getData, timePoll.timeReqMQTT);
};

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var setDimmerLight = function(dimmer,light){
  Lights.findOne({'TAG':light},function(err,lights){
    if(err){
      console.log(colors.error('[MQTT]Erro ao procurar device address de TAG['+light+']:'+err));
    }
    else {
      if (connected) {
        console.log(colors.debug('[MQTT] Pub:'+'lights/'+lights.deviceAddress+' Value:W0001-'+pad(Number(dimmer),3)));
        server.publish('lights/'+lights.deviceAddress,'W0001-'+pad(Number(dimmer),3),{'retain':true});
      }
    }
  });
};

var setDimmerLightGroup = function(dimmer,groupLights){
  LightsGroup.findOne({'name':groupLights},function(err,group){
    if(err){
      console.log(colors.error('[MQTT]Erro ao procurar grupo['+groupLights+']:'+err));
    }
    else {
      if (connected) {
        for (var i = 0; i < group.lights.length; i++) {
          // group.lights[i].deviceAddress;
          server.publish('lights/'+group.lights[i].deviceAddress,'W0001-'+pad(Number(dimmer),3),{'retain':true});
          console.log(colors.debug('[MQTT] Pub:'+'lights/'+group.lights[i].deviceAddress+' Value:W0001-'+pad(Number(dimmer),3)));
        }
      }
    }
  });
};

exports.setDimmerLightGroup = setDimmerLightGroup;
exports.setDimmerLight = setDimmerLight;
exports.getData = getData;
