Fishie = {}

Fishie.getTimeBlocks = function(firstTime, lastTime){
	var timeSpan = lastTime.getTime() - firstTime.getTime();
	// returns one block per 15 minute increment
	var timeBlocks = (Math.round(timeSpan / 60000) + 1) / 15;
	var timeAry = [];
	for (var i = 0; i < timeBlocks; i++) {
		var blockTime = new Date();
		// set the current blocks time to the time of the first class
		// plus offset it by the number of 15 minute increments we've been through
		blockTime.setTime(firstTime.getTime() + (1000 * 60 * 15 * i));
		timeAry.push(blockTime.toLocaleTimeString());
	};
	return timeAry;
}
// This method should check if there are any instructors with open time blocks
// and create a new one if it fails to find one
Fishie.scheduleLesson = function(lessonID) {
	var lessonObj = Lessons.findOne(lessonID);
	var lessonTime = lessonObj.lessonTime;
	Fishie.addLessonToInstr(Instructors.findOne()._id, lessonTime);
	// This should return any objects not containing the indexes in lessonTime
	var availableInstructors = Instructors.find({lessons: {$not: {$all: lessonTime }}}).fetch();
	console.log(availableInstructors);
	if (availableInstructors.length == 0) {
		Fishie.newInstructor(lessonTime);
	}
}
//
Fishie.addLessonToInstr = function(instrID, lessonTime) {
	Instructors.update(instrID, {$push: {lessons: {$each: lessonTime}}});
}
// This inserts a new instructor record into the Instructors collection
// optionally supply a lesson._id string to initialize the Instructor.lesson property
Fishie.newInstructor = function(instrID, lessonID) {
	var lessonTime = [];
	if (lessonID) {
		lessonTime = Lessons.findOne(lessonID).lessonTime;
	}
	Instructors.insert({
		lessons: lessonTime,
	});
}
