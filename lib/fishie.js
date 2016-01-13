Fishie = {};

Fishie.scheduleLesson = function(lessonObj, setID, instrID) {
  // Redirect privates to second handler and return out if it inserts the lesson.
  if (lessonObj.privateLesson) {
    var b = Fishie.schedulePrivateLesson(lessonObj, setID, instrID);
    if (b) return;
  }
  // This method checks if there are any instructors with open time blocks
  // and create a new one if it fails to find one
  var lessonTimes = lessonObj.lessonTimes;
  // Return any insturctors not working at the new time
  var availableInstructors = Instructors.find({
    owner: Meteor.userId(),
    set: setID,
    lessonTimes: {
      $nin: lessonTimes
    }
  },{sort: {createdAt: 1}}).fetch();
  // If we found no instructors create a new one with the ID we created on the client
  if (availableInstructors.length == 0) {
    Fishie.addLessonToInstr(instrID, lessonObj, setID);
  } else {
    // otherwise assign the class to the first instructor found
    var instrObj = availableInstructors[0];
    Fishie.addLessonToInstr(instrObj, lessonObj, setID);
  }
}
/*
 *  Private lessons require some specific handling since more than one Private lesson
 *  may be taught by the same instructor in the same time block, if the lessons occur
 *  on different days of the week.  To accomodate this we create a new lesson that acts
 *  as a wrapper for all lessons that occur at that time block.
 *
 *  wrapper = {
 *    _id: $WRAPPER_ID,
 *    sharedIds: [ id1, id2, id3 ],
 *
 *    .. regular lessson properties
 *  }
 *
 */
Fishie.schedulePrivateLesson = function (lessonObj, setID, instrID) {
  // This method checks for privates occuring at the same time as the one
  // we're passing in, but not occuring on the same day.
  //
  // If we find one, add a new wrapper lesson and point it to the new lesson
  // we're inserting.
  var setObj = LessonSets.findOne(setID);

  var shareLessons = Lessons.find({
    lessonTimes: {
      $in: lessonObj.lessonTimes
    },
    weekdays: {
      $nin: lessonObj.weekdays
    },

    parent: {          // Privates that have this set already belong to a shared time-block.
      $exists: false   // We're filtering these out because the shared block is the one we
    },                 // want to addin a new lesson to, not its child lessons.

    instructor: {
      $in: setObj.instructorList
    },

    privateLesson: true

  }).fetch();

  // Meteor.call('addLessonToInstr', instrID, lessonObj, setID);
  // return;

  if (shareLessons.length > 0) {
    Fishie.setSharedPrivate(shareLessons[ shareLessons.length -1], lessonObj, setID);
    return true;
  } else {
    return false;
  }
}

Fishie.setSharedPrivate = function (origLesson, linkedLesson, setID) {
  Meteor.call('setSharedPrivate', origLesson, linkedLesson, setID);
}
Fishie.setGhostLesson = function(lessonObj){
  Meteor.call('setGhostLesson', lessonObj);
}
Fishie.setInstructorName = function (instructorObj, name) {
  Meteor.call('setInstructorName', instructorObj, name);
}

