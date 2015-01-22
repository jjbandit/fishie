Fishie = {};

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
};

Fishie.findInstructor = function(lessonID) {
	var lessonObj = Lessons.findOne(lessonID);
	var lessonTime = lessonObj.time;
	// This should return any objects not containing the indexes in lessonTime
	var instrObjs = Instructors.find({ lessons: 'a' }).fetch();
	return 'a';
}
