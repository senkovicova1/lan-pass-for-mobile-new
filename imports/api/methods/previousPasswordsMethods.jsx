import React from 'react';

import {
  check
} from 'meteor/check';

import {
  PreviousPasswordsCollection
} from '/imports/api/previousPasswordsCollection';

Meteor.methods({
  'previousPasswords.create'(title, folder, username, password, url, note, expires, expireDate, createdDate, updatedDate, updatedBy, originalPasswordId, version) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return PreviousPasswordsCollection.insert( {
      title,
      folder,
      username,
      password,
      url,
      note,
      expires,
      expireDate,
      createdDate,
      updatedDate,
      updatedBy,
      originalPasswordId,
      version,
    } );
  },

  'previousPasswords.update'(passwordId, data) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    PreviousPasswordsCollection.update( passwordId, {
      $set: {
        ...data
      }
    } )
  },

  'previousPasswords.remove'(passwordId, originalPasswordId, passwordVersion) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    PreviousPasswordsCollection.remove( {
      _id: passwordId
    } );

    PreviousPasswordsCollection.update({
      originalPasswordId,
      version: {
        $gt: passwordVersion
      }
    }, {
      $inc: {
        version: -1
      }
    });
  }
});
