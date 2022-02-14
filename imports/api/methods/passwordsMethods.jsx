import React from 'react';

import {
  check
} from 'meteor/check';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  PreviousPasswordsCollection
} from '/imports/api/previousPasswordsCollection';

Meteor.methods({
  'passwords.create'(title, folder, username, password, url, note, expires, expireDate, createdDate, updatedDate, originalPasswordId) {
  //  check(text, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    return PasswordsCollection.insert( {
      title,
      folder,
      username,
      password,
      url,
      note,
      expires,
      expireDate,
      createdDate,
      updatedDate,
      originalPasswordId
    } );
  },

  'passwords.update'(passwordId, data) {
  //  check(taskId, String);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    PasswordsCollection.update( passwordId, {
      $set: {
        ...data
      }
    } )
  },

    'passwords.handlePasswordUpdate'(newPassword, oldPassword) {
    //  check(taskId, String);

      if (!this.userId) {
        throw new Meteor.Error('Not authorized.');
      }

      let oldPasswordToSave = {
        ...oldPassword,
        version: 0,
        originalPasswordId: newPassword.originalPasswordId
      };
      delete oldPasswordToSave._id;

      PreviousPasswordsCollection.insert({
        ...oldPasswordToSave,
      });

      PasswordsCollection.remove({
        _id: oldPassword._id
      });

      PreviousPasswordsCollection.update({
        originalPasswordId: newPassword.originalPasswordId
      }, {
        $inc: {
          version: 1
        }
      }, {
        multi: true
      });

      PreviousPasswordsCollection.remove({
        originalPasswordId: newPassword.originalPasswordId,
        version: {
          $gte: 20
        }
      });

      return PasswordsCollection.insert( {
        ...newPassword
      } );
    },


        'passwords.handleRestore'(newPassword) {
        //  check(taskId, String);

          if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
          }

          const originalPasswordId = newPassword.originalPasswordId ? newPassword.originalPasswordId : newPassword._id;

          const currentPassword = PasswordsCollection.findOne({
            originalPasswordId,
          });

          let oldPasswordToSave = {
            ...currentPassword,
            version: 0,
            originalPasswordId
          };
          delete oldPasswordToSave._id;

          let newPasswordToSave = {
            ...newPassword,
            originalPasswordId
          };
          delete newPasswordToSave._id;
          delete newPasswordToSave.version;

          PreviousPasswordsCollection.insert({
            ...oldPasswordToSave,
          });

          PasswordsCollection.remove({
            _id: currentPassword._id
          });

          PreviousPasswordsCollection.update({
            originalPasswordId
          }, {
            $inc: {
              version: 1
            }
          }, { multi: true });

          PreviousPasswordsCollection.remove({
            originalPasswordId,
            version: {
              $gte: 20
            }
          }
          );

          return PasswordsCollection.insert( {
            ...newPasswordToSave,
          } );
        },

  'passwords.remove'(passwordId, originalPasswordId) {
  //  check(taskId, String);
  //  check(isChecked, Boolean);

    if (!this.userId) {
      throw new Meteor.Error('Not authorized.');
    }

    PasswordsCollection.remove( {
      _id: passwordId
    } );

    PreviousPasswordsCollection.remove({
      originalPasswordId
    });

  }
});
