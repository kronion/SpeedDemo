/* Mongoose */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/speedDemo');
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
