import React from 'react';

import {
  check
} from 'meteor/check';
/*
import {
  CommentsCollection
} from '/imports/api/commentsCollection';

Meteor.methods({
  'comments.addComment'(author, task, dateCreated, body) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    CommentsCollection.insert( {
      author,
      task,
      dateCreated,
      body
    } );
  },

  'comments.editComment'(commentId, author, task, dateCreated, body) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      commentId,
      author,
      task,
      dateCreated,
      body
    };
    CommentsCollection.update( commentId, {
      $set: {
        ...data
      }
    } )
  },

  'comments.removeComment'(commentId) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    CommentsCollection.remove( {
      _id: commentId
    } );
  }
});
*/