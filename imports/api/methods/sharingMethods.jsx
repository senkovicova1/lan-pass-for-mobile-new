import React from 'react';

import { check } from 'meteor/check';

import {
  SharingCollection
} from '/imports/api/sharingCollection';

Meteor.methods({
  'sharing.create'( passwordId, validUntil, userId, email ) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return SharingCollection.insert( {
      passwordId,
      validUntil,
      userId,
      email
    });
  },

  'sharing.update'( sharingId, data ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return SharingCollection.update( sharingId, {
      $set: {
        ...data
      }
    } );
  },

  'sharing.remove'(sharingId) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    SharingCollection.remove( {
      _id: sharingId
    } );
  }
});
