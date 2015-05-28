Template.createOrSelectSet.events ({
	'click input#new-set': function () {
		$('#create-set-wrapper').show();
		$('#select-set-wrapper').hide();
	},

	'click input#select-set' : function() {
		$('#select-set-wrapper').show();
		$('#create-set-wrapper').hide();
	}
});

Template.createOrSelectSet.rendered = function () {
	var body = $('body').get();
	// Prevent flicker -> render and hide our select/create templates
	// after the home template has rendered.
	Blaze.render(Template.selectSet, body[0]);
	$('#select-set-wrapper').hide();
	Blaze.render(Template.createSet, body[0]);
	$('#create-set-wrapper').hide();
};
