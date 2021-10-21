import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import moment from 'moment';

import Select from 'react-select';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  BackIcon,
  HourglassIcon,
  RestoreIcon,
} from "/imports/other/styles/icons";

import {
  FloatingButton,
  List,
  LinkButton,
  PasswordContainer,
} from "/imports/other/styles/styledComponents";

import {
  listPasswordsInFolderStart,
  viewPasswordStart,
} from "/imports/other/navigationLinks";

export default function PasswordHistoryList( props ) {

  const {
    match,
    history,
    search,
  } = props;

  const userId = Meteor.userId();

  const dbUsers = useSelector( ( state ) => state.users.value );

  const folderID = match.params.folderID;
  const folders = useSelector( ( state ) => state.folders.value );
  const folder = useMemo( () => {
    if ( folders.length > 0 ) {
      return folders.find( folder => folder._id === folderID );
    }
    return {};
  }, [ folders, folderID ] );

  const passwordId = match.params.passwordID;
  const passwords = useSelector( ( state ) => state.passwords.value ).filter( password => [ password.passwordId, password._id ].includes( passwordId ) );
  const usedVersion = passwords.find( pass => pass.version === 0 );
  const previousVersions = passwords.filter( pass => pass.version > 0 ).sort( ( p1, p2 ) => p1 > p2 ? 1 : -1 ).map( pass => ( {
    ...pass,
    editedBy: dbUsers.find( user => user._id === pass.editedBy )
  } ) );

  const restorePassword = ( password ) => {
    if ( window.confirm( "Are you sure you want to restore this version?" ) ) {
      const passwordId = password.passwordId ? password.passwordId : password._id;

      PasswordsCollection.insert( {
        title: password.title,
        username: password.username,
        password: password.password,
        quality: password.quality,
        note: password.note,
        expires: password.expires,
        expireDate: password.expireDate,
        folder: password.folder,
        createdDate: password.createdDate,
        version: 0,
        updatedDate: moment().unix(),
        passwordId,
      } );

      passwords.forEach( ( pass, index ) => {
        if ( pass.version >= 20 ) {
          PasswordsCollection.remove( {
            _id: pass._id
          } );
        } else {
          if ( pass.version === 0 ) {
            PasswordsCollection.update( pass._id, {
              $inc: {
                version: 1
              },
              $set: {
                editedBy: userId
              }
            } );
          } else {
            PasswordsCollection.update( pass._id, {
              $inc: {
                version: 1
              }
            } );
          }
        }
      } );

      history.push( `${listPasswordsInFolderStart}${folderID}` );
    }
  };

  const userCanRestorePassword = () => {
    return folder.users.find( user => user._id === userId )?.level <= 1;
  }

  return (
    <List>
      {
        previousVersions.length === 0 &&
        <span className="message">There are no previous versions.</span>
      }

      {
        previousVersions.map((password) => (
          <PasswordContainer key={password._id}>
            <img
              onClick={() => history.push(`${viewPasswordStart}${folderID}/version/${password._id}`)}
              src={HourglassIcon}
              alt=""
              className="icon start"
              />
            <div  onClick={() => history.push(`${viewPasswordStart}${folderID}/version/${password._id}`)}>
              <label className="title">
                {`Version from ${moment.unix(password.updatedDate).format("D.M.YYYY HH:mm:ss")}`}
              </label>
              <label className="username">
                {`Changed password ${password.editedBy ? password.editedBy.label : ""}`}
              </label>
            </div>
            {
              !usedVersion.deletedDate &&
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

      <FloatingButton
        left
        onClick={(e) => {
          e.preventDefault();
          history.goBack();
        }}
        >
        <img
          style={{marginRight: "2px"}}
          src={BackIcon}
          alt=""
          className="icon"
          />
      </FloatingButton>

    </List>
  );
};
