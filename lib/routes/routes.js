// use the loading template
Router.onBeforeAction('loading');

Router.route('createOrSelectSet', {
		path: '/',
		controller: ApplicationController,
		layoutTemplate: 'mainLayout',
});

Router.route('setCreate', {
		path: '/set/create',
		controller: ApplicationController,
		template: 'createSet',
		layoutTemplate: 'mainLayout'
});

Router.route('set', {
		path: '/set',
		controller: ApplicationController,
		template: 'selectSet',
		layoutTemplate: 'mainLayout'
});

Router.route('setShow', {
		path: '/set/:_id',
		controller: SetController,
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

Router.route('/not-found');
