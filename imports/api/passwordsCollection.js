import {
  Mongo
} from 'meteor/mongo';

export const PasswordsCollection = new Mongo.Collection( 'passwords' );