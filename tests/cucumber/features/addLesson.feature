Feature: Add a lesson to Lessons collection

	As a user
	I want to add lessons to the Lessons Collection
	So that I can modify my roster

	Scenario:
		Given I have an empty Lessons Collection
		When I add a lesson to the Collection
		Then I should have one lesson in the Collection
