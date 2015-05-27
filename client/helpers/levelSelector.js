Template.levelSelector.events ({
	// As a convienience to our user we update default lesson lengths here
	// TODO Put values into settings panel so users can choose each lessons length
	'change input.level-toggle': function (event) {
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

		// Check the appropriate length radio and fire the change event
		var jqString = 'input[name=length-toggle]' + '[value=' + lessonLength + ']';
		$(jqString, '#create-lesson-controls').prop('checked', true).trigger('change');

		$( '#level-wrapper' ).hide();
		Session.set('Stage.level', event.target.id);
	},
	'change input.swimmers-toggle' : function (event) {
		$( '#swimmers-wrapper' ).hide();
		Session.set('Stage.swimmers', event.target.value);
	},

	'click .level' : function (event) {
		$(' #level-wrapper ' ).show();
	},
	'click .num-swimmers' : function (event) {
		$(' #swimmers-wrapper ' ).show();
	}
});

Template.levelSelector.helpers ({
	getLevel: function () {
		return Session.get('Stage.level') || 'sk-1';
	},
	getNumSwimmers: function () {
		return Session.get('Stage.swimmers') || '1';
	}
});
