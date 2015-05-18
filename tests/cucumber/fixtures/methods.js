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
	},


	'fixtures/user/createDefault': function(user) {
		Meteor.users.remove({});
		Accounts.createUser(user);
	}
});

})();
