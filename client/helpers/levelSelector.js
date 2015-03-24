Template.levelSelector.events ({
	'change input.level-toggle': function () {
		// Uncheck the currently checked lesson-length
		$('input[name=length-toggle]:checked', '#create-lesson-controls').prop('checked', false);

		var getLessonLength = function (lessonNum) {
			var skLengths = [29,29,29,29,44,44,59,59,59,59];
			// Swim kids
			if (lessonNum < 11) {
				return skLengths[lessonNum - 1];
			// Preschool
			} else {
				return 29;
			}
		}

		var lessonNum = event.target.value;
		var lessonLength = getLessonLength(lessonNum);

		// Check the appropriate length radio
		var jqString = 'input[name=length-toggle]' + '[value=' + lessonLength + ']';
		$(jqString, '#create-lesson-controls').prop('checked', true);
	}
});
