var mongoose = require('mongoose');

var lightsMin = ({
  tag: {
      type: String,
      required: true
  },
  deviceAddress: {
      type: String,
      required: true
  }
});

var groups = {
  name: {
      type: String,
      required: true
  }
  ,voltage: {
      type: Number,
      default: 220
  }
  ,dimmer: {
      type: Number,
      default: 100
  }
  ,current: {
      type: Number,
      default: 0
  }
  ,power: {
      type: Number,
      default: 0
  }
  ,active: {
      type: Number,
      default: 0
  }
  ,offline: {
      type: Number,
      default: 0
  }
  ,lights: [lightsMin]
};

module.exports = mongoose.model('groups', groups);
//
// module.exports = new mongoose.Schema(groupMasterSchema);
// module.exports.groupMasterSchema = groupMasterSchema;
