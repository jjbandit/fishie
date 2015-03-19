Template.mainLayout.events ({
// TODO THIS SUCKS, SHOULD FIND A DIFFERENT EVENT SEQUENCE THAT LETS US USE MOUSEUP
	'dragstop' : function() {
		Fishie.removeGhostLessons();
		Fishie.unsetAllGhosts();
		// remove the z-index class
		$("div").removeClass("z-top");
	}
});
