Template.lesson.helpers ({
  getLesson: function(lessonObjOrID) {
    return Lessons.findOne(lessonObjOrID, {owner: Meteor.userId()});
  },
  getWeekdays: function (lessonObj) {
    var days = Fishie.getWeekdays(lessonObj);
    days =  UI._globalHelpers['sanitizeWeekdays'](days);
    return days;
  },
  sanitizeLevels: function(levelsAry) {
    var preLevels = ['Starfish', 'Duck', 'Sea Turtle', 'Sea Otter', 'Salamander', 'Sunfish', 'Crocodile', 'Whale'];
    var returnArray = [];

    // This loop builds an array with sanitized level names for the client
    var ln = levelsAry.length;
    for (var i = 0; i < ln; i++) {
      if (levelsAry[i] > 10) {
        // Subtract 11 because Starfish is the 11th level (after sk 1-10)
        // to get to a 0 based index
        returnArray.push(preLevels[levelsAry[i] - 11]);
      } else {
        returnArray.push('Swim Kids ' + levelsAry[i]);
      }
    }
    return returnArray;
  },
});

Template.lesson.events ({
  'click div.comments': function(event) {
    // Insert a text area to edit the lesson comments
    if (this.privateLesson){
      var comments = this.comments;
      $(event.target).append('<textarea class="private-comments">' + comments + '</textarea>');
    }
  },
  'blur input.private-name': function (event) {
    Fishie.addNameToLesson(this, event.target.value);
  },
  'blur textarea.private-comments': function (event) {
    Fishie.addCommentsToLesson(this, event.target.value);
    $(event.target).remove();
  },
  'dragstart div#lesson': function (event) {
    // Lessons are removed in the global body.events so we can mouseup anywhere,
    // even though the cursor should always be inside the handle
    var lessonObj = this;
    var lessonTimes = this.lessonTimes;
    var length = this.length;
    var lessonID = this._id;
    var availableInstructors = Instructors.find({lessonTimes: {$nin: lessonTimes}, owner: Meteor.userId()}).fetch();
    Fishie.addGhostLessons(availableInstructors, lessonTimes, length);
    // add a z-index class so the lesson stays on top of DOM rendered after it
    $(event.target.parentElement).addClass("z-top");
    // return out if we're dragging a lesson with a parent; it can't be swapped
    if (lessonObj.parent) {
      Session.set('dragTargetObj', lessonObj);
      return;
    }
    // PART TWO ==
    // Check if the lesson we're dragging can be swapped for each lesson returned
    var leadingBreaks = Fishie.getLeadingBreaks(lessonObj);
    var trailingBreaks = Fishie.getTrailingBreaks(lessonObj);
    var totalTimeAvailable = _.union(leadingBreaks, lessonTimes, trailingBreaks);
    totalTimeAvailable = $.map(totalTimeAvailable, function( val, i ) {
      return val.getTime()
    });
    // Get all lessons that intersect with the totalTimeAvailable and lessonTimes
    // IE lessons that interfere with drag-n-dropping the dragTarget and can fit into the free time
    // the dragTarget.instructor has available
    var intersectingLessons = Lessons.find({
      $and: [
        {_id: {$ne: lessonID}},
        {ghost: {$exists: false}},
        {parent: {$exists: false}},
        {owner: Meteor.userId()},
        {lessonTimes: {$in: lessonTimes}},
      ]
    }).fetch();
    var intersectingLessonsLength = intersectingLessons.length;
    var lessonsOutsideTime = [];

    for (var i = 0; i < intersectingLessonsLength; i++) {
      var intersectingLessonTimesLength = intersectingLessons[i].lessonTimes.length;

      for (var l = 0; l < intersectingLessonTimesLength; l++) {
        // loop through each time in each lesson, checking if the time is outside
        // the totalTimeAvailable
        var k = $.inArray(intersectingLessons[i].lessonTimes[l].getTime(), totalTimeAvailable);
        // $.inArray returns -1 if the time isn't present in totalTimeAvailable
        if (k == -1) {
          // so we add the lessons instructor to the lessonsOutsideTime array
          lessonsOutsideTime.push(intersectingLessons[i].instructor);
          continue;
        } else {
          continue;
        }
      };

    };
    for (var i = 0; i < intersectingLessonsLength; i++) {
      if ($.inArray(intersectingLessons[i].instructor, lessonsOutsideTime) == -1){
        Fishie.setGhostLesson(intersectingLessons[i]);
      }
    };
    // set some session variables so we can find out what we're dropping in the drop: function
    Session.set('dragTargetObj', lessonObj);
    Session.set('intersectingLessons', intersectingLessons);
  }
});


Template.lesson.rendered = function () {
  // set draggable on regular lessons
  var dragTarget = this.$('div#lesson');
  var dropTarget = this.$('div#lesson');
  var dropTargetObj = this.data;
  dragTarget.draggable({
    cursor: "move",
    handle: "div#lesson-controls",
    revert: true
  });

  // set droppable on ghost lessons
  dropTarget.droppable({
    tolerance: 'pointer',
    hoverClass: 'ghost-hover',
    drop: function(event) {
      var dragTargetObj = Session.get('dragTargetObj');
      // If we're dropping on a lesson that's not a ghost,
      // or dropping on a lesson that has a parent object, return out
      if(!$(this).hasClass('ghost') || dropTargetObj.parent) {
        Fishie.unsetAllGhosts();
        return false;
      } else {

        // If the object we're dragging has a parent pull the dragged _id from the
        // parents sharesWith so it doesn't get rendered twice
        if (dragTargetObj.parent) {
          // Return out if we're trying to swap a lesson with a parent
          if (dropTargetObj.levels[0] !== 'ghost') {
            return;
          }
          Meteor.call('pullShareLesson', dragTargetObj.parent, dragTargetObj);
          dragTargetObj.instructor = '';
          dragTargetObj.parent = undefined;
        }

        // These remove statemets have to come first because mongo doesn't allow us to unset
        //     just one instance of a value from an array, it removes all instances of a value
        //     which leaves us with lessons without times in the lessonTimes array
        //     if we insert lessons before we remove them
        // This ensures actual lessons get the ghost property removed
        Fishie.unsetAllGhosts();
        // This removes lessons with levels[0] == ghost
        Fishie.removeGhostLessons();
        if (dropTargetObj.levels[0] != "ghost") {
          var intersectingLessons = Session.get('intersectingLessons');
          var intersectingLessonsLength = intersectingLessons.length;
          var swapList = [];
          for (var i = 0; i < intersectingLessonsLength; i++) {
            if (intersectingLessons[i].instructor == dropTargetObj.instructor) {
              swapList.push(intersectingLessons[i]);
            }
          };
          Fishie.swapLessons(dragTargetObj, swapList);
        } else {
          Fishie.addLessonToInstr(dropTargetObj.instructor ,dragTargetObj);
        }
      }
      // Unset session for next time
      Session.set('dragTargetObj', '');
    }
  });
};
