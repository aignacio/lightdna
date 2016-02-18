var exports = module.exports ={};
var LightsGroup = require('../models/groupMasterSchema');
var logCurrent = require('../models/logCurrentSchema');


//LEMBRAR DE CRIAR UMA FUNÇÃO QUE INICIALIZA COM UM VALOR DE PELO MENOS 0 TODOS AS CORRENTES DOS GRUPOS
//
//
//
//
//

var mongoose = require('mongoose'),
    async = require('async'),
    Schema = mongoose.Schema;

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o[0];
}

var getCurrent = function(){
  var newCurrent = new logCurrent();
  var groups = ['Grupo 1','Total','Grupo 5','Grupo 11','Grupo 2','Grupo 10'];

  var teste = shuffle(groups);

  newCurrent.group = teste;
  newCurrent.current.value = getRandomIntInclusive(6756,39423);

  newCurrent.save(function(err) {
      if (err)
          throw err;
  });
  // console.log(teste);
  setTimeout(getCurrent, 1000);
};

exports.getCurrent = getCurrent;
