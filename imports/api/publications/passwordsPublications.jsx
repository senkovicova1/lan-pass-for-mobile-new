import React from 'react';

import {
  check
} from 'meteor/check';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

Meteor.publish('passwords', function publishPasswords() {
  return PasswordsCollection.find( { } );
});
