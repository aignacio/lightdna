var mongoose = require('mongoose');

var groupSchema = {
  grupo: {
      type: String,
      ref: 'groups'
  }
  ,groupC2: {
      type: String,
      ref: 'groups'
  }
  ,groupC3: {
      type: String,
      ref: 'groups'
  }
};

module.exports = new mongoose.Schema(groupSchema);
module.exports.groupSchema = groupSchema;
