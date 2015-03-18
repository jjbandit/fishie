Template.selectSet.helpers({
	lessonSet: function() {
		return LessonSets.find().fetch();
	}
});
