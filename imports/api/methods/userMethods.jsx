import React from 'react';

import { check } from 'meteor/check';
/*
import {
  Accounts
} from 'meteor/accounts-base';

Meteor.methods({
  'users.editUser'( name, colour, archived, users) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    FoldersCollection.insert( {
      name,
      colour,
      archived,
      users,
    }, ( error, _id ) => {
      if ( error ) {
        console.log( error );
      } else {
        props.history.push( `/${_id}/list` );
      }
    } );
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

  'folders.editFolder'( name, colour, archived, users ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      name,
      colour,
      archived,
      users
    };
    FoldersCollection.update( folderID, {
      $set: {
        ...data
      }
    } );
  },

  'folders.removeComment'(folderId) {
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
