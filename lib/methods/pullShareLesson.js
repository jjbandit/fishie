Meteor.methods({
	pullShareLesson: function (parentId, childObj) {
		debugger;
		var childId = childObj._id;
		var parentObj = Lessons.findOne(parentId);

		var parentShares = parentObj.sharesWith;
		parentShares = _.without(parentShares, childId);

		if (parentShares.length !== 0) {
			parentObj.sharesWith = parentShares;
		} else {
			delete parentObj.sharesWith;
		}

		var parentWeekdays = parentObj.weekdays;
		parentWeekdays = _.difference(parentWeekdays, childObj.weekdays);
		parentObj.weekdays = parentWeekdays;

		Lessons.update(parentObj._id, parentObj);

		Lessons.update(childId, {
			$unset: {
				parent: parentId
			},
			$set: {
				instructor: ''
			}
		});
	}
});
