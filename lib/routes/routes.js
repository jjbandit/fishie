// use the loading template
Router.onBeforeAction('loading');

Router.map ( function () {
	this.route('select-set', {
		path: '/display-set'
	});

	this.route('display-set', {
		path: '/display-set/:_id',
		waitOn: function () {
			return Meteor.subscribe("lessonSets");
		},
		data: function () {
			var v = LessonSets.findOne({_id: this.params._id});
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
