var mongoose = require("../data/mongoose");
var bcrypt = require('bcryptjs');


var Schema = mongoose.Schema;

var userSchema = new Schema({
	name: {
		type: String,
		required: [true, "Поле обязательно для заполнения"]
	},
	username: {
		type: String,
		required: [true, "Поле обязательно для заполнения"]
	},
	email: {
		type: String,
		required: [true, "Поле обязательно для заполнения"]
	},
	password: {
		type: String,
		required: [true, "Поле обязательно для заполнения"]
	},
	created_at: { 
		type: Date, 
		default: Date.now 
	}
});

var User = mongoose.model('User', userSchema);

module.exports = User;


// регистрация пользователя
module.exports.registerUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        // Store hash in your password DB.
	        if (err) {
	        	console.log(err);
	        } else {
	        	newUser.password = hash; // в поле password у нового пользователя записываем не сам password, а сгенерированный hash
	        	newUser.save(callback); // сохраняем нового юзера а базу
	        }
	    });
	});
};


module.exports.getUserByUsername = function(username, callback) {
	var query = {username: username};
	User.findOne(query, callback);
};


module.exports.getUserById = function(id, callback) {
	User.findById(id, callback);
};


module.exports.comparePassword = function(candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
	    if (err) {
	    	throw err;
	    } else {
	    	callback(null, isMatch);
	    }
	});
};