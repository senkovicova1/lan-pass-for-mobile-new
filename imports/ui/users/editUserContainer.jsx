import React from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';
import { useSelector } from 'react-redux';

import UserForm from './form';
import CurrentUserForm from './currentUserForm';

import {
  getGoToLink
} from "/imports/other/navigationLinks";

export default function EditUserContainer( props ) {

  const {
    history,
    userID,
    closeSelf
  } = props;

  const userId = Meteor.userId();
  const user = useSelector((state) => state.users.value).find(u => u._id === (userID ? userID : userId));

  const editUser = ( name, surname, avatar, rights ) => {
    let data = { name, surname, avatar, rights};
    Meteor.users.update((userID ? userID : userId), {
      $set: {
        profile: data
      }
    }, (error) => {
      if (error){
        console.log(error);
      } else if (closeSelf){
          closeSelf();
      } else {
        history.push( "" );
      }
    });
  };

  const onCancel = () => {
    if (closeSelf){
      closeSelf();
    } else {
      history.push( "" );
    }
  }

  if (!userID){
    return (
        <CurrentUserForm
          user={user}
          onSubmit={editUser}
          onCancel={onCancel}
          />
    )
  }

  return (
        <UserForm
          user={user}
          onSubmit={editUser}
          onCancel={onCancel}
          />
  );
};
