//Main script for poll the network
var exports = module.exports = {};

var mail  = require('./mailSender');
var slack = require('./slackSender');
var mqtt  = require('./mqttPollGetData');
var calc  = require('./groupsCalculate');

var cont = function(){
  mail.mailSend();
  slack.slackSend();
  mqtt.getData();
  calc.calculateGroups();
}

exports.cont = cont;
