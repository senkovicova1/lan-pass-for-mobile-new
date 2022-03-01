import {
  Meteor
} from 'meteor/meteor';
import {
  Accounts
} from 'meteor/accounts-base';
import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';
import {
  PreviousPasswordsCollection
} from '/imports/api/previousPasswordsCollection';
import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  UsersCollection
} from '/imports/api/usersCollection';
import {
  SharingCollection
} from '/imports/api/sharingCollection';

import { check } from 'meteor/check';

import '/imports/api/methods/passwordsMethods';
import '/imports/api/methods/previousPasswordsMethods';
import '/imports/api/methods/folderMethods';
import '/imports/api/methods/sharingMethods';

import '/imports/api/publications/passwordsPublications';
import '/imports/api/publications/previousPasswordsPublications';
import '/imports/api/publications/folderPublications';
import '/imports/api/publications/userPublications';
import '/imports/api/publications/sharingPublications';


Meteor.methods( {
  sendEmail( to, from, subject, text ) {
    console.log( "START SEND" );
    // Make sure that all arguments are strings.
    check( [ to, from, subject, text ], [ String ] );

    console.log( "CECK PASSED" );
    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();
    console.log( "UNLOCK" );
    Email.send( {
      to,
      from,
      subject,
      text
    } );
    console.log( "SEND END" );
  }
} );

Meteor.startup( () => {
  process.env.MAIL_URL = "smtp://lan-task@webmon.sk:ghx8R@3wRS@mail.webmon.sk:25";
} );
