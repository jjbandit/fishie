Template.body.events ({
// TODO THIS SUCKS, SHOULD FIND A DIFFERENT EVENT SEQUENCE THAT LETS US USE MOUSEUP
	'dragstop' : function() {
		console.log('mouseup');
		Fishie.removeGhostLessons();
		// remove the z-index class
		$("div").removeClass("z-top");
	}
});
