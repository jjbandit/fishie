if (!(typeof MochaWeb === 'undefined')){
  MochaWeb.testOnly(function(){
    describe("when calling resetDb", function(){
      it("should clear all Collections", function(){
				Meteor.call('resetDb');
				var numLessons = Lessons.find().fetch().length;
				chai.assert.equal(numLessons, 0, 'the Lessons Collection is not empty');

				var numInstructors = Instructors.find().fetch().length;
				chai.assert.equal(numInstructors, 0, 'the Instructors Collection is not empty');

				var numSets = LessonSets.find().fetch().length;
				chai.assert.equal(numSets, 0, 'the Sets Collection is not empty');
      });
    });
  });
}
