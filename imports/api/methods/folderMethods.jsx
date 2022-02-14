import React from 'react';

import { check } from 'meteor/check';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

Meteor.methods({
  'folders.addFolder'( name, users, key, algorithm) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return FoldersCollection.insert( {
      name,
      users,
      key,
      algorithm
    });
  },

  'folders.editFolder'( folderId, name, users ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      name,
      users
    };
    return FoldersCollection.update( folderId, {
      $set: {
        ...data
      }
    } );
  },


    'folders.update'( folderId, data ) {
    //  check(taskId, String);
    //  check(isChecked, Boolean);

      if (!this.userId) {
        throw new Meteor.Error('Not authorized.');
      }
  
      return FoldersCollection.update( folderId, {
        $set: {
          ...data
        }
      } );
    },

    'folders.setKey'( folderId, key, algorithm ) {
    //  check(taskId, String);
    //  check(isChecked, Boolean);

      if (!this.userId) {
        throw new Meteor.Error('Not authorized.');
      }

      return FoldersCollection.update( folderId, {
        $set: {
          key,
          algorithm
        }
      } );
    },

  'folders.changeUsers'( folderId,  users, oldKey ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let newKey = {};
    for (var i = 0; i < users.length; i++) {
      newKey[users[i]._id] = oldKey[users[i]._id];
    }

    let data = {
      users,
      key: newKey
    };
    FoldersCollection.update( folderId, {
      $set: {
        ...data
      }
    } );
  },

  'folders.restoreFolder'( folderId ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      deletedDate: null
    };
    return FoldersCollection.update( folderId, {
      $set: {
        ...data
      }
    } );
  },

  'folders.deleteFolder'( folderId, deletedDate ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      deletedDate
    };
    return FoldersCollection.update( folderId, {
      $set: {
        ...data
      }
    } );
  },

  'folders.permanentlyDeleteFolder'(folderId) {
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
