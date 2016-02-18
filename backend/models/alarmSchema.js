var mongoose = require('mongoose');

var alarmSchema = {
  time: {
      type: String,
      required: true
  }
  ,group: {
      type: String,
      required: true
  }
  ,dimmer: {
      type: Number,
      required: true
  }
};

// module.exports = new mongoose.Schema(alarmSchema);
// module.exports.alarmSchema = alarmSchema;
module.exports = mongoose.model('alarms', alarmSchema);
