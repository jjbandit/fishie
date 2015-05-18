Meteor.methods({
	createLessonSet: function (weekdays, setId) {
		return LessonSets.insert({
			_id: setId,
			weekdays: weekdays,
			owner: Meteor.userId(),
			instructorList: []
		});
	}
});
