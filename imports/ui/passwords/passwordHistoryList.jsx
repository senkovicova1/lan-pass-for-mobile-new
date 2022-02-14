import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import Select from 'react-select';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  setUsedPassword
} from '/imports/redux/metadataSlice';

import {
  PreviousPasswordsCollection
} from '/imports/api/previousPasswordsCollection';

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  BackIcon,
  HourglassIcon,
  RestoreIcon,
} from "/imports/other/styles/icons";

import {
  BorderedLinkButton,
  Card,
  List,
  LinkButton,
  PasswordContainer,
} from "/imports/other/styles/styledComponents";

import {
  listPasswordsInFolderStart,
  viewPasswordStart,
} from "/imports/other/navigationLinks";

const { DateTime } = require("luxon");

export default function PasswordHistoryList( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history,
    search,
    columns
  } = props;

  const userId = Meteor.userId();

  const {passwordID, folderID} = match.params;

  const folders = useSelector( ( state ) => state.folders.value );
  const folder = useMemo( () => {
    if ( folders.length > 0 ) {
      return folders.find( folder => folder._id === folderID );
    }
    return {};
  }, [ folders, folderID ] );

  const { previousVersions } = useTracker(() => {
    const noDataAvailable = { previousVersions: [] };
    if (!Meteor.user()) {
      return noDataAvailable;
    }
    const handler = Meteor.subscribe('previousPasswords');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    const previousVersions = PreviousPasswordsCollection.find(
      {
      originalPasswordId: passwordID
        },{
      sort: {
        version: 1
      }
    } ).fetch()

    return { previousVersions };
  });

  const { users, usersLoading } = useTracker(() => {
    const noDataAvailable = { users: [], usersLoading: true };
    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe('users');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    let users = Meteor.users.find( {}, {
    sort: {name: 1}
  }).fetch();

  users =  users.map( user =>  ({
            _id: user._id,
            ...user.profile,
            email: user.emails[0].address,
            label: `${user.profile.name} ${user.profile.surname}`,
            value: user._id,
          })
         )

    return {users, usersLoading: false};
  });

  const restorePassword = ( password ) => {
    if ( window.confirm( "Are you sure you want to restore this version?" ) ) {

          Meteor.call(
            'passwords.handleRestore',
            {
              ...password,
              updatedDate: parseInt(DateTime.now().toSeconds()),
              updatedBy: userId,
            },
          );

      history.push( `${listPasswordsInFolderStart}${folderID}` );
    }
  };

  const getUser = (id) => {
    const user = users.find(user => user._id === id);
    return user ? user.label : "Unknown";
  }

  const userCanRestorePassword = () => {
    return folder.users.find( user => user._id === userId )?.level <= 1;
  }

  return (
    <List columns={columns}>

      <h2>Previous versions</h2>

      <div className="command-bar">
          <BorderedLinkButton
            left
            onClick={(e) => {
              e.preventDefault();
              history.goBack();
            }}
            >
            <img
              src={BackIcon}
              alt=""
              className="icon"
              />
            Back
          </BorderedLinkButton>
      </div>

      {
        previousVersions.length === 0 &&
        <Card>
        <span className="message">There are no previous versions.</span>
      </Card>
      }

      {
        previousVersions.map((password) => (
          <PasswordContainer key={password._id}>
            <img
              onClick={() => {
                dispatch(setUsedPassword(password));
                history.push(`${viewPasswordStart}${folderID}/version/${password._id}`);
              }}
              src={HourglassIcon}
              alt=""
              className="icon start"
              />
            <div  onClick={() => {
                dispatch(setUsedPassword(password));
                history.push(`${viewPasswordStart}${folderID}/version/${password._id}`);
              }}>
              <label className="title">
                {`${password.title}`}
                {`Version from ${DateTime.fromSeconds(password.updatedDate).toFormat("dd.LL.y HH:mm")}`}
              </label>
              <label className="username">
                {`Changed password ${getUser(password.updatedBy ? password.updatedBy : password.editedBy)}`}
              </label>
            </div>
            {
              userCanRestorePassword &&
              <LinkButton onClick={(e) => {e.preventDefault(); restorePassword(password);}}>
                <img
                  src={RestoreIcon}
                  alt=""
                  className="icon"
                  />
              </LinkButton>
            }
          </PasswordContainer>
        ))
      }


    </List>
  );
};
