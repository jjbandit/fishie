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
	var instrObjs = Instructors.find({lessons: {$not: {$all: lessonTime }}}).fetch();
	if (instrObjs.length < 1) {console.log('yay');}
	console.log(instrObjs);
}
//
Fishie.addLessonToInstr = function(instrID, lessonTime) {
	Instructors.update(instrID, {$push: {lessons: {$each: lessonTime}}});
}
//
Fishie.newInstructor = function(instrID) {
	Instructors.insert({
		lessons: [],
	});
}
