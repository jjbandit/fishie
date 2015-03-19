Template.weekdaySelector.helpers({
	setWeekday: function (setId) {
		var setObj = LessonSets.findOne(setId);
		return setObj.weekdays;
	},
	checkSetId: function (setId) {
		if (setId){
			return true;
		}
		return false;
	}

});
