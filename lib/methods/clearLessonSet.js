Meteor.methods({
	clearLessonSet: function (setId) {
		LessonSets.remove(setId);
	}
});
