const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/passportapp', {
	keepAlive: true,
	reconnectTries: Number.MAX_VALUE,
	useMongoClient: true
});


// ну это даже не настройки а просто типа логеры, которые выводят сообщения при определённых событиях

// при соединении с базой в консоль выводится что соединение открыто
mongoose.connection.on("connected", function() {
	console.log("Mongoose default connection open mongodb://localhost/passportapp");
});

// если при соединении с базой произошла ошибка
mongoose.connection.on("error", function(err) {
	console.log("Mongoose default connection error: " + err);
});

// при закрытии соединения с базой, именно когда мы сами закрываем соединение именно базы
mongoose.connection.on("disconnected", function() {
	console.log("Mongoose default connection disconnected");
});

// когда у нас прекратило работать само приложение, нам нужно закрыть и базу, например у нас работает приложение подключённое к базе, и наше приложение упало, поэтому нам нужно самим закрыть соединения с базой
// кароче не понял пока что почему, но при включённом обработчике, процесс открытия соединения на порту (например 3000) остаётся работать, даже после закрытия приложения через консоль, нужно закрывать этот процесс через диспетчер задач, ну или через консоль если знаешь команду, там что вроде(но не точно) kill и номер id процесса, где его взять без понятия, можно посмотреть в дисптцере задач, но тогда зачем писать команду в консоли, если можно сразу в диспетчере и закрыть процесс 
// process.on("SIGINT", function() {
// 	mongoose.connection.close(function() {
// 		console.log("Mongoose default connection disconnected through app termination");
// 	});
// });

// вроде разобрался
process.on("SIGINT", function() {
	mongoose.connection.close(function() {
		console.log("Mongoose default connection disconnected through app termination");
		process.exit(0);
	});
});


module.exports = mongoose;