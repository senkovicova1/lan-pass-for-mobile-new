import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import AddPassword from '/imports/ui/passwords/addContainer';

import EditPassword from '/imports/ui/passwords/editContainer';

import PasswordList from '/imports/ui/passwords/list';

import PasswordView from '/imports/ui/passwords/view';

import PasswordHistoryList from '/imports/ui/passwords/passwordHistoryList';

import Loader from '/imports/ui/other/loadingScreen';

import {
  setPasswords
} from '/imports/redux/passwordsSlice';

import {
  Card,
} from "/imports/other/styles/styledComponents";

import {
  PLAIN
} from "/imports/other/constants";

import {
  addPassword,
  editPassword,
  listDeletedPasswordsInFolder,
  listPasswordsInFolder,
  passwordHistory,
  viewPassword,
  viewPreviousPassword,
} from "/imports/other/navigationLinks";

export default function PasswordsContainer( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history,
  } = props;

  const {
    passwordID,
    folderID
  } = match.params;

  const isGlobalSearch = folderID === "search";
  const folders = useSelector( ( state ) => state.folders.value );
  const userId = Meteor.userId();
  const layout = useSelector( ( state ) => state.metadata.value ).layout;

  const folder = useSelector( ( state ) => state.metadata.value ).selectedFolder;

  const getFilter = () => {

    let result = {};
    if ( isGlobalSearch ) {
      result.folder = {
        $in: folders.map( folder => folder._id )
      }
    } else {
      result.folder = folderID;
    }

    if ( match.path === listDeletedPasswordsInFolder ) {
      result.deletedDate = {
        $gte: 0,
      }
    } else if ( match.path === listPasswordsInFolder ) {
      result.deletedDate = null;
    }

    return result;
  }

  const {
    passwords,
    passwordsLoading
  } = useTracker( () => {
    const noDataAvailable = {
      passwords: [],
      passwordsLoading: true
    };
    if ( !Meteor.user() ) {
      return noDataAvailable;
    }
    const handler = Meteor.subscribe( 'passwords' );

    if ( !handler.ready() ) {
      return noDataAvailable;
    }

    const passwords = PasswordsCollection.find(
      getFilter(), {
        fields: {
          title: 1,
          username: 1,
          password: 1,
          url: 1,
          folder: 1,
          passwordId: 1,
          note: 1
        },
        sort: {
          title: 1,
          username: 1
        }
      } ).fetch();

    return {
      passwords,
      passwordsLoading: false
    };
  } );

  if ( passwordsLoading ) {
    return ( <Loader /> )
  }

  if ( window.innerWidth <= 820 || layout === PLAIN ) {
    if ( passwordID === "password-add" ) {
      return <AddPassword {...props} />;
    }
    switch ( match.path ) {
      case listDeletedPasswordsInFolder:
        return <PasswordList {...props} active={false} passwords={passwords}/>;
      case listPasswordsInFolder:
        return <PasswordList {...props} active={true} passwords={passwords}/>;
      case viewPassword:
        return <PasswordView {...props} passwords={passwords} />;
      case editPassword:
        return <EditPassword {...props} passwords={passwords} />;
      case viewPreviousPassword:
        return <PasswordView {...props} passwords={passwords} />;
      case passwordHistory:
        return <PasswordHistoryList {...props} passwords={passwords} />
      default:
        return <PasswordList {...props} passwords={passwords}/>;
    }
  }

  return (
    <div style={{display: "flex", height: "-webkit-fill-available"}}>
      <div style={{width: "600px"}}>
        {
          match.path.includes("deleted") &&
          <PasswordList {...props} columns={true} active={false} passwords={passwords}/>
        }
        {
          !match.path.includes("deleted") &&
          <PasswordList {...props} columns={true} active={true} passwords={passwords}/>
        }
      </div>
      <div style={{width: "-webkit-fill-available", backgroundColor: "transparent", height: "-webkit-fill-available", borderLeft: "0px solid #d6d6d6"}}>
        {
          passwordID &&
          (match.path === viewPassword || match.path === viewPreviousPassword) &&
          <PasswordView {...props} columns={true} passwords={passwords} />
        }
        {
          passwordID &&
          match.path === editPassword &&
          <EditPassword {...props} columns={true} passwords={passwords} />
        }
        {
          passwordID &&
          passwordID === "password-add" &&
          <AddPassword {...props} columns={true} passwords={passwords} />
        }

        {
          passwordID && match.path.includes("history") &&
          <PasswordHistoryList {...props} columns={true} passwords={passwords} />
        }
        {
          !passwordID &&
          <Card style={{marginTop: "63.5px"}}>
            <div style={{paddingLeft: "20px"}}><h2>No chosen note</h2> </div>
          </Card>
        }
      </div>
    </div>
  );
};
