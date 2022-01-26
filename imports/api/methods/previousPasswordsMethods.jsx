import React from 'react';

import { check } from 'meteor/check';
/*
import {
  FiltersCollection
} from '/imports/api/filtersCollection';

Meteor.methods({
  'filters.addFilter'( name, user, title, folders, important, assigned, datetimeMin, datetimeMax, dateCreatedMin, dateCreatedMax, showClosed) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return FiltersCollection.insert( {
      name,
      user,
      title,
      folders,
      important,
      assigned,
      datetimeMin,
      datetimeMax,
      dateCreatedMin,
      dateCreatedMax,
      showClosed
    });
  },

  'filters.editFilter'( _id, name, user, title, folders, important, assigned, datetimeMin, datetimeMax, dateCreatedMin, dateCreatedMax, showClosed ) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    let data = {
      name,
      user,
      title,
      folders,
      important,
      assigned,
      datetimeMin,
      datetimeMax,
      dateCreatedMin,
      dateCreatedMax,
      showClosed
    };
    return FiltersCollection.update( _id, {
      $set: {
        ...data
      }
    });
  },

  'filters.removeFilter'( _id ) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    FiltersCollection.remove( {
      _id
    } );
  },

});
*/
