var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var session = require('express-session');
var passport = require('passport'); // тут тоже подключаем passport, а также в routere где мы его используем, а сдесь мы его инициализируем после мидлверы session
var passportHttp = require('passport-http');

var expressValidator = require('express-validator');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// use express-session
app.use(session({
	secret: 'verysecretstring',
	resave: false,
	saveUninitialized: true
}));

// инициализируем passport именно после express-session
app.use(passport.initialize());
app.use(passport.session());

// use connect-flash && express-messages
// смотреть доку, вроде как express-messages и connect-flash вместе как-то связаны, а также чтобы всё это работало нужно подключить express-session
// смотри как использовать это в моём проекте usingNodejs, там я использовал шаблонизатор pug и он поддерживает использвание javascript внутри себя
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
// 	res.locals.messages = require('express-messages')(req, res);
// 	next();
// });

// а сдесь мы используем handlebars, он не поддерживает js, поэтому нам нужно сделать не много подругому
app.use(require('connect-flash')());
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash("success_msg"); // ну также определяем глобальные переменные и выводим их в шаблоне, в нашем случае в layout
	res.locals.error_msg = req.flash("error_msg"); // а передаём их значения через router
	res.locals.error = req.flash("error"); // так же сделаем переменную для passporta, это не часть passporta(и это не обязательно), просто мы в нашем приложении выводим flash-сообщения при различных событиях, например при таких как успешная авторизация или неуспешная и т.д.
	res.locals.user = req.user || null; // это глобальная переменная user будет у нас доступна, только если мы авторизовались, если нет то null, тоесть когда мы авторизовались, тоесть мы получили юзера и теперь используем например в inedex.hbs или layout.hbs
	next();
});

// use express-validator https://devhub.io/repos/theorm-express-validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.');
		var root = namespace.shift();
		var formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));


app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
