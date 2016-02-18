var exports = module.exports = {};
var mongoose = require('mongoose');

var address = process.env.MONGODBPORT27017TCPADDR;
var port = process.env.MONGODBPORT27017TCPPORT;

mongoose.connect("mongodb://" + address + ":" + port + "/lightdna");
//mongoose.connect('mongodb://localhost:27017/lightdna'); // connect to our database

module.exports = exports = mongoose;
