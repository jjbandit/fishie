Router.route('/display-set', function () {
	this.render('display-set');
});

Router.route('/', function () {
	this.render('home');
});

Router.route('/build-set', function () {
	this.render('build-set');
});
