Meteor.methods({
	createLessonSet: function (weekdays) {
		var newSetID = new Mongo.ObjectID();
		LessonSets.insert({_id: newSetID, weekdays: weekdays, owner: Meteor.userId()});
	}
});
