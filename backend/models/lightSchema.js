var mongoose = require('mongoose');
var status = require('./lightStatus');
var group  = require('./groupSchema');

var lightSchema = new mongoose.Schema({
  name: { type: String, required: true }
  ,deviceAddress: { type: String, required: true }
  ,MAC: {type: String, required: true}
  ,TAG: {type: String, required: true}
  ,LAT: {type: String, required: true}
  ,LONG: {type: String, required: true}
  ,group: group.groupSchema
  ,status: status.lightStatus
  ,model: {type: String, required: true}
});

// module.exports = new mongoose.Schema(light);
// module.exports.light = light;
// // create the model for users and expose it to our app
// module.exports = mongoose.model('Lights', userSchema);


// create the model for users and expose it to our app
module.exports = mongoose.model('Lights', lightSchema);
