//LightDNA - Module that connect MQTT Lights
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

var IPv4Broker  = require("./config/mqttAddress");
var mongoose    = require("./config/database");
var async       = require('async');
var config      = require('./backend/models/cfgSchema');
var LightsGroup = require('./backend/models/groupMasterSchema');
var Lights      = require('./backend/models/lightSchema');
var mqtt        = require('mqtt');
var server      = mqtt.connect('mqtt:'+IPv4Broker.mqttIPv4);
var sleep       = require('sleep');
// var messages    = [];


function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

server.on('message', function (topic, message) {
  var topicArray = String(topic).split('/');
  switch (topicArray[2]) {
    case "current":
      Lights.update({'deviceAddress': topicArray[1]},{'status.status': '1'},function (err, status) {
        if (err){
          console.log(colors.error('[Status]Erro no update ('+topicArray[1]+',1):'+err));
        }
        else{
          if (status.n) {
            console.log(colors.status('[Status]Update ('+topicArray[1]+',1)realizado com sucesso!'));
          }
          else {
            console.log(colors.error('[Status]Update ('+topicArray[1]+',1) não consta no banco de dados!'));
          }
        }
      });
      var sepCurrent = String(message).split('mA');
      Lights.update({'deviceAddress': topicArray[1]},{'status.current': Number(sepCurrent[0])},function (err, corrente) {
        if (err){
          console.log(colors.error('[Corrente]Erro no update ('+topicArray[1]+','+message.toString()+'):'+err));
        }
        else{
          if (corrente.n) {
            console.log(colors.current('[Corrente]Update ('+topicArray[1]+','+message.toString()+')realizado com sucesso!'));
          }
          else {
            console.log(colors.error('[Corrente]Update ('+topicArray[1]+','+message.toString()+') não consta no banco de dados!'));
          }
        }
      });
      break;
    case "dimmer":
      var sepMessage = String(message).split('%');
      Lights.update({'deviceAddress': topicArray[1]},{'status.dimmer': Number(sepMessage[0])},function (err, dimmer) {
        if (err){
          console.log(colors.error('[Dimmer]Erro no update ('+topicArray[1]+','+message.toString()+'):'+err));
        }
        else{
          if (dimmer.n) {
            console.log(colors.dimmer('[Dimmer]Update ('+topicArray[1]+','+message.toString()+')realizado com sucesso!'));
            // messages.push({topicArray[1]:sepMessage[0]});
          }
          else {
            console.log(colors.error('[Dimmer]Update ('+topicArray[1]+','+message.toString()+') não consta no banco de dados!'));
          }
        }
      });
      break;
    case "pir":
      console.log(colors.error('[PIR]Update ainda não implementado!'));
      break;
    case "ldr":
      console.log(colors.error('[LDR]Update ainda não implementado!'));
      break;
    case "temperature":
      Lights.update({'deviceAddress': topicArray[1]},{'status.temperature': Number(message)},function (err, temperature) {
        if (err){
          console.log(colors.error('[Temperatura]Erro no update ('+topicArray[1]+','+message.toString()+'):'+err));
        }
        else{
          if (temperature.n) {
            console.log(colors.temperature('[Temperatura]Update ('+topicArray[1]+','+message.toString()+')realizado com sucesso!'));
          }
          else {
            console.log(colors.error('[Temperatura]Update ('+topicArray[1]+','+message.toString()+') não consta no banco de dados!'));
          }
        }
      });
      break;
    case "ip":
      Lights.update({'deviceAddress': topicArray[1]},{'status.ipv4': String(message)},function (err, ipv4) {
        if (err){
          console.log(colors.error('[IPv4]Erro no update ('+topicArray[1]+','+message.toString()+'):'+err));
        }
        else{
          if (ipv4.n) {
            console.log(colors.ip('[IPv4]Update ('+topicArray[1]+','+message.toString()+')realizado com sucesso!'));
          }
          else {
            console.log(colors.error('[IPv4]Update ('+topicArray[1]+','+message.toString()+') não consta no banco de dados!'));
          }
        }
      });
      break;
    case "rssi":
      var rssiValue = parseInt(message.toString());
      // console.log(rssiValue);
      Lights.update({'deviceAddress': topicArray[1]},{'status.rssi': rssiValue},function (err, rssi) {
        if (err){
          console.log(colors.error('[RSSI]Erro no update ('+topicArray[1]+','+message.toString()+'):'+err));
        }
        else{
          if (rssi.n) {
            console.log(colors.rssi('[RSSI]Update ('+topicArray[1]+','+message.toString()+')realizado com sucesso!'));
          }
          else {
            console.log(colors.error('[RSSI]Update ('+topicArray[1]+','+message.toString()+') não consta no banco de dados!'));
          }
        }
      });
      break;
    case "status":
      var typeMessage = String(message).split(' ');
      if (typeMessage[0]=='Hello') {
        Lights.update({'deviceAddress': topicArray[1]},{'status.status': '1'},function (err, status) {
          if (err){
            console.log(colors.error('[Status]Erro no update ('+topicArray[1]+',1):'+err));
          }
          else{
            if (status.n) {
              console.log(colors.status('[Status]Update ('+topicArray[1]+',1)realizado com sucesso!'));
              // Lights.find({'deviceAddress':topicArray[1]},function(err,lightDB){
              //   setDimmerHello('lights/'+topicArray[1],'W0001-'+pad(Number(lightDB[0].status.dimmer),3));
              // });
              // if (messages.hasOwnProperty(topicArray[1])) {
              // }
            }
            else {
              console.log(colors.error('[Status]Update ('+topicArray[1]+',1) não consta no banco de dados!'));
            }
          }
        });
      }
      else {
        Lights.update({'deviceAddress': topicArray[1]},{'status.status': '0'},function (err, status) {
          if (err){
            console.log(colors.error('[Status]Erro no update ('+topicArray[1]+',0):'+err));
          }
          else{
            if (status.n) {
              console.log(colors.status('[Status]Update ('+topicArray[1]+',0)realizado com sucesso!'));
            }
            else {
              console.log(colors.error('[Status]Update ('+topicArray[1]+',0) não consta no banco de dados!'));
            }
          }
        });
      }

      break;
    case "msp":
      console.log(colors.error('[MSP]Update ainda não implementado!'));
      break;
    default:
  }
});

server.on('connect', function () {
  console.log(colors.debug('[MQTT] Connected to the broker server IPv4:'+IPv4Broker.mqttIPv4));

  server.subscribe('lights/+/temperature');
  server.subscribe('lights/+/current');
  server.subscribe('lights/+/dimmer');
  server.subscribe('lights/+/status');
  server.subscribe('lights/+/rssi');
  server.subscribe('lights/+/pir');
  server.subscribe('lights/+/ldr');
  server.subscribe('lights/+/msp');
  server.subscribe('lights/+/ip');
});
