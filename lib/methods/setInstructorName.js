Meteor.methods({
	setInstructorName: function (instrObj, name) {
		Instructors.update(instrObj._id, {$set: {name: name}});
	}
});
