import {
  Mongo
} from 'meteor/mongo';

Meteor.users.allow( {
  insert() {
    return true;
  },

  update() {
    return true;
  },
} );