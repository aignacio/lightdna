var mongoose = require('mongoose');

var logPower = {
  group:{
    type: String
  },
  power: {
    value: { type: Number }
    ,time: { type: Date ,default: Date.now }
  }
};

module.exports = mongoose.model('logPower', logPower);
//
// module.exports = new mongoose.Schema(groupMasterSchema);
// module.exports.groupMasterSchema = groupMasterSchema;
