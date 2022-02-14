import {
  Mongo
} from 'meteor/mongo';

export const PreviousPasswordsCollection = new Mongo.Collection( 'previousPasswords' );
