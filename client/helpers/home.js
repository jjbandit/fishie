Template.home.events ({

	'click input#new-set': function () {
		var domNode = $('body').get();
		console.log(domNode);
		Blaze.render('timeSelector', domNode[0] );
		console.log('clickey!');
	},

	'click input#select-set' : function() {
		console.log("otherclick");
	}
});
