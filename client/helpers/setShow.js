Template.setShow.rendered = function () {
	$('#select-set-wrapper').remove();
	$('#build-set-wrapper').remove();
};

Template.setShow.events ({
	'click input#print-page' : function () {
		// First hide everything we don't want to print
		$('div#lesson-controls').hide(0);
		$('form#create-lesson-controls').hide(0);
		$('div#login-buttons').hide(0);
		$('h1#logo').hide(0);
		$('input#print-page').hide(0);

		window.print();

		$('div#lesson-controls').show(0);
		$('form#create-lesson-controls').show(0);
		$('div#login-buttons').show(0);
		$('h1#logo').show(0);
		$('input#print-page').show(0);
	}
});
