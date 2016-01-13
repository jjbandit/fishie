Meteor.methods ({

  /*
   *  Parent shared lessons contain a sharedIds list that enumerates each
   *  lesson that it shares a time block with.
   *
   *  The parent lesson is responsible for keeping track of which days it
   *  and all of its children are running on.
   *
   */
  setSharedPrivate: function (parentLesson, childLesson, setId) {

    if (parentLesson.sharedIds) {         // The parent lesson is a wrapper

      parentLesson.sharedIds.push(childLesson._id);
      parentLesson.weekdays.push(childLesson.weekdays);
      parentLesson.weekdays = _.flatten(parentLesson.weekdays); // I'm lazy and pushing in an array
      childLesson.parent = parentLesson._id;

    } else {  // We need to create a wrapper and add both lessons to it

      var wrapperLesson = Fishie.parseLessonObject(undefined, setId, 0, true, 0, null, parentLesson.lessonTimes[0], parentLesson.length);
      wrapperLesson.weekdays = _.union(parentLesson.weekdays, childLesson.weekdays);

      wrapperLesson.sharedIds = [childLesson._id, parentLesson._id];
      wrapperLesson.instructor = parentLesson.instructor;

      Lessons.insert(wrapperLesson);

      Instructors.update(
        parentLesson.instructor, {
          $push: { lessonList: wrapperLesson._id }
        }
      );

      Instructors.update(
        parentLesson.instructor, {
          $pull: { lessonList: parentLesson._id }
        }
      );

      childLesson.parent = wrapperLesson._id;
      parentLesson.parent = wrapperLesson._id;

    }

    childLesson.instructor = parentLesson.instructor;

    Lessons.update(parentLesson._id, parentLesson);
    Lessons.insert(childLesson);
  }
});
