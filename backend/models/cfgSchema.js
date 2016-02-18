var mongoose = require('mongoose');

var cfgSchema = {
  idCFG:{
    type: String,
    required: true,
    default: "unica"
  },
  voltage: {
      type: Number
  }
  ,numberAlert: {
      type: Number
  }
  ,emailAlert: {
      type: String
  }
  ,timeEmailAlert: {
      type: Number
  }
  ,slackToken: {
      type: String
  }
  ,channelSlack: {
      type: String
  }
  ,botSlack: {
      type: String
  }
};

// module.exports = new mongoose.Schema(alarmSchema);
// module.exports.alarmSchema = alarmSchema;
module.exports = mongoose.model('cfg', cfgSchema);
