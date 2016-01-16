Meteor.methods({
  pullShareLesson: function (childObj, setId) {
    var childId = childObj._id;

    var parentId = childObj.parent;
    var parentObj = Lessons.findOne(parentId);

    // Pull child object from the parents children
    var shares = _.without(parentObj.sharedIds, childId);
    parentObj.sharedIds = shares;

    var days = _.difference(parentObj.weekdays, childObj.weekdays);
    parentObj.weekdays = days;

    if (parentObj.sharedIds.length > 1) {  // If the parent has more than one child

      Lessons.update(parentId, parentObj);

    } else {  // The parent object can be removed since it has only one child.

      Meteor.call('removeLessonFromInstr', parentObj);
      Lessons.remove(parentObj._id);

      var otherLesson = Lessons.findOne( parentObj.sharedIds[0] );
      Fishie.addLessonToInstr(parentObj.instructor, otherLesson, setId);
    }
  }
});
