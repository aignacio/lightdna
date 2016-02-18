//LightDNA - Module that calculate groups data
var exports       = module.exports = {};
var LightsGroup   = require('../models/groupMasterSchema');
var Lights        = require('../models/lightSchema');
var logPower      = require('../models/logPowerSchema');
var mongoose      = require("../../config/database");
var timeCalculate = 3000;

var mongoose = require('mongoose'),
    async = require('async'),
    Schema = mongoose.Schema;

function powerCalc(dimmer,tensao,modelo){
  var  a
      ,b
      ,c
      ,d
      ,e
      ,f;

  var powerVal = 0;

  if (tensao > 150) {
    a = 0.002;
    b = 0.034;
    c = -0.0014726;
    d = 0.0000354;
    e = -0.00000035746;
    f = 0.000000001267;
  }
  else {
    a = -0.0003846153;
    b = 0.02054797;
    c = -0.00051;
    d = 0.0000114813;
    e = -0.0000001052;
    f = 0.00000000030768;
  }

  powerVal = a + b*dimmer + c*Math.pow(dimmer,2) + d*Math.pow(dimmer,3)+ e*Math.pow(dimmer,4)+f*Math.pow(dimmer,5);

  powerVal = powerVal*Number(modelo);
  return powerVal;
}

function calculate(groupsMaster,lights){
  var totalPower = 0;

  for (var i = 0; i < groupsMaster.length; i++) {
    groupsMaster[i].power = 0;
    groupsMaster[i].active = 0;
    groupsMaster[i].offline = 0;

    for (var j = 0; j < lights.length; j++) {
      //Calculate number of lights active and offline
      if (lights[j].group.grupo == groupsMaster[i].name) {
        if (lights[j].status.status == '1') {
          groupsMaster[i].active++;
          //Calculate power of groups lights
          var model = lights[j].model.split('-');
          groupsMaster[i].power += powerCalc(lights[j].status.dimmer,groupsMaster[i].voltage,model[1]);
        }
        else {
          groupsMaster[i].offline++;
        }
      }
    }

    //Acumulate in total beforce save
    totalPower += groupsMaster[i].power;
    var groups = new LightsGroup();
    groups = groupsMaster[i];
    groups.save(function(err) {
        if (err){
          console.log('[ERRO]Erro ao atualizar o número de luminárias ativas!');
          throw err;
        }
        else {
          // console.log('[SUCESSO]Atualização do número de luminárias ativas - Grupo:'+groups.name);
        }
    });

  }

  //After calculate power of all groups, lets calculate total
  var totalLog = new logPower();
  totalLog.power.value = totalPower;
  totalLog.group = 'Total';
  console.log("Potência total da planta:"+totalLog.power.value);
  totalLog.save(function(err) {
      if (err)
          throw err;
  });
}

var calculateGroups = function(){
  var groupsMaster;

  async.parallel([
      function readGroups(callback) {
        LightsGroup.find({}, function (err, groups) {
          groupsMaster = groups;
          callback(err);
        });
      }
    ],function(err){
        Lights.find({},function(err, lights){
          calculate(groupsMaster,lights);
        });
    });
  setTimeout(calculateGroups, timeCalculate);
};

exports.calculateGroups = calculateGroups;
