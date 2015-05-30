Template.weekdaySelector.helpers({
	setWeekday: function (setId) {
		var setObj = LessonSets.findOne(setId);
		return setObj.weekdays;
	}
});
