var mongoose = require('mongoose');

var lightStatus = {
  current: { type: Number }
  ,dimmer: { type: Number }
  ,rssi: { type: Number }
  ,status: { type: String }
  ,temperature: { type: Number }
  ,ipv4: { type: String }
  ,time:{ type: Date ,default: Date.now }
};

module.exports = new mongoose.Schema(lightStatus);
module.exports.lightStatus = lightStatus;
