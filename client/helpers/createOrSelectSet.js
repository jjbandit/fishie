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
	$('#select-set-wrapper').hide();
	$('#create-set-wrapper').hide();
};
