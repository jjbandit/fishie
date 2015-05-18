'use strict';

module.exports = function () {
	this.Before(function (event, callback) {
		console.log('reset');
		this.ddp.call('reset', [], callback);
		// callback();
	});
}
