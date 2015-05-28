(function () {

	'use strict';

Meteor.startup(function() {

	if (Meteor.isClient || !process.env.IS_MIRROR) {
		return;
	}
});

Meteor.methods({
	'reset' : function(thing) {
		Lessons.remove({});
		LessonSets.remove({});
		Instructors.remove({});
		Meteor.users.remove({});
		// Meteor.users.remove({});
		// Invalidate all sessions
		// Meteor.users.update({}, {$set: { "services.resume.loginTokens" : [] }}, {multi: true});

	},


	'fixtures/user/createDefault': function(user) {
		Accounts.createUser(user);
	}
});

})();
