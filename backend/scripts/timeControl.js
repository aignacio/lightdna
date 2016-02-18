//LightDNA - Module that control schedule in the system
var exports = module.exports = {};

var mongoose    = require("../../config/database");
var async       = require('async');
var config      = require('../models/cfgSchema');
var schedule    = require('node-schedule');
var LightsGroup = require('../models/groupMasterSchema');
var Lights      = require('../models/lightSchema');
var alarms      = require('../models/alarmSchema');
var moment      = require('moment');
var mqtt        = require('./mqttPollGetData');
var colors      = require('colors/safe');

colors.setTheme({
  time: 'gray',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var activeTime = function(alarms){
  var teste = moment(alarms.time).format('HH:mm');
  var timeV = teste.split(':');
  // console.log(alarms);
  var rule = new schedule.RecurrenceRule();
  rule.minute = Number(timeV[1]);
  rule.hour   = Number(timeV[0]);
  console.log(colors.time('[CRON]')+'Novo Alarme configurado - '+rule.hour+':'+rule.minute+' valor:'+alarms.dimmer+' grupo:'+alarms.group);
  schedule.scheduleJob(String(alarms._id),rule, function(){
      mqtt.setDimmerLightGroup(alarms.dimmer,alarms.group);
  });
};

var retoreAlarms = function(){
  var teste;
  var timeV;
  var rule = new schedule.RecurrenceRule();

  alarms.find({},function(err,data){
    for (var i = 0; i < data.length; i++) {
      teste = moment(data[i].time).format('HH:mm');
      timeV = teste.split(':');
      rule.minute = Number(timeV[1]);
      rule.hour   = Number(timeV[0]);
      console.log(colors.time('[CRON]')+'Alarme restaurado - '+timeV[1]+':'+timeV[0]+' valor:'+data[i].dimmer+' grupo:'+data[i].group);
      schedule.scheduleJob(String(data[i]._id),rule, function(){
          mqtt.setDimmerLightGroup(pad(data[i].dimmer,3),data[i].group);
      });
    }
  });
}

var deleteAlarm = function(job){
  var my_job = schedule.scheduledJobs[String(job)];
  my_job.cancel();
  console.log(colors.time('[CRON]')+'Alarme '+job+' cancelado');
}

exports.deleteAlarm  = deleteAlarm;
exports.retoreAlarms = retoreAlarms;
exports.activeTime   = activeTime;
