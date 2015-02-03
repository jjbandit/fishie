Fishie = {}
Fishie.scheduleLesson = function(lessonID) {
// This method checks if there are any instructors with open time blocks
// and create a new one if it fails to find one
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
Fishie.parseLessonObject = function(_idString, level, privateLesson, swimmers, maxSwimmers, lessonTime, length) {
	o = {
		_id: _idString,
		levels: [level],
		privateLesson: privateLesson,
		split: false,
		instructor: '',
		swimmers: [swimmers],
		maxSwimmers: maxSwimmers,
		lessonTime: lessonTime,
		length: length,
	}
	return o;
}
Fishie.newInstructor = function(lessonObj) {
	// This inserts a new instructor record into the Instructors collection
	// optionally supply a lesson object to initialize the lessonTime property
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
Fishie.getSplitCandidatesForLesson = function (lessonObj, excludeIDs, rootLevel, direction) {
	// rootLevel gets passed in to keep track of the root class level we're searching for
	// needs to be flattened in case levels: gets passed in as an array
	l = _.union(lessonObj.levels, rootLevel);
	excludeLevels = _.flatten(l);
	if (direction == 1) {
		var levelToSearch = [Math.max.apply(Math, lessonObj.levels) + 1];
	} else if (direction == -1) {
		var levelToSearch = [Math.min.apply(Math, lessonObj.levels) - 1];
	} else if (direction == 0) {
		var levelToSearch = [Math.min.apply(Math, lessonObj.levels) - 1 , Math.min.apply(Math, lessonObj.levels) + 1]
	}
// console.log(excludeLevels);
// console.log(levelToSearch);
// console.log('gettingSplitCandidate for');
// console.log(lessonObj);
	var splitCandidates = Lessons.find({
		$and: [
			{_id: {$nin: excludeIDs}},
			{levels: {$in: levelToSearch}},
			{levels: {$nin: excludeLevels}},
			{lessonTime: lessonObj.lessonTime},
		]
	}).fetch();
// console.log('gotem');
// console.log(splitCandidates);
	if (splitCandidates.length == 0) {console.log('EMPTY!!!!!!!!!!!!!!!!!!!!')};
	return splitCandidates;
}
Fishie.optimizeSplits = function(splitCandidates, rootLevel, direction, path){
	var firstPass = false;
	if (!path) {
		var path = [];
		firstPass = true;
	}
	if (splitCandidates.length > 0) {
		for (var i = 0; i < splitCandidates.length; i++) {
			if (splitCandidates[i].levels.length > 1 || firstPass == true) {
				excludeIDs.push(splitCandidates[i]._id);
				var recurseSplits = Fishie.getSplitCandidatesForLesson(splitCandidates[i], excludeIDs, rootLevel, direction);
				if (recurseSplits.length > 0) {
				// console.log('recurse -----------------');
					var f = Fishie.optimizeSplits(recurseSplits, rootLevel, direction, path);
					if (f) {
						path.push(splitCandidates[i]);
						return path;
					} else {
						continue;
					}
				}
			} else {
			// console.log('foundAnEndpoint!~~~~~~~~~~~~~~~~~~~~~~~');
			// console.log(splitCandidates[i]);
				path.push(splitCandidates[i]);
				return path;
			}
		}
	}
	return false;
}
Fishie.condenseLessons = function (path, lessonID) {
	// lessonID is the ID of the lesson we're creating -- Don't do anything with this lesson object
	// in the path[] because it doesn't exist in the database
// console.log('condensing!');
// console.log(path);
	// Extract arrays of levels and swimmers in the path
	var pathLevels = [];
	var pathSwimmers = [];
	for (var p = 0; p < path.length; p++) {
		for (var l = 0; l < path[p].levels.length; l++) {
			pathLevels.push(path[p].levels[l]);
			pathSwimmers.push(path[p].swimmers[l]);
		};
	};
	// zip the two arrays together so we preserve level->swimmers relationship through
	// the sort
	var zippedAry = _.zip(pathLevels, pathSwimmers);
	zippedAry.sort(function (a, b){return a[0]-b[0]});
	// console.log(zippedAry.splice());
	// remove the index of the lesson we're condensing from path because it doesnt
	// exist in the db
	for (var p = 0; p < path.length; p++) {
		if (path[p]._id == lessonID) {
			path.splice(p, 1);
			break;
		}
		// console.log(path);
	};
	// Validate that we're not going to create a new class with too many swimmers
	var pathLength = path.length;
	for (var i = 0; i < pathLength; i++) {
		// reverse the array contining level->swimmer pairs so when we test for
		// maxSwimmers it tests for the smallest value instead of the largest
		var rZippedAry = zippedAry.slice().reverse();
		var swmrs = [];
		var swimmersTotal = 0;
		for (var z = i*2; z < i*2+2; z++) {
		swimmersTotal = swimmersTotal + zippedAry[z][1];
			if (swimmersTotal > Fishie.getMaxSwimmers(rZippedAry[z][0])) {
				throw new Error("Invalid lesson sizes in path");
				return false;
			}
		}
	// console.log(swimmersTotal);
	};
	// Update remaining lessons in path[] (those that exist in the db) with their new
	// level + swimmers
	for (var i = 0; i < path.length; i++) {
		var lvls = [];
		var swmrs = [];
		for (var z = 0; z < 2; z++) {
			lvls.push(zippedAry[z][0]);
			swmrs.push(zippedAry[z][1]);
		};
		Lessons.update(path[i]._id, {$set: {levels: lvls, swimmers: swmrs}});
		zippedAry.splice(0, 2);
	};
	// console.log(path);
	return true;
}
Fishie.trimSplits = function(splitCandidates) {
	// This function should return a single valid lesson to split the new lesson with if one exists
	returnAry = [];
	for (var i = 0; i < splitCandidates.length; i++) {
		// This loop eliminates classes that have already been split
		// console.log(splitCandidates[i].levels);
		if (splitCandidates[i].levels.length > 1) {
			continue;
		}
		returnAry.push(splitCandidates[i]);
	};
	return returnAry;
}
Fishie.getTimeBlocks = function(firstTime, lastTime, weekdays) {
	// Pass this method two date objects to get the number of blocks between them
	// Optionally send it an array of integers 0-6 (sun-sat) for it to return blocks
	// for each day of the week
	var timeSpan = lastTime.getTime() - firstTime.getTime();
	// returns one block per 15 minute increment
	var minutes = (timeSpan / 60000) + 1;
	var timeBlocks = Math.round(minutes) / 15;
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
var getSplitLevels = function(level) {
	// return an array containing values for each level the candidate may be split with
	var splitAry = [];
	if (level > 10) {
		splitAry = lookupPreLvl(level);
	} else {
		splitAry = lookupSKLvl(level);
	}
	return splitAry;
}
Fishie.getMaxSwimmers = function(level) {
	// TODO MAKE THIS LESS BAD
	if (level > 10) {
		return 5;
	} else if (level > 6) {
		return 10;
	} else if (level > 4) {
		return 8;
	} else {
		return 6;
	}
}
var lookupPreLvl = function(level){
	// TODO MAKE THESE DYNAMIC/SUCK LESS
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
var lookupSKLvl = function(level){
	// TODO ADD THIS TO A CONFIG PAGE
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
