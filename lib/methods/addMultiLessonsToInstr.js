Meteor.methods({
addMultiLessonToInstr: function(instrID, lessonList) {


	//
	// // check if there's an instructor already in the objects instr field
	// // and pull the lessonID from that instructor if there is
	// if (lessonObj.instructor) {
	// 	var oldInstrID = lessonObj.instructor;
	// 	Instructors.update(
	// 		oldInstrID, {
	// 			$pullAll: {
	// 				lessonList: [lessonObj._id],
	// 				lessonTimes: lessonObj.lessonTimes
	// 			}
	// 		}
	// 	);
	// }
	// // then update the Lessons instructor to the new ID
	// lessonObj.instructor = instrID;
	// Lessons.upsert(lessonObj._id, lessonObj);
	// var createDate = new Date();
	// // update the new instructor
	// Instructors.upsert(
	// 	instrID, {
	// 		$setOnInsert: {createdAt: createDate},
	// 		$push: {
	// 		lessonTimes: {
	// 			$each: lessonObj.lessonTimes
	// 		},
	// 		lessonList: lessonObj._id,
	// 		}
	// 	}
	// );
 }
});