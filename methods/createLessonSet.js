Meteor.methods({
	createLessonSet: function (weekdays) {
		var newSetID = new Mongo.ObjectID();
		var newSetID_str = newSetID._str;
		LessonSets.insert({_id: newSetID_str, weekdays: weekdays, owner: Meteor.userId()});
	}
});
