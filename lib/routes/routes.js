// use the loading template
Router.onBeforeAction('loading');

Router.map ( function () {
	this.route('createOrSelectSet', {
		path: '/',
		layoutTemplate: 'mainLayout',
	});
	
	this.route('set', {
		path: '/set',
		template: 'selectSet',
		layoutTemplate: 'mainLayout'
	});

	this.route('setShow', {
		path: '/set/:_id',
		layoutTemplate: 'mainLayout',
		waitOn: function () {
			return Meteor.subscribe("lessonSets");
		},
		data: function () {
			var v = LessonSets.findOne({_id: this.params._id});
			return v;
		}
	});
});

Router.route('/build-set', function () {
	this.render('build-set');
});
