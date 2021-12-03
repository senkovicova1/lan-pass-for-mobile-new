import {
  Mongo
} from 'meteor/mongo';

export const MetaCollection = new Mongo.Collection( 'metadata' );