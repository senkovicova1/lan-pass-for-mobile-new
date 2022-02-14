import React from 'react';

import {
  SharingCollection
} from '/imports/api/sharingCollection';

Meteor.publish('sharing', function publishSharing() {
  return SharingCollection.find( {} );
});
