Router.route('/display-set', function () {
	this.render('display-set');
});

Router.route('/display-set/:_id', function () {
	console.log(this.params);
	this.render('display-set', {
		data: function () {
			var v = LessonSets.findOne({_id: this.params._id});
			console.log(v);
			return v;
		}
	});
});

Router.route('/', function () {
	this.render('home');
});

Router.route('/build-set', function () {
	this.render('build-set');
});
