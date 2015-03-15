Template.home.events ({

	'click input#new-set': function () {
		$('#build-set-wrapper').show();
		$('#select-set-wrapper').hide();
	},

	'click input#select-set' : function() {
		$('#select-set-wrapper').show();
		$('#build-set-wrapper').hide();
	}

});

Template.home.rendered = function () {
	var body = $('body').get();
	// Prevent flicker -> render and hide our select/build templates
	// after the home template has rendered.
	Blaze.render(Template.selectSet, body[0]);
	$('#select-set-wrapper').hide();
	Blaze.render(Template.buildSet, body[0]);
	$('#build-set-wrapper').hide();
};
