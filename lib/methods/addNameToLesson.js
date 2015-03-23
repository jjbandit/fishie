Meteor.methods({
	addNameToLesson: function (lessonObj, name) {
		Lessons.update(lessonObj._id, {$set: {name: name}});
	}
});
