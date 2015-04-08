Template.selectSet.helpers({
	lessonSet: function() {
		var uid = Meteor.userId();
		return LessonSets.find({owner: uid}).fetch();
	}
});
