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
// Pass this method two date objects to get the number of blocks between them
// Optionally send it an array of integers 0-6 (sun-sat) for it to return blocks
// for each day of the week
Fishie.getTimeBlocks = function(firstTime, lastTime, weekdays) {
	var timeSpan = lastTime.getTime() - firstTime.getTime();
	// returns one block per 15 minute increment
	var timeBlocks = (Math.round(timeSpan / 60000) + 1) / 15;
	var timeAry = [];
	for (var w = 0; w < weekdays.length; w++) {
		for (var t = 0; t < timeBlocks; t++) {
		var blockTime = new Date();
		var currentDay;
		var distance;
			// set the current blocks time to the time of the first class
			// plus offset it by the number of 15 minute increments we've been through
			blockTime.setTime(firstTime.getTime() + (1000 * 60 * 15 * t));
			currentDay = blockTime.getDay();
			distance = weekdays[w] - currentDay;
			blockTime.setDate(blockTime.getDate() + distance);
			timeAry.push(blockTime);
		};
	};
	return timeAry;
}

Fishie.getSplitLessons = function(lessonTime, level) {
	var splitLevels = getSplitLevels(level);
	splitCandidates = Lessons.find({lessonTime: lessonTime, levels: {$in: splitLevels} }).fetch();
	return splitCandidates;
}

var getSplitLevels = function(level) {
	// return an array containing values for each level the candidate may be split with
	var splitAry = [];
	if (level > 10) {
		splitAry = lookupPre(level);
	} else {
		splitAry = lookupSK(level);
	}
	return splitAry;
}

var lookupPre = function(level){
	// TODO MAKE THESE DYNAMIC/SUCK LESS
	console.log('lookup preschool!');
	switch(level) {
		case 11:
			return [12];
		case 12:
			return [11, 13];
		case 13:
			return [12, 14];
		case 14:
			return [13, 15];
		case 15:
			return [14, 16];
		case 16:
			return [15, 17];
		case 17:
			return [16, 18];
		case 18:
			return [17];
		default:
			return [-1];
	}
}
var lookupSK = function(level){
	console.log('lookup SK!');
	switch(level) {
		case 1:
			return [2];
		case 2:
			return [1, 3];
		case 3:
			return [2, 4];
		case 4:
			return [3];
		case 5:
			return [6];
		case 6:
			return [5];
		case 7:
			return [8, 9, 10];
		case 8:
			return [7, 9, 10];
		case 9:
			return [7, 8, 10];
		case 10:
			return [7, 8, 9];
		default:
			return [-1];
	}
}
