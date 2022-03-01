import React from 'react';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

Meteor.publish('folders', function publishFolders() {
  return FoldersCollection.find( {
    users: {
      $elemMatch: {
        _id: this.userId
      }
    }
  });
} );
