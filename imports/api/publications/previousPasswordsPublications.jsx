import React from 'react';

import {
  PreviousPasswordsCollection
} from '/imports/api/previousPasswordsCollection';

Meteor.publish('previousPasswords', function publishPreviousPasswords() {
  return PreviousPasswordsCollection.find( {} );
});
