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
import {
  UserIcon
} from "/imports/other/styles/icons";

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

export default function EditUserContainer( props ) {

  const {
    history,
    userID,
    closeSelf
  } = props;

  const userId = Meteor.userId();

  const { user } = useTracker(() => {
    const noDataAvailable = { users: [], usersLoading: true };
    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe('users');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    let user = Meteor.users.findOne( {
      _id: (userID ? userID : userId)
    });

    user = {
    _id: user._id,
    ...user.profile,
    email: user.emails[0].address,
    label: `${user.profile.name} ${user.profile.surname}`,
    value: user._id,
    img: user.profile.avatar ? uint8ArrayToImg( user.profile.avatar ) : UserIcon
  };

    return {user};
  });

  /*
    const { myFolders, foldersLoading } = useTracker(() => {
      const noDataAvailable = { myFolders: [], foldersLoading: true };
      if (!Meteor.user()) {
        return noDataAvailable;
      }
      const handler = Meteor.subscribe('folders');

      if (!handler.ready()) {
        return noDataAvailable;
      }

      const myFolders = FoldersCollection.find({
        users: {
          $elemMatch: {
            _id: userId
          }
        },
      }, {
        sort: {name: 1}
      }).fetch();

      return { myFolders, foldersLoading: false };
    });*/

  const editUser = ( name, surname, avatar, rights ) => {
    let data = { name, surname, avatar, rights};
    Meteor.users.update((userID ? userID : userId), {
      $set: {
        "profile.name": name,
      },
        $set: {
          "profile.surname": surname,
        },
          $set: {
            "profile.avatar": avatar,
          },
            $set: {
              "profile.rights": rights,
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

  if (!user){
    return <div>NO</div>
  }

  if (!userID){
    return (
        <CurrentUserForm
          _id={user._id}
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
