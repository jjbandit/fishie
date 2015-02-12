Meteor.methods({
	swapLessons: function(fLessonObj, sLessonObj) {
		var fID = fLessonObj._id;
		var fInstructor = fLessonObj.instructor;
		var fTimes = fLessonObj.lessonTimes;
		var sID = sLessonObj._id;
		var sInstructor = sLessonObj.instructor;
		var sTimes = sLessonObj.lessonTimes;

		var allLessonIDs = _.union([fID], [sID]);
		var allInstructorIDs = _.union([fInstructor], [sInstructor]);
		var allTimes = _.union(fTimes, sTimes);
		var i = Instructors.find({_id:{$in:allInstructorIDs}});
		Instructors.update(
			{
				_id: {
					$in: allInstructorIDs
				}
			},
			{
				$pullAll: {
					lessonList: allLessonIDs,
					lessonTimes: allTimes
				}
			},
			{
				multi: true
			}
		);
		fLessonObj.instructor = '';
		sLessonObj.instructor = '';
		Fishie.addLessonToInstr(fInstructor, sLessonObj);
		Fishie.addLessonToInstr(sInstructor, fLessonObj);
	}
});
