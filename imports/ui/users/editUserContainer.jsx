import React from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import UserForm from './userForm';

import {
  listAllPasswords,
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

export default function EditUserContainer( props ) {

  const {
    history,
  } = props;

  const user = useTracker( () => Meteor.user() );

  const editUser = ( name, surname, avatar ) => {
    let data = {...user.profile, name, surname, avatar};

    Meteor.users.update(user._id, {
      $set: {
        profile: data
      }
    });
    history.push(`${listPasswordsInFolderStart}all`);
  };


  return (
        <UserForm {...user} onSubmit={editUser} onCancel={() => props.history.push(`${listPasswordsInFolderStart}all`)}/>
  );
};
