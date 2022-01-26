import React from 'react';

import { check } from 'meteor/check';
/*
import {
  FoldersCollection
} from '/imports/api/foldersCollection';

Meteor.methods({
  'folders.addFolder'( name, colour, archived, tags, users) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return FoldersCollection.insert( {
      name,
      colour,
      archived,
      tags,
      users,
    });
  },

  'folders.editContianers'( containers, folderId) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    FoldersCollection.update( folderId, {
      $set: {
        containers
      }
    } );
  },

  'folders.editFolder'( folderId, name, colour, archived, tags, users ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      name,
      colour,
      archived,
      tags,
      users
    };
    FoldersCollection.update( folderId, {
      $set: {
        ...data
      }
    } );
  },

  'folders.removeFolder'(folderId) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    FoldersCollection.remove( {
      _id: folderId
    } );
  }
});
*/
