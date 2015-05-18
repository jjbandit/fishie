'use strict';
module.exports = function () {

	var appRoot = process.env.ROOT_URL;

	this.Given(/"([^"]*)" has logged in/, function(name, callback) {

		// 1. create a user
		var userData = { email: name + '@example.com', password: 'abc123456'};
		this.ddp.call('fixtures/user/createDefault', userData, function (err, ret) {
			if (err) {
				console.log(err);
			}
		});

		this.browser.executeAsync(function (user, done) {
			// this code is run in the browser
			Meteor.loginWithPassword(user.email, user.password, done);
		}, userData )
		.waitForVisible('.dropdown-toggle')
		.waitForExist('.dropdown-toggle')
		.getText('.dropdown-toggle').should.become(userData.email).and.notify(callback);
	});

		this.Given(/^I click on "([^"]*)"$/, function (element, callback) {
			// Write code here that turns the phrase above into concrete actions
			callback.pending();
		})

		this.Given(/^The logged in user has created a "([^"]*)" Lesson Set$/, function (weekday, callback) {
			var weekdayLc = weekday.toLowerCase();
			this.browser
				.url(appRoot + 'set/create')
				.waitForVisible('#weekday-wrapper')
				.click('#weekday-' + weekdayLc + '-label')
				.submitForm('#create-set-wrapper')
				.waitForVisible('#schedule')
				.saveScreenshot(process.env.VELOCITY_MAIN_APP_PATH + '/text.png');
			callback();
			});

	this.Given(/^I navigate to "([^"]*)"$/, function (relativePath, callback) {
		this.browser
			.url(appRoot + relativePath);
		callback();
		});

	this.When(/^I submit the default form$/, function (callback) {
		this.browser
			// saveScreenshot(process.env.VELOCITY_MAIN_APP_PATH + '/submit.png');
			.waitForExist('#create-lesson-controls')
			.waitForVisible('#create-lesson-controls')
			.submitForm('#create-lesson-controls');
			callback();
	});
	this.Then(/^I should have (\d+) lesson appearing in the Schedule section$/, function (numLessons, callback) {
		this.browser
			.waitForExist('.block-wrapper')
			.waitForVisible('.block-wrapper')
			.elements('.block-wrapper', function (err, elems) {
				chai.assert.lengthOf(elems.value, numLessons,
						'Expected ' + numLessons + ' lessons, but got ' +
						elems.value.length + '.');
				callback();
			});
	});
}
