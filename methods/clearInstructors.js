Meteor.methods({
	clearAllInstructors: function() {
		Instructors.remove({});
	},
});
