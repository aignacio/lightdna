//LightDNA - Module that send mail of offline Lights
var exports = module.exports = {};

var mongoose    = require('mongoose');
var async       = require('async');
var config      = require('../models/cfgSchema');
var Slack       = require("slack-node");
var mg          = require('nodemailer-mailgun-transport');
var LightsGroup = require('../models/groupMasterSchema');
var Lights      = require('../models/lightSchema');
var colors      = require('colors/safe');

colors.setTheme({
  slack: 'white',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});


function sendSlack(slackToken,botSlack,channelSlack,lightsOff,numberAlert){
  var slack = new Slack();
  slack.setWebhook(slackToken);

  slack.webhook({
      channel: '#'+channelSlack,
      username: botSlack,
      icon_emoji: "http://icons.iconarchive.com/icons/paomedia/small-n-flat/256/light-bulb-icon.png",
      text: "[LightDNA]Luminárias em Alerta"
    }, function(err, response) {
      console.log(colors.slack("[Slack-SEND]")+response);
  });
}

var slackSend = function(){
  var configuration;
  var groupsTotal;

  async.parallel([
      function readConfig(callback) {
        config.findOne({'idCFG':'unica'},function (err, configData) {
          configuration = configData;
          callback(err);
        });
      },
      function readGroups(callback) {
        LightsGroup.find({}, function (err, groups) {
          groupsTotal = groups;
          callback(err);
        });
      }
    ],function(err){
      if(configuration === null){
        console.log(colors.slack("[Slack-INFO]")+'WebHook não configurado!');
      }
      else {
        if(!configuration.slackToken || !configuration.botSlack || !configuration.channelSlack){
          console.log(colors.slack("[Slack-INFO]")+'WebHook não configurado!');
        }
        else {
          console.log(colors.slack("[Slack-INFO]")+'WebHook configurado!');
          var lightsOff = 0;
          for (var i = 0; i < groupsTotal.length; i++) {
            lightsOff += groupsTotal[i].offline;
          }
          if (lightsOff >= configuration.numberAlert) {
            console.log(colors.slack("[Slack-INFO]")+'Número de luminárias offline alerta, enviando post slack!');
            sendSlack(configuration.slackToken,configuration.botSlack,configuration.channelSlack,lightsOff,configuration.numberAlert);
          }
        }

        //Define time to rebuil e-mail alert
        if (configuration.timeEmailAlert) {
          console.log(colors.slack("[Slack-INFO]")+'Tempo de re-enviar post slack configurado para:'+configuration.timeEmailAlert+' segundos');
          setTimeout(slackSend, configuration.timeEmailAlert*1000);
        }
        else {
          setTimeout(slackSend, 30000);
        }
      }
  });
};


exports.slackSend = slackSend;
