Meteor.methods({
	clearLessons: function(lessonIDs) {
		lessonIDsLength = lessonIDs.length;
		for (var i = 0; i < lessonIDsLength; i++) {

			var lessonID = lessonIDs[i];
			var lessonObj = Lessons.findOne(lessonID, {owner: Meteor.userId()});
			var lessonTimes = lessonObj.lessonTimes;

			if (lessonObj.parent) {
				Lessons.update( lessonObj.parent, {
					$pullAll: {
						weekdays: lessonObj.weekdays
					},
					$unset: {
						sharesWith: 'value'
					}
				});
				Lessons.remove(lessonID);
				return;
			}

			// Bump sharesWith property into its child if it has one
			if (lessonObj.sharesWith) {
				console.log('sharing!!');
				var childObj = Lessons.findOne(lessonObj.sharesWith[0]);
				delete childObj.parent;
				Instructors.update(childObj.instructor, {
					$pushAll: {
						lessonList: [childObj._id],
						lessonTimes: childObj.lessonTimes
					},
					$unset: {
						parent: 'somevalue'
					}
				});
				Lessons.remove(lessonID);
				return;
			}

			Instructors.update(lessonObj.instructor, {
				$pull: {
					lessonList: lessonID
				},
					$pullAll: {
						lessonTimes: lessonTimes
					}
			});

			// cleanup Instructor if it has no lessons
			var instr = Instructors.findOne(lessonObj.instructor);
			if (instr.lessonList.length == 0) {
				Instructors.remove(lessonObj.instructor);
			}

			Lessons.remove(lessonID);
		};
	},

	// This should probably loop thorugh a Lessons.find cursor
	clearAllLessons: function(setId) {
		Lessons.remove({setId: setId});
		Instructors.remove({set: setId});
	}
});
