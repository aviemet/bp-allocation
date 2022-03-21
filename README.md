# Battery Powered Allocation Night

For tracking and presenting the data on Allocation Night for Battery Powered.

## Project Goals

- [ ] Add confirmation dialog to destructive button actions

  - [ ] ResetOrgFundsButton
  - [ ] ResetMessageStatusButton
  - [ ] Double check all prompt messages are accurate to their purpose

    - Delete topup message is incorrect

- [ ] If someone has entered their vote, automatically opt them out of receiving the email and text reminder for that round

- [ ] Ability to pause/disable/enable topups fireworks

  - [ ] Track which topups have been displayed
  - [ ] Option to re-run all topups fireworks

- [ ] An "Overview" page

- [ ] Tally for # who voted through the text link or the email link

- [ ] Update login method

- [ ] A way to undo vote reset button.

  - Site-wide audit logging?

- [ ] Try to make the fireworks a bit more performant

- [ ] Consider a sound effect option for the graph reveal and the topups fireworks

- [ ] Fully remove Semantic-UI

- [ ] Make kiosk voting on by default

- [ ] Hide user actions menu on click

- [ ] Find a better way to display text/email buttons

  - [x] Add order of messages to DB schema
  - [ ] Display messages in order, allow for reordering

- [ ] Create a message template section separate from a theme

- [ ] Setup AWS image bucket to upload images for messages

- [ ] Add helpful info to themes list such as # of orgs, voting status, etc.

- [ ] Try to paginate DB requests for theme list, as in, fetch only one page instead of paginating all records in memory

- [ ] Search for performance gains in db reads -- load times are pretty long for voting pages

- [ ] Standardize value formatters

- [ ] Make saves optional

- [x] Topups member view not loading

- [x] Include leverage amounts in final need totals

- [x] Add formatting for large images

- [x] Mobile formatting for voting screens (breaking changes from SemanticUI)

- [x] Total amount given on feedback page

- [x] Some indication to us that the email or text messages have indeed been sent

- [x] Add send buttons to member list for active sms/emails

- [x] Clean up the settings page

  - [x] Separate into tabs
  - [x] Better formatting

- [x] Matched pledges sortable

- [x] Change all input forms to be either modals or have their own view. Remove inputs from above table views

- [x] For connected and high voltage level members that have 2 partners associated with the account, an easy way to ensure that both partners first names appear on their voting screen

- [x] Testing/runthrough mode where values aren't saved and texts/emails don't go to members

- [x] Audit form validation for all pages

- [x] Rate limit the texts and resend failed texts

- [x] Show number of voted complete members

- [x] Remove RTF from SMS

- [x] Fix wording on button to remove member from theme

- [x] **Fix member import to not fail if last name or first name is not present**

- [x] Switch to react-hook-form and eliminate magic numbers/strings for default values in components

- [x] Remove moment.js as a dependency, replace with date-fns

## Development References

- [Performing Mongo transforms on the server during publish](https://stackoverflow.com/questions/18093560/meteor-collection-transform-is-it-done-on-the-server-or-on-the-client-or-it-de/28389143)
