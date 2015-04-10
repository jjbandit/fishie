Template.instructorList.helpers ({
	instructors: function(setId) {
		return Instructors.find({owner: Meteor.userId(), set: setId}, {sort: {createdAt: 1}});
	},
	sortedLessonList: function(lessonID_ary) {
		var sortedList =  Lessons.find({_id: {$in: lessonID_ary}, owner: Meteor.userId()}, {sort: {lessonTimes: 1}}).fetch();


		console.log(sortedList);
		return sortedList;
	},
	getLeadingBreaks: function(lessonObj) {
		return Fishie.getLeadingBreaks(lessonObj);
	},
	getTrailingBreaks: function(lessonObj) {
		return Fishie.getTrailingBreaks(lessonObj, false);
	}
});

Template.instructorList.events ( {
	'blur input.instructor-name': function () {
		Fishie.setInstructorName(this, event.target.value);
	},
	'click input#print-page' : function () {
		// First hide everything we don't want to print
		$('div#lesson-controls').hide(0);
		$('form#create-lesson-controls').hide(0);
		$('div#login-buttons').hide(0);
		$('h1#logo').hide(0);
		$('div.print-page-wrapper').hide(0);

		window.print();

		$('div#lesson-controls').show(0);
		$('form#create-lesson-controls').show(0);
		$('div#login-buttons').show(0);
		$('h1#logo').show(0);
		$('div.print-page-wrapper').show(0);
	}
});
