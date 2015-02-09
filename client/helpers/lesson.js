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
		var lessonObj = this;
		var lessonTimes = this.lessonTimes;
		var length = this.length;
		var lessonID = this._id;
		var availableInstructors = Instructors.find({lessonTimes: {$nin: lessonTimes}}).fetch();
		// set a session variable so we can find out what we're dropping in the drop: function
		Session.set('dragTargetObj', this);
		Fishie.addGhostLessons(availableInstructors, lessonTimes, length);
		// add a z-index class so the lesson stays on top of DOM rendered after it
		$(event.target.parentElement).addClass("z-top");
		// PART TWO ==
		// Check if the lesson we're dragging can be swapped for each lesson returned
		var leadingBreaks = Fishie.getLeadingBreaks(lessonObj);
		var trailingBreaks = Fishie.getTrailingBreaks(lessonObj);
		var totalTimeAvailable = _.union(leadingBreaks, lessonTimes, trailingBreaks);
		console.log(leadingBreaks);
		console.log(trailingBreaks);
		console.log(totalTimeAvailable);
		totalTimeAvailable = $.map(totalTimeAvailable, function( val, i ) {
			return val.getTime()
		});
		console.log(totalTimeAvailable);
		// Get all lessons that intersect with the totalTimeAvailable and lessonTimes
		// IE lessons that interfere with drag-n-dropping the dragTarget and can fit into the free time
		// the dragTarget.instructor has available
		var intersectingLessons = Lessons.find({
			$and: [
				{_id: {$ne: lessonID}},
				{ghost: {$exists: false}},
				{lessonTimes: {$in: lessonTimes}},
			]
		}).fetch();
		console.log(intersectingLessons);
		var intersectingLessonsLength = intersectingLessons.length;
		var lessonsOutsideTime = [];
		for (var i = 0; i < intersectingLessonsLength; i++) {
			var intersectingLessonTimesLength = intersectingLessons[i].lessonTimes.length;

			for (var l = 0; l < intersectingLessonTimesLength; l++) {
				// loop through each time in each lesson, checking if the time is outside
				// the totalTimeAvailable
				var k = $.inArray(intersectingLessons[i].lessonTimes[l].getTime(), totalTimeAvailable);
				console.log(k);
				// $.inArray returns -1 if the time isn't present in totalTimeAvailable
				if (k == -1) {
					// so we add the lessons instructor to the lessonsOutsideTime array
					lessonsOutsideTime.push(intersectingLessons[i].instructor);
					console.log(totalTimeAvailable);
					console.log(k);
					continue;
				} else {
					continue;
				}
			};

		};
		console.log('lsjdkfls;a');
		console.log(lessonsOutsideTime);
		for (var i = 0; i < intersectingLessonsLength; i++) {
			if ($.inArray(intersectingLessons[i].instructor, lessonsOutsideTime) == -1){
				Lessons.update(intersectingLessons[i]._id, {$set: {ghost: true}});
			}
		};
	}
});
Template.lesson.rendered = function () {
	// set draggable on regular lessons
	console.log('rendered');
	var dragTarget = this.$('div#lesson');
	dragTarget.draggable({cursor: "move",
		handle: "div#lesson-controls",
		revert: true,
		axis: "y"
	});
	// set droppable on ghost lessons
	if (this.data.ghost) {
		var dropTarget = this.$('div#lesson.ghost');
		var dropTargetObj = this.data;
		dropTarget.droppable({
			drop: function() {
				var dragTargetObj = Session.get('dragTargetObj');
				Meteor.call('unsetAllGhosts');
				Fishie.removeGhostLessons();
				Fishie.addLessonToInstr(dropTargetObj.instructor ,dragTargetObj);
			}
		});
		// FIXME UNFORTUNATELY THIS BREAKS THE LAYOUT OCCASIONALLY WHEN IT GETS SCALED BY THE BROWSER
		// it looks sick though
		// dragTarget.hide();
		// dragTarget.show({effect: 'drop', easing: 'easeOutExpo', duration: 600});
	}
};
