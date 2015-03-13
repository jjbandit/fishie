Meteor.methods({
	setGhostLesson: function(lessonObj) {
		Lessons.update(lessonObj._id, {$set: {ghost: true}});
	}
});
