Meteor.methods ({
	setSharedPrivate: function (origLesson, linkedLesson) {
		// check fo rour sharesWith property and either push
		// in the linked lessons ID or initialize the property
		// with the linkedLessons ID
		if (origLesson.sharesWith) {
			origLesson.sharesWith.push(linkedLesson._id);
		} else {
			origLesson.sharesWith = [linkedLesson._id];
		}
		origLesson.weekdays = _.union(origLesson.weekdays, linkedLesson.weekdays);
		// Then update the lessons in our collection
		Lessons.update(origLesson._id, origLesson);
		Lessons.insert(linkedLesson);
	}
});
