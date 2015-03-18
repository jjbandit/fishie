Meteor.methods({
	createLessonSet: function (setID, weekdays) {
		LessonSets.insert({_id: setID._str, weekdays: weekdays, owner: Meteor.userId()});
	}
});