Fishie.getTimeBlocks = function(firstTime, lastTime, weekdays) {
  // Pass this method two date objects
  // It returns an array populated with the starting time of each 15 minute block
  // between the date parameters
  // Optionally send it an array of integers 0-6 (sun-sat) for it to additionally
  // return blocks for each day of the week
  // Defaults to sunday if no day is passed in
  if (weekdays == undefined) { weekdays=[0] }
  var timeSpan = lastTime.getTime() - firstTime.getTime();
  // returns one block per 15 minute increment
  var minutes = (timeSpan / 60000);
  var timeBlocks = minutes / 15;
  var timeAry = [];
  for (var w = 0; w < weekdays.length; w++) {
    for (var t = 0; t < timeBlocks; t++) {
      // Standardize returned blocks to a common week and year
      // 1989 starts on a Sunday, which works out nicely for us
      var blockTime = new Date(1989, 0, 6, 0, 0, 0, 0);
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
Fishie.getLeadingBreaks = function(lessonObj) {
  var lessonStartTime = lessonObj.startTime().getTime();
  var instrObj = Instructors.findOne(lessonObj.instructor);

  // If we're inserting a new Instructor
  var instrLessonTimes = instrObj.lessonTimes;

  var prevLessonEndTime;

  // Convert Date objects to a number in preparation to indexOf
  var instrLessonTimes = instrLessonTimes.map( function (timeObj) {
    return timeObj.getTime();
  });
  var blockIndex = instrLessonTimes.indexOf(lessonStartTime);

  // We return an array of blocks (think times) we build with getTimeBlocks
  var blocks = [];
  // If the lesson is not the first one the instructor is teaching
  if (blockIndex > 0) {
    // Get the previous lessons last block
    prevLessonEndBlock = instrLessonTimes[blockIndex - 1];
    // Now add 15 minutes so it represents the end time of the last lesson
    var prevLessonEndTime = new Date(prevLessonEndBlock + 900000);
    // And build the block array
    blocks = Fishie.getTimeBlocks(prevLessonEndTime, lessonObj.startTime());

  // If the lesson is the first one the instructor is teaching
  } else if (blockIndex === 0) {
    // We have to find out what the first time in the set is
    var setObj = LessonSets.findOne(instrObj.set);
    // timeSpan returns a sorted array with blocks for each time there is a lesson
    // in the water during the set, hence timeSpan[0] is the first time in the set
    var timeSpan = setObj.timeSpan();
    blocks = Fishie.getTimeBlocks(timeSpan[0], lessonObj.startTime());
  }
  return blocks;
}
Fishie.getTrailingBreaks = function(lessonObj, alwaysReturn) {
  // alwaysReturn accepts a boolean which toggles behavior to return breaks
  // based on the lessons position in the instructorList -- Default true
  // If alwaysReturn is passed in false the method will only return if the lesson
  // passed in is the last lesson the instructor is teaching
  // NOTE this logic is pretty retarted, but it makes it easy to call the method, so w/e
  if (alwaysReturn == undefined) {
    alwaysReturn = true;
  }
  var instrObj = Instructors.findOne(lessonObj.instructor);

  // endTime() returns the end time of the lesson and we need the start time of the block
  // so we subtract 15 minutes from the time
  var lessonEndTime = lessonObj.endTime().getTime();
  var lessonEndTime = lessonEndTime - 900000;

  // Convert Date objects to a number in preparation to indexOf
  var instrLessonTimes = instrObj.lessonTimes.slice(0);

  instrLessonTimes = instrLessonTimes.map( function (timeObj) {
    return timeObj.getTime();
  });
  var blockIndex = instrLessonTimes.indexOf(lessonEndTime);
  var lastLessonIndex = instrLessonTimes.length - 1;

  // if the instructor has no more lessons return the number of blocks between now
  // and the end of the lesson set
  if (blockIndex === lastLessonIndex) {
    var timeSpan = LessonSets.findOne(instrObj.set).timeSpan();
    var setEndTime = timeSpan[timeSpan.length - 1];
    return Fishie.getTimeBlocks(lessonObj.endTime(), setEndTime);
  // Otherwise, if we want to return trailing breaks for any old lesson, do so
  } else if (alwaysReturn) {
    var nextLessonTime =  new Date(instrLessonTimes[blockIndex + 1])
    return Fishie.getTimeBlocks(lessonObj.endTime(), nextLessonTime);
  }
}

/*
 *  This method takes a privateLesson input and returns the days of the week it scheduled to run.
 *
 */
Fishie.getWeekdays = function (lessonObj) {
  var allDays = lessonObj.weekdays;

  if (lessonObj.sharedIds) {
    var _ids = lessonObj.sharedIds;

    var lessons = Lessons.find({
      _id: { $in: _ids }
    });

    var otherDays = lessons.map( function (lesson) {
      return lesson.weekdays;
    });

    otherDays = _.flatten(otherDays);  // lesson.weekdays is an array so we need to sqaush them
  }

  var lessonDays = _.difference(allDays, otherDays);
  return lessonDays;
}

Fishie.addGhostLessons = function(instrArray, lessonTimes, length) {
  // Create new entries in Lessons collection with a ghost: true flag
  var instrArrayLength = instrArray.length;
  for (var i = 0; i < instrArrayLength; i++) {
    var _idString = new Meteor.Collection.ObjectID()._str;
    var lessonObj = Fishie.parseGhostLesson(lessonTimes, length);
    Fishie.addLessonToInstr(instrArray[i], lessonObj);
  };
}
Fishie.removeGhostLessons = function(){
  l = Lessons.find({owner: Meteor.userId(), levels: {$in: ["ghost"]}}).fetch();
  var lAry = [];
  // build an array of lesson IDs to feed to clearLessons
  for (var i = 0; i < l.length; i++) {
    lAry.push(l[i]._id);
  };
  Meteor.call('clearLessons', lAry);
}
Fishie.unsetAllGhosts = function() {
  Meteor.call('unsetAllGhosts');
}
Fishie.swapLessons = function(fLessonsObj, sLessonsObj) {
  Meteor.call('swapLessons', fLessonsObj, sLessonsObj);
}
Fishie.addLessonToInstr = function(instrObjOrId, lessonObj, setID) {
  Meteor.call('addLessonToInstr', instrObjOrId, lessonObj, setID);
}
Fishie.addNameToLesson = function (lessonObj, name) {
  Meteor.call('addNameToLesson', lessonObj, name);
}
Fishie.addCommentsToLesson = function (lessonObj, comments) {
  Meteor.call('addCommentsToLesson', lessonObj, comments);
}

Fishie.parseLessonObject = function(_idString, setId, level, privateLesson, swimmers, weekdays, startTime, length) {

  // Do some time processing
  var endTime = new Date(startTime.toJSON());
  endTime.setMinutes(startTime.getMinutes() + length + 1);
  var lessonTimes = Fishie.getTimeBlocks(startTime, endTime);

  // Get the max number of swimmers
  var maxSwimmers = Fishie.getMaxSwimmers(level);

  if (_idString == undefined) {
    var _idString = new Meteor.Collection.ObjectID()._str;
  }

  var o = {
    _id: _idString,
    setId: setId,
    owner: Meteor.userId(),
    levels: [level],
    privateLesson: privateLesson,
    split: false,
    instructor: '',
    swimmers: [swimmers],
    maxSwimmers: maxSwimmers,
    weekdays: weekdays,
    lessonTimes: lessonTimes,
    length: length,
  }
  return o;
}

Fishie.parseGhostLesson = function(lessonTimes, length){
  var lessonObj = Fishie.parseLessonObject(undefined, 0, 'ghost', 0, 0, [0], lessonTimes[0], length);
  // Set a special property for easy rendering
  lessonObj.ghost = true;
  return lessonObj;
}
Fishie.getSplitCandidatesForLesson = function (lessonObj, excludeIDs, rootLevel, direction) {
  // rootLevel gets passed in to keep track of the root class level we're searching for
  // needs to be flattened in case levels: gets passed in as an array
  l = _.union(lessonObj.levels, rootLevel);
  excludeLevels = _.flatten(l);
  if (direction == 1) {
    var maxLvl = Math.max.apply(Math, lessonObj.levels);
    var levelToSearch = lookupLvlSplits(maxLvl, 1);
    // var levelToSearch = [maxLvl + 1];
  } else if (direction == -1) {
    var minLvl = Math.min.apply(Math, lessonObj.levels);
    var levelToSearch = lookupLvlSplits(minLvl, -1);
    // var levelToSearch = [minLvl - 1];
  } else if (direction == 0) {
    var levelToSearch = [Math.min.apply(Math, lessonObj.levels) - 1 , Math.min.apply(Math, lessonObj.levels) + 1]
  }
  var splitCandidates = Lessons.find({
    $and: [
      {_id: {$nin: excludeIDs}},
      {owner: Meteor.userId()},
      {levels: {$in: levelToSearch}},
      {levels: {$nin: excludeLevels}},
      {lessonTimes: lessonObj.lessonTimes},
    ]
  }, {
    sort: {swimmers: 1}
  }).fetch();
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
      var maxSplits = Fishie.getMaxSplits(splitCandidates[i].levels[0]);
      // If we're dealing with a candidate that cannot be split with another class, recurse
      if (splitCandidates[i].levels.length > maxSplits || firstPass == true) {
        excludeIDs.push(splitCandidates[i]._id);
        var recurseSplits = Fishie.getSplitCandidatesForLesson(splitCandidates[i], excludeIDs, rootLevel, direction);
        if (recurseSplits.length > 0) {
          var f = Fishie.optimizeSplits(recurseSplits, rootLevel, direction, path);
          if (f) {
            path.push(splitCandidates[i]);
            return path;
          } else {
            continue;
          }
        }
      // If we're dealing with a candidate that can be split, push the endpoint into the path and return it
      } else {
        path.push(splitCandidates[i]);
        return path;
      }
    }
  }
  return false;
}
Fishie.condenseLessons = function (path, lessonID) {
  // This method assumes we're condensing pairs of lessons
  if (path === undefined) { return false; }
  // lessonID is the ID of the lesson we're creating -- Don't do anything with this lesson object
  // in the path[] because it doesn't exist in the database
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
  // remove the index of the lesson we're condensing from path because it doesnt
  // exist in the db
  for (var p = 0; p < path.length; p++) {
    if (path[p]._id == lessonID) {
      path.splice(p, 1);
      break;
    }
  };
  // Validate that we're not going to create a new class with too many swimmers
  var pathLength = path.length;
  for (var i = 0; i < pathLength; i++) {
    // reverse the array contining level->swimmer pairs so when we test for
    // maxSwimmers it tests for the smallest value instead of the largest
    var rZippedAry = zippedAry.slice().reverse();
    var swmrs = [];

    var swimmersTotal = 0;
    var ln = zippedAry.length;
    for (var a = 0; a < ln; a++) {
      swimmersTotal = swimmersTotal + zippedAry[a][1];
    }

    for (var z = i*2; z < i*2+2; z++) {
      if (swimmersTotal > Fishie.getMaxSwimmers(rZippedAry[z][0])) {
        // throw new Error("Invalid lesson sizes in path");
        return false;
      }
    }
  };
  // Update remaining lessons in path[] (those that exist in the db) with their new
  // level + swimmers
  for (var i = 0; i < path.length; i++) {
    if (zippedAry.length > 0) {
      var lvls = [];
      var swmrs = [];
      var maxLessons = Fishie.getMaxSplits(zippedAry[0][0]) + 1;
      for (var z = 0; z <= maxLessons; z++) {
        if (zippedAry[z]) {
          lvls.push(zippedAry[z][0]);
          swmrs.push(zippedAry[z][1]);
        }
      };
      Lessons.update(path[i]._id, {$set: {levels: lvls, swimmers: swmrs}});
      zippedAry.splice(0, maxLessons);
    } else {
      path[i].remove();
    }
  };
  return true;
}
Fishie.sortDateArray = function (dateArray) {
  // turns out we can use javascripts native operators to compare dates
  // go javascript
  var date_sort_asc = function (d1, d2) {
    if (d1 > d2) return 1;
    if (d2 > d1) return -1;
    return 0;
  }
  return dateArray.sort(date_sort_asc);
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
var lookupLvlSplits = function(level, direction){
  // TODO OMFG THIS IS HORRENDOUS! Find a better solution!
  if (direction > 0) {
    switch(level) {
      case 1:
        return [2];
      case 2:
        return [3];
      case 3:
        return [4];
      case 4:
        return [];
      case 5:
        return [6];
      case 6:
        return [];
      case 7:
        return [8, 9, 10];
      case 8:
        return [7, 9, 10];
      case 9:
        return [7, 8, 10];
      case 10:
        return [7, 8, 9];
      case 11:
        return [12];
      case 12:
        return [13];
      case 13:
        return [14];
      case 14:
        return [15];
      case 15:
        return [16];
      case 16:
        return [17];
      case 17:
        return [18];
      case 18:
        return [];
      default:
        return [-1];
    }
  } else if (direction < 0) {
    switch(level) {
      case 1:
        return [];
      case 2:
        return [1];
      case 3:
        return [2];
      case 4:
        return [3];
      case 5:
        return [];
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
      case 11:
        return [];
      case 12:
        return [11];
      case 13:
        return [12];
      case 14:
        return [13];
      case 15:
        return [14];
      case 16:
        return [15];
      case 17:
        return [16];
      case 18:
        return [17];
      default:
        return [-1];
    }
  }
}
Fishie.getMaxSplits = function(level) {
  // This is a lookup table that determines how many times a level may be split

  // TODO This should be determined via a GUI settings panel in the app somewhere
  // for now we're just going to hard code it
          // level 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
  var maxSplits = [0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1];
  return maxSplits[level];
}
