import React from 'react';

import {
  MetaCollection
} from '/imports/api/metaCollection';

Meteor.publish('metadata', function publishMeradata() {
  return MetaCollection.find( {} );
});
