Fishie = {}

// This method checks if there are any instructors with open time blocks
// and create a new one if it fails to find one
Fishie.scheduleLesson = function(lessonID) {
	var lessonObj = Lessons.findOne(lessonID);
	var lessonTime = lessonObj.lessonTime;
	// Return any insturctors not working at the new time
	var availableInstructors = Instructors.find({
		lessonTimes: {
			$nin: lessonTime
		}
	}).fetch();
	// If we found no instructors create a new one
	if (availableInstructors.length == 0) {
		Fishie.newInstructor(lessonObj);
	} else {
		// otherwise assign the class to the first instructor found
		var instrID = availableInstructors[0]._id;
		Fishie.addLessonToInstr(instrID, lessonObj);
		// and update the class so we can search for/render breaks easily
		Lessons.update(lessonID, {$set: {instructor: instrID}});
	}
}
//
Fishie.addLessonToInstr = function(instrID, lessonObj) {
	Instructors.update(
		instrID, {
			$push: {
				lessonTimes: {
					$each: lessonObj.lessonTime
				},
				lessonList: lessonObj._id,
			}
		}
	);
}
// This inserts a new instructor record into the Instructors collection
// optionally supply a lesson object to initialize the lessonTime property
Fishie.newInstructor = function(lessonObj) {
	// generate an ID string for the new instructor
	var _id = new Meteor.Collection.ObjectID()._str;
	if (!lessonObj) {
		var lessonTime = [];
		var lessonList = [];
	}
	Instructors.insert({
		_id: _id,
		lessonTimes: lessonObj.lessonTime,
		lessonList: [lessonObj._id],
	});
	// update the lesson so we can easily search for/render breaks preceeding it
	Lessons.update(lessonObj._id, {$set: {instructor: _id}});
}
// pass this method two date objects to get the number of blocks between them
Fishie.getTimeBlocks = function(firstTime, lastTime) {
	var timeSpan = lastTime.getTime() - firstTime.getTime();
	// returns one block per 15 minute increment
	var timeBlocks = (Math.round(timeSpan / 60000) + 1) / 15;
	var timeAry = [];
	for (var i = 0; i < timeBlocks; i++) {
		var blockTime = new Date();
		// set the current blocks time to the time of the first class
		// plus offset it by the number of 15 minute increments we've been through
		blockTime.setTime(firstTime.getTime() + (1000 * 60 * 15 * i));
		timeAry.push(blockTime);
	};
	return timeAry;
}
