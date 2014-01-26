/* Mongoose */
var mongoose = require('mongoose');
var uristring = 'mongodb://localhost/speedDemo';
exports.uristring = uristring;
mongoose.connect(uristring);
var db = mongoose.connection;
exports.connect = db;

var Schema = mongoose.Schema; // Shortens code
exports.ObjectId = mongoose.Types.ObjectId;

/* User schema */
var userSchema = Schema({
  username: String,
  password: String
});
var User = mongoose.model('User', userSchema);
exports.User = User;
