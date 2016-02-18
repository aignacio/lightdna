//ALL METHODS LIKE .findOne .save .update are from [MONGOOSE]

// backend/routes.js
// load up the user model
var User        = require('../backend/models/userSchema');
var Lights      = require('../backend/models/lightSchema');
var bcrypt      = require('bcrypt-nodejs');
var LightsGroup = require('../backend/models/groupMasterSchema');
var Alarms      = require('../backend/models/alarmSchema');
var logPower    = require('../backend/models/logPowerSchema');
var cfgDefault  = require('../backend/models/cfgSchema');
var timer       = require('./scripts/timeControl');

var mqtt        = require('./scripts/mqttPollGetData');

var async = require('async');
var Mgroups = []; //Better to use async again in get for zingcharts

module.exports = function(app, passport) {
    generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('../dist/pages/login/login.ejs', { message: req.flash('loginMessage') }); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('../dist/pages/login/login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/main', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('../dist/pages/login/signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
       successRedirect : '/login', // redirect to the secure profile section
       failureRedirect : '/signup', // redirect back to the signup page if there is an error
       failureFlash : true // allow flash messages
    }));

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/main', isLoggedIn, function(req, res) {
        res.render('../dist/index.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // MAIN SECTION ======================
    // =====================================
    // Main routes for mongodb
    app.get('/users/getUsers',function(req,res){
      User.find({}, function (err, users) {
        res.send(users);
      });
    });

    //Used to remove a user searching by username
    app.post('/users/removeUsers',function(req,res){
      var userToDelete = req.body.username;
      User.findOneAndRemove({'profile.username': userToDelete},function (err, users) {
        if (err){
          console.log('Usuário:'+userToDelete+' informado para deletar não existe!');
          res.send({'status':'bad'});
        }
        else{
          res.send({'status':'ok'});
          console.log('Usuário:'+userToDelete+' deletado!');
        }
      });
    });

    //Used to add users based on info filled
    app.post('/users/addUsers',function(req,res){
      var username = req.body.username
          ,firstname = req.body.firstname
          ,lastname = req.body.lastname
          ,password = req.body.password
          ,mail = req.body.email
          ,admin = req.body.admin;
      User.findOne({ 'profile.username' : username }, function(err, user) {
          if (err)
              return done(err);
          if(user){
            console.log('Usuário informado já existe!');
            res.send({'status':'bad'});
          } else {
              var newUser = new User();

              // set the user's local credentials
              newUser.profile.username    = username;
              newUser.profile.password    = newUser.generateHash(password);
              newUser.profile.firstname   = firstname;
              newUser.profile.lastname    = lastname;
              newUser.profile.mail        = mail;
              newUser.profile.admin       = admin;
              newUser.save(function(err) {
                  if (err)
                      throw err;
                  else {
                    console.log('Usuário cadastrado com sucesso!');
                    res.send({'status':'ok'});
                  }
              });
          }

      });
    });

    //Used to change pass of user
    app.post('/users/changePass',function(req,res){
      var username = req.body.username,
          password = req.body.password;
      User.update({'profile.username': username}, {
          'profile.password': generateHash(password),
          'profile.updated': new Date()
      },function (err, users) {
        if (err){
          console.log('Alteração de senha apresentou um problema!');
          res.send({'status':'bad'});
        }
        else{
          res.send({'status':'ok'});
          console.log('Senha alterada com sucesso!');
        }
      });
    });

    //Used to save light in MONGO
    app.post('/lights/save',function(req,res){
      var lightsToSave = req.body;
      //Create the groups when the user insert the CSV file

      clearDatabase();

      var cfg = new cfgDefault();

      cfg.voltage = 220;
      cfg.numberAlert = 100;

      cfg.save(function (error) {
        if (error)
            throw error;
      });

      CreateGroupsDB(lightsToSave);

      for(var i=0;i<lightsToSave.length;i++){
        var newLight = new Lights();

        newLight.name            = lightsToSave[i].name;
        newLight.deviceAddress   = lightsToSave[i].deviceAddress;
        newLight.MAC             = lightsToSave[i].MAC;
        newLight.TAG             = lightsToSave[i].TAG;
        newLight.LAT             = lightsToSave[i].LAT;
        newLight.LONG            = lightsToSave[i].LONG;
        newLight.group.grupo   = lightsToSave[i].group.grupo;
        // newLight.group.groupC2   = lightsToSave[i].group.groupC2;
        // newLight.group.groupC3   = lightsToSave[i].group.groupC3;
        newLight.status.status   = lightsToSave[i].status.status;
        newLight.status.rssi     = lightsToSave[i].status.rssi;
        newLight.status.dimmer   = lightsToSave[i].status.dimmer;
        newLight.status.current  = lightsToSave[i].status.current;
        newLight.model           = lightsToSave[i].model;

        // console.log('Luminária '+i.toString()+'cadastrado com sucesso!');
        newLight.save(function(err) {
            if (err)
                throw err;
        });
      }
      res.send({'status':'ok'});
      console.log('Luminárias novas cadastradas!');
    });

    //Used to remove a user searching by username
    app.post('/users/removeUsers',function(req,res){
      var userToDelete = req.body.username;
      User.findOneAndRemove({'profile.username': userToDelete},function (err, users) {
        if (err){
          console.log('Usuário:'+userToDelete+' informado para deletar não existe!');
          res.send({'status':'bad'});
        }
        else{
          res.send({'status':'ok'});
          console.log('Usuário:'+userToDelete+' deletado!');
        }
      });
    });

    //Used to get lights on mongo and list on list.ejs
    app.get('/lights/getLights',function(req,res){
      Lights.find({}, function (err, lights) {
        res.send(lights);
      });
    });

    //Used to get groups on mongo and show in dash.ejs
    app.get('/groups/getGroups',function(req,res){
      LightsGroup.find({}, function (err, groups) {
        res.send(groups);
        Mgroups = groups;
      });
    });

    //Used to get groups on mongo and show in dash.ejs
    app.get('/groups/getGroupsList',function(req,res){
      Lights.find({}, function (err, data) {
        var treeData = [],
            indexData = 1;
        for (var i = 0; i < Mgroups.length; i++) {
          treeData.push({
            "DemographicId":Mgroups[i].name,
            "ParentId":null,
            "Grupo":Mgroups[i].name,
            "Potência":Mgroups[i].current*Mgroups[i].voltage,
            "Status":null
          });
          indexData++;
        }
        for (var j = 0; j < data.length; j++) {
          treeData.push({
            "DemographicId":indexData,
            "ParentId":data[j].group.grupo,
            "Grupo":data[j].TAG,
            "Potência":data[j].status.current*Mgroups[0].voltage,
            "Status":data[j].status.status
          });
          indexData++;
        }
        res.send(treeData);
      });
    });

    //Used to set dimmer in lights in MONGO
    app.post('/lights/setLights',function(req,res){
      var TAGLight = req.body.light,
          dimmer = req.body.dimmer;
      console.log(TAGLight);
      console.log(dimmer);

      Lights.update({'TAG': TAGLight}, {
          'status.dimmer': Number(dimmer)
      },function (err, light) {
        console.log(light);
        if (err){
          console.log('Alteração de dimmer apresentou um problema!');
          res.send({'status':'bad'});
        }
        else{
          mqtt.setDimmerLight(dimmer,TAGLight);
          res.send({'status':'ok'});
          console.log('Valor de dimmer da luminária foi atualizado!');
        }
      });
    });

    //Used to save alarms in MONGO
    app.post('/alarms/save',function(req,res){
      var alarmToSave = req.body;
      //Create the groups when the user insert the CSV file
      Alarms.findOne({'time': alarmToSave.timeAlarm,'group': alarmToSave.group},function (err, alarm) {
        if (!alarm){
          var newAlarm = new Alarms();
          newAlarm.time            = alarmToSave.timeAlarm;
          newAlarm.group           = alarmToSave.group;
          newAlarm.dimmer          = alarmToSave.dimmer;

          // console.log('Luminária '+i.toString()+'cadastrado com sucesso!');
          newAlarm.save(function(err) {
              if (err)
                  throw err;
          });
          timer.activeTime(newAlarm);
          res.send({'status':'ok'});
          console.log('Alarme novo cadastrado!');
        }
        else{
          res.send({'status':'Alarme já existe'});
          console.log('Alarme já existe!');
        }
      });
    });

    //Used to get alarms on mongo and list on time.ejs
    app.get('/alarms/getAlarms',function(req,res){
      Alarms.find({}, function (err, alarms) {
        res.send(alarms);
      });
    });

    //Used to get alarms on mongo and list on dash.ejs
    app.post('/alarms/getAlarmsLast',function(req,res){
      var group = req.body.group;
      Alarms.find({'group' : group}, function (err, alarms) {
        res.send(alarms);
      });
    });

    //Used to remove an alarm searching by dimmer,group,time
    app.post('/alarms/removeAlarms',function(req,res){
      var dimmer = req.body.dimmer,
          time = req.body.time,
          group = req.body.group;
      Alarms.findOneAndRemove({'time': time,'dimmer': dimmer,'group': group},function (err, alar) {
        if (err){
          console.log('Alarme informado para deletar não existe!');
          res.send({'status':'bad'});
        }
        else{
          res.send({'status':'ok'});
          timer.deleteAlarm(alar._id);
          console.log('Alarme deletado!');
        }
      });
    });

    //Used to get power of the groups
    app.post('/log/getPower',function(req,res){
      var powerGroup = req.body,
          groupsPower = [];
      // console.log("REQUISIÇÃO:"+currentGroup);

      async.each(powerGroup,function(data, callback){  //WE NEED TO USER ASYNC BECAUSE ALL QUERIES IN MONGO AS ASYNC AND WE NEED TO JOIN ALL DATA IN ONE POST REQUEST HTTP
          logPower.findOne({'group':data}).sort({ 'power.time' : -1 }).exec(function (err, powerFromMongo) {
            if (powerFromMongo) {
              groupsPower.push(powerFromMongo);
            }
            callback(err);
          });
        },function(err){
          res.send(groupsPower);
      });
    });

    //Used to save dimmer in groups in MONGO
    app.post('/groups/setDimmer',function(req,res){
      var group = req.body.group,
          dimmer = req.body.dimmer;

      console.log(req.body);
      LightsGroup.update({'name': group},{'dimmer': dimmer},function (err, dimmers) {
        if (err){
          console.log('Alteração de dimmer apresentou um problema!');
          console.log('Erro de conexao.', err);
          res.send({'status':'bad'});
        }
        else{
          mqtt.setDimmerLightGroup(dimmer,group);
          console.log();
          res.send({'status':'ok'});
          console.log('Dimmer alterado com sucesso!');
        }
      });

    });

    //Used to get default cfg in MONGO
    app.get('/cfg/defaultCfg',function(req,res){
      cfgDefault.find({},function (err, cfg) {
        if (err){
          // console.log('Alteração de dimmer apresentou um problema!');
          console.log('Erro de conexao.', err);
          res.send({'status':'bad'});
        }
        else{
          res.send(cfg);
          // console.log('Dimmer alterado com sucesso!');
        }
      });
    });

    //Used to save cfg default in MONGO
    app.post('/cfg/save',function(req,res){
      var data = req.body;

      cfgDefault.update({'idCFG': 'unica'}, {
          'voltage': data.voltage,
          'numberAlert': data.numberAlert,
          'emailAlert': data.emailAlert,
          'timeEmailAlert': data.timeEmailAlert,
          'slackToken': data.slackToken,
          'botSlack': data.botSlack,
          'channelSlack': data.channelSlack
      },function(err) {
          if (err)
              throw err;
          else {
              for (var i = 0; i < Mgroups.length; i++) {
                Mgroups[i]
                LightsGroup.update({'name':Mgroups[i].name}, {
                  'voltage': data.voltage}
                  ,function(err,callData){

                });
              }
              res.send({'status':'ok'});
          }
      });
    });

    //Used to get the server time
    app.get('/time/getServerTime',function(req,res){
      var data = new Date();
      res.send(data);
    });
};

