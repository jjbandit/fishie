Template.body.events ({
// TODO THIS SUCKS, SHOULD FIND A DIFFERENT EVENT SEQUENCE THAT LETS US USE MOUSEUP
	'dragstop' : function() {
		console.log('mouseup');
		Fishie.removeGhostLessons();
		$("div").removeClass("z-top");
	}
});
