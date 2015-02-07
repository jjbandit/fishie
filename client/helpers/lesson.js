Template.lesson.helpers ({
	getLesson: function(lessonID) {
		return Lessons.findOne(lessonID);
	},
	sanitizeLevels: function(levelsAry) {
		if (levelsAry[0] > 10) {
			return 'Preschool ' + levelsAry;
		} else {
			return 'Swim Kids ' + levelsAry;
		}
	},
});
Template.lesson.events ({
	'dragstart div#lesson': function() {
		// Lessons are removed in the global body.events so we can mouseup anywhere,
		// even though the cursor should always be inside the handle
		var lessonTimes = this.lessonTimes;
		var length = this.length;
		var availableInstructors = Instructors.find({lessonTimes: {$nin: lessonTimes}}).fetch();
		// set a session variable so we can find out what we're dropping in the drop: function
		Session.set('dragTargetObj', this);
		// console.log(availableInstructors);
		Fishie.addGhostLessons(availableInstructors, lessonTimes, length);
		// add a z-index class so the lesson stays on top of DOM rendered after it
		$(event.target.parentElement).addClass("z-top");
	}
});
Template.lesson.rendered = function () {
	// set draggable on regular lessons
	var dragTarget = this.$('div#lesson');
	dragTarget.draggable({cursor: "move",
		handle: "div#lesson-controls",
		revert: true,
	});
	if (this.data.ghost) {
		console.log('i see a ghost');
		var dropTarget = this.$('div#lesson.ghost');
		var dropTargetObj = this.data;
		dropTarget.droppable({
			drop: function() {
				var dragTargetObj = Session.get('dragTargetObj');
				Fishie.removeGhostLessons();
				Fishie.addLessonToInstr(dropTargetObj.instructor ,dragTargetObj);
				// Instructors.update(dragTargetObj.instructor, {lessonList: {$pull: dragTargetObj._id}});
			}
		});
	}
};
