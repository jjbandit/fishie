Template.body.events ({
	'mouseup' : function() {
		console.log('mouseup');
		Fishie.removeGhostLessons();
		$("div").removeClass("z-top");
	}
});
