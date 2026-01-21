## ADDED Requirements

### Requirement: Outfit Calendar Associations

The system MUST allow users to associate existing outfits with calendar dates and manage those associations.

#### Scenario: View outfit associations by date

- **GIVEN** the user has associated outfits to a date
- **WHEN** the user opens the calendar date detail
- **THEN** the outfits are listed with their names and thumbnails

#### Scenario: Prevent cross-user access

- **GIVEN** another user has outfits
- **WHEN** a user adds outfits to a date
- **THEN** only their own outfits are available for association
