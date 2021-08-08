import {
  Mongo
} from 'meteor/mongo';

export const FoldersCollection = new Mongo.Collection( 'folders' );