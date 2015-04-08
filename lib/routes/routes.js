// use the loading template
Router.onBeforeAction('loading');

Router.route('createOrSelectSet', {
		path: '/',
		layoutTemplate: 'mainLayout',
});

Router.route('set', {
		path: '/set',
		template: 'selectSet',
		layoutTemplate: 'mainLayout'
});

Router.route('setShow', {
		path: '/set/:_id',
		template: 'setShow',
		layoutTemplate: 'mainLayout',
		waitOn: function () {
			return [
				Meteor.subscribe("lessonSets"),
				Meteor.subscribe("instructors"),
				Meteor.subscribe("lessons")
			];
		},
		data: function () {
			var v = LessonSets.findOne({_id: this.params._id});
			return v;
		}
});

Router.route('/build-set', function () {
	this.render('build-set');
});
