Template.lesson.helpers ({
	sanitizeMinutes: function(mins) {
		if (mins == 0) {
			mins = "00"
		}
		return mins;
	},

	getClassName: function(lesson) {
		// SK levels are easy to get out.
		if (lesson.classType == 'Swim Kids') {
			if (lesson.split) {
				return lesson.classType + ' ' +lesson.level.join('/');
			} else {
				return lesson.classType + ' ' + lesson.level;
			}
		// Prechool levels need special handling
		} else if (lesson.classType == 'Preschool') {
		function getPreschoolLevel (level) {
				switch(level) {
					case 1:
						return 'Starfish';
					case 2:
						return 'Duck';
					case 3:
						return 'Sea Turtle';
					case 4:
						return 'Sea Otter';
					case 5:
						return 'Salamander';
					case 6:
						return 'Sunfish';
					case 7:
						return 'Crocodile';
					case 8:
						return 'Whale';
			};
		}
			if (lesson.split) {
				var levelAry = [];
				for (var i = 0; i < lesson.level.length; i++) {
					levelAry.push(getPreschoolLevel(lesson.level[i]));
					}
				return levelAry.join('/');
			} else {
				return getPreschoolLevel(lesson.level);
			}
		}
	},
});