//Delete all data of mongodb
function clearDatabase(){
  //We need to delete all data from mongodb
  Alarms.remove({}, function(err, user) {
    if (err)
        throw err;
  });

  Lights.remove({}, function(err, user) {
    if (err)
        throw err;
  });

  LightsGroup.remove({}, function(err, user) {
    if (err)
        throw err;
  });

  logPower.remove({}, function(err, user) {
    if (err)
        throw err;
  });

  cfgDefault.remove({},function (err,cfg) {
    if (err)
        throw err;
  });
}

//Get in a array the names of different groups in CSV
function GetGroups(massiveData){
  var uniqueNames = [];
  for(i = 0; i< massiveData.length; i++){
      if(uniqueNames.indexOf(massiveData[i].group.grupo) === -1){
          uniqueNames.push(massiveData[i].group.grupo);
      }
  }
  return uniqueNames;
}

//Function to create the groups in database
function CreateGroupsDB(lights){
  var groupsNames = GetGroups(lights);
  var active = 0;
  var offline = 0;

  for(var i=0;i<groupsNames.length;i++){
    var groups = new LightsGroup();

    groups.name = groupsNames[i];
    // groups.temperature = 35;
    // groups.dimmer = '100';
    // groups.current = 2000;
    // groups.power = 100;
    for(var j=0;j<lights.length;j++){
      if(lights[j].group.grupo == groupsNames[i]){
        if(lights[j].status.status == '1'){
          active++;
        }
        else {
          offline++;
        }
        groups.lights.push({'tag':lights[j].TAG,'deviceAddress':lights[j].deviceAddress})
      }
    }

    groups.active = active;
    groups.offline = offline;
    active = 0;
    offline = 0;
    groups.save(function(err) {
        if (err)
            throw err;
    });
  }
  console.log('Grupos criados com sucesso!');
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
