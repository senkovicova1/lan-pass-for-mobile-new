import React from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import UserForm from './userForm';

import {
  listFolders,
} from "/imports/other/navigationLinks";

export default function EditUserContainer( props ) {

  const {
    history,
  } = props;

  const user = useTracker( () => Meteor.user() );

  const editUser = ( name, surname, avatar ) => {
    let data = {name, surname, avatar};

    Meteor.users.update(user._id, {
      $set: {
        profile: data
      }
    });
    history.push(listFolders);
  };


  return (
        <UserForm {...user} onSubmit={editUser} onCancel={() => props.history.push(listFolders)}/>
  );
};
