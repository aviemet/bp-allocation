# Battery Powered Allocation Night

For tracking and presenting the data on Allocation Night for Battery Powered.

## Project Goals

- [x] Some indication to us that the email or text messages have indeed been sent

- [ ] If someone has entered their vote, automatically opt them out of receiving the email and text reminder for that round

- [x] Find a better way to display text/email buttons

  - [ ] Add order of messages to DB schema
    - Display messages in order, mixing text and emails

- [ ] Add send buttons to member list for active sms/emails

- [ ] Add confirmation dialog to destructive button actions

  - [ ] ResetOrgFundsButton
  - [ ] ResetMessageStatusButton

- [ ] Clean up the settings page

- [ ] Matched pledges sortable

- [ ] Change all input forms to be either modals or have their own view. Remove inputs from above table views

- [ ] For connected and high voltage level members that have 2 partners associated with the account, an easy way to ensure that both partners first names appear on their voting screen

- [ ] Place a hold on displaying top ups until designated times

- [ ] A feedback monitor for host to track progress against funding goals

- [ ] Tally for # who voted through the text link or the email link

- [ ] Testing/runthrough mode where values aren't saved and texts/emails don't go to members

- [ ] Audit form validation for all pages

- [ ] Update login method

- [x] Rate limit the texts and resend failed texts

- [x] Show number of voted complete members

- [x] Remove RTF from SMS

- [x] Fix wording on button to remove member from theme

- [ ] **Fix member import to not fail if last name or first name is not present**

- [ ] Switch to raect-hook-form and eliminate magic numbers/strings for default values in components

- [ ] Remove moment.js as a dependency, replace with date-fns

## Development References

- [Performing Mongo transforms on the server during publish](https://stackoverflow.com/questions/18093560/meteor-collection-transform-is-it-done-on-the-server-or-on-the-client-or-it-de/28389143)
