//LightDNA - Module that send mail of offline Lights
var exports = module.exports = {};

var mongoose    = require('mongoose');
var async       = require('async');
var config      = require('../models/cfgSchema');
var nodemailer  = require("nodemailer");
var mg          = require('nodemailer-mailgun-transport');
var LightsGroup = require('../models/groupMasterSchema');
var Lights      = require('../models/lightSchema');
var colors      = require('colors/safe');

colors.setTheme({
  mail: 'yellow',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

function sendMail(client, lightsOffline, lightTHD){
  var transporter = nodemailer.createTransport('smtps://awgeslightdna%40gmail.com:awges12345@smtp.gmail.com');
  var body_text,
      signature,
      totalOff = 0;

  body_text = 'Olá,<br>\
              O sistema <b>LightDNA</b> observou que o número de luminárias em alerta é\
              maior que o valor configurado<br>\
              (<span style="color:red;"><b>'+lightTHD+'</b></span>)\
               assim estamos lhe enviando este e-mail para informar que as seguintes\
               luminárias estão em alerta:<br><br>';

  signature = '<br>\
              LightDNA Suporte<br>\
              <img src="http://awges.com:8888/img/logo_main.png" width="200px"></div>';

  Lights.find({},function(err,  lightsR){
    for (var i = 0, j = 0; i < lightsR.length; i++) {
      if (lightsR[i].status.status == '0') {
        body_text += '<b>'+lightsR[i].TAG+',</b>';
        totalOff += 1;
        j += 1;
        if (j == 10) {
          j = 0;
          body_text += '<br>';
        }
      }
    }

    body_text += '<br><br>Totalizando <b>'+totalOff+'</b> luminárias offline.';
    body_text += signature;

    var mailOptions = {
        from: 'Suporte LightDNA <suporte@awges.com>', // sender address
        to: client, // list of receivers
        subject: 'Luminárias Offline -'+new Date(), // Subject line
        text: '\
        LightDNA',
        html: body_text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
            console.log(colors.mail("[Mail - ERROR]")+' Message sent: ' + error);

        }
        else {
          console.log(colors.mail("[Mail - SUCCESS]")+' Message sent: ' + info.response);
        }
    });
  });
}

var mailSend = function(){
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
      if(configuration === null || !configuration.emailAlert){
        console.log(colors.mail("[Mail - INFO]")+'e-mail não configurado!');
      }
      else {
        console.log(colors.mail("[Mail - INFO]")+'e-mail configurado!');
        var lightsOff = 0;
        for (var i = 0; i < groupsTotal.length; i++) {
          lightsOff += groupsTotal[i].offline;
        }
        if (lightsOff >= configuration.numberAlert) {
          console.log(colors.mail("[Mail - INFO]")+'Número de luminárias offline alerta, enviando e-mail!');
          sendMail(configuration.emailAlert,lightsOff,configuration.numberAlert);
        }
      }

      //Define time to rebuil e-mail alert
      if (configuration === null) {
        setTimeout(mailSend, 30000);
      }else {
        if (configuration.timeEmailAlert) {
          console.log(colors.mail("[Mail - INFO]")+'Tempo de re-enviar e-mail configurado para:'+configuration.timeEmailAlert+' segundos');
          setTimeout(mailSend, configuration.timeEmailAlert*1000);
        }
        else {
          setTimeout(mailSend, 30000);
        }
      }
  });
};


exports.mailSend = mailSend;
