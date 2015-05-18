Feature: Add a lesson to Lessons collection

	As a user
	I want to add lessons to the Lessons Collection
	So that I can modify my roster

	Background:
		Given I navigate to ""
		And "Bob" has logged in


	@dev
	Scenario:
		Given The logged in user has created a "Monday" Lesson Set
		When I submit the default form
		Then I should have 1 lesson appearing in the Schedule section
