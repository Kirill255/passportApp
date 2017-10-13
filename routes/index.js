var express = require('express');
var router = express.Router();

var User = require("../models/user");

// подключаем passport
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// создаём новую стратегию для passport (пример почти как в доке, переделываем под нашу базу данных)
passport.use(new LocalStrategy(function(username, password, done) {
	// запрашиваем в базе username пользователя
	User.getUserByUsername(username, function (err, user) {
		if (err) { 
			return done(err); 
		}
		// если нет такого
		if (!user) {
			return done(null, false, { message: 'Wrong Username or Password.' }); // лучше писать тут что не правильный или логин или пароль вместе, а не только неправильный логин, что бы нельзя было подбирать, так как если вы пишите что неправильный именно логин, то человек понимает что пароль то правильный, и остаётся подобрать только логин, а так у нас неопределённость, или то или то неправльно, мы точно не указываем, пусть угадывают
		}
		// если есть такой, то теперь сравниваем пароль, пароль который ввели в форму с паролем который к нам пришёл из базы user.password (мы запросили пользователя, и если он существует, он нам вернулся из базы со всеми существующими полями(согласно нашей схеме), и теперь мы сравниваем его поле user.password с переданным password при попытке входа)
		User.comparePassword(password, user.password, function(err, isMatch) {
			if (err) { 
				return done(err); 
			}
			// если совпадают
			if (isMatch) {
				return done(null, user);
			} else {
				return done(null, false, { message: 'Wrong Username or Password.' }); // лучше писать тут что не правильный или логин или пароль вместе, а не только неправильный пароль, что бы нельзя было подбирать, так как если вы пишите что неправильный именно пароль, то человек понимает что логин то правильный, и остаётся подобрать только пароль, а так у нас неопределённость, или то или то неправльно, мы точно не указываем, пусть угадывают
			}
		});
	});
}));

// а также настраиваем passport (подстраиваем под нашу базу)
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


/* GET home page. */ // мидлвер ensureAuthenticated объявлен у нас внизу
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('index', { title: 'DashBoard' });
});

// форма логина
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

// получение данных из формы логина
router.post('/login', function(req, res, next) {
	// юзаем passport (пример почти как в доке)
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true 
	})(req, res, next);

	// var username = req.body.username;
	// var password = req.body.password;

});

// получить страницу register (форма регистрации)
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

// получить данные со страницы register через форму методом POST
router.post('/register', function(req, res, next) {
	// console.log(req.body);
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var passwordConfirm = req.body.passwordConfirm;

	req.checkBody("name", "Name is required").notEmpty(); 
	req.checkBody("username", "Username is required").notEmpty(); 
	req.checkBody("email", "Email is required").notEmpty();
	req.checkBody("password", "Password is required").notEmpty();
	req.checkBody("passwordConfirm", "Passwords do not match").notEmpty();

	var errors = req.validationErrors();

	if (errors) {
		console.log("errors: ", errors);
		res.render('register', {
			title: 'Register',
			errors: errors
		});	
	} else {
		var newUser = new User();
		newUser.name = name;
		newUser.username = username;
		newUser.email = email;
		newUser.password = password;

		// или можно вот так ещё 
		// var newUser = new User({
		// 	name: name,
		// 	username: username,
		// 	email: email,
		// 	password: password
		// });
		

		User.registerUser(newUser, function(err, user) {
			if (err) {
				console.log(err);
				throw err;
			} else {
				req.flash("success_msg", "You are registered and can log in");
				res.redirect("/login");
			}
		});
	}
});

// разлогиниться
router.get('/logout', function(req, res, next) {
	req.logout();
	req.flash("success_msg", "You are logged out");
 	res.redirect("/login");
});


// создадим мидлвер, для проверки авторизваны мы или нет, если нет то нас всегда будет перекидывать на страницу логина, тоесть если мы перешли на какую-то страницу, для доступа к которой нужно быть залогиненым, а мы не залогинены, то нас перекинет на страницу логина, создаём кароче этот мидлвер и передаём его вторым параметром во все router'ы для которых нам необходима авторизация
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { // isAuthenticated() это вроде как метод passport'а
		return next();
	} else {
		req.flash("error_msg", "You are not authorized to view that page");
		res.redirect("/login");
	}
}

module.exports = router;
