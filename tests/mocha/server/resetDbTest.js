if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){

		before( function () {
			Lessons.remove({});
			Instructors.remove({});
			LessonSets.remove({});
		});

    describe("Calling resetDb", function(){
			it("should clear all Collections", function(){

				Lessons.insert({
					_id: 'someLessonId',
					someProperty: 'yay!'
				});
				Instructors.insert({
					_id: 'someInstructorId',
					someProperty: 'yay!'
				});
				LessonSets.insert({
					_id: 'someSetId',
					someProperty: 'yay!'
				});

				Meteor.call('resetDb');
				var numLessons = Lessons.find().fetch().length;
				chai.assert.equal(0, numLessons, 'the Lessons Collection is not empty');

				var numInstructors = Instructors.find().fetch().length;
				chai.assert.equal(0, numInstructors, 'the Instructors Collection is not empty');

				var numSets = LessonSets.find().fetch().length;
				chai.assert.equal(0, numSets, 'the Sets Collection is not empty');
			});
    });
  });
}
