Meteor.methods({
  /*
   *  Function for removing lessons from the database.
   */
  clearLessons: function(lessonIDs) {
    lessonIDsLength = lessonIDs.length;
    for (var i = 0; i < lessonIDsLength; i++) {

      var lessonID = lessonIDs[i];
      var lessonObj = Lessons.findOne(lessonID, {owner: Meteor.userId()});
      var lessonTimes = lessonObj.lessonTimes;

      // Update parent if this lesson is sharing a time block
      if (lessonObj.parent) {

        Lessons.update( lessonObj.parent, {
          $pullAll: {
            sharedIds: [lessonID],
            weekdays: lessonObj.weekdays
          }
        });

        var parent = Lessons.findOne(lessonObj.parent);

        if ( parent.sharedIds.length === 0 ) {
          Meteor.call('removeLessonFromInstr', parent);
          Lessons.remove(lessonObj.parent);
        }

        Lessons.remove(lessonID);
        return;
      }

      Meteor.call('removeLessonFromInstr', lessonObj);

      Lessons.remove(lessonID);
    };
  },

  removeLessonFromInstr: function (lessonObj) {
    Instructors.update(lessonObj.instructor, {
      $pull: {
        lessonList: lessonObj._id
      },
      $pullAll: {
        lessonTimes: lessonObj.lessonTimes
      }
    });

    // cleanup Instructor if it has no lessons
    var instr = Instructors.findOne(lessonObj.instructor);
    if (instr.lessonList.length == 0) {
      Instructors.remove(lessonObj.instructor);
    }

  },

  // This should probably loop thorugh a Lessons.find cursor
  clearAllLessons: function(setId) {
    Lessons.remove({setId: setId});
    Instructors.remove({set: setId});
  },

  resetDb: function () {
    Lessons.remove({});
    Instructors.remove({});
    LessonSets.remove({});
  }
});
