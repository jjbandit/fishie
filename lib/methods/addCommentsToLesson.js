Meteor.methods({
	addCommentsToLesson: function (lessonObj, comments) {
		Lessons.update(lessonObj._id, {$set: {comments: comments}});
	}
});
