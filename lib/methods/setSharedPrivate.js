Meteor.methods ({
	setSharedPrivate: function (parentLesson, childLesson, setID) {
		// check for our sharesWith property and either push
		// in the linked lessons ID or initialize the property
		// with the childLessons ID
		if (parentLesson.sharesWith) {
			parentLesson.sharesWith.push(childLesson._id);
		} else {
			parentLesson.sharesWith = [childLesson._id];
		}

		// Assign parent to child
		childLesson.parent = parentLesson._id;
		childLesson.instructor = parentLesson.instructor;

		parentLesson.weekdays = _.union(parentLesson.weekdays, childLesson.weekdays);
		// Then update the lessons in our collection
		Lessons.update(parentLesson._id, parentLesson);
		Lessons.insert(childLesson);
	}
});
