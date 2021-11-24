import React from 'react';

import {
  useSelector
} from 'react-redux';

import AddPassword from '/imports/ui/passwords/addContainer';

import EditPassword from '/imports/ui/passwords/editContainer';

import PasswordList from '/imports/ui/passwords/list';

import PasswordView from '/imports/ui/passwords/view';

import PasswordHistoryList from '/imports/ui/passwords/passwordHistoryList';

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

  const {
    match,
    history,
    setSearch,
    search,
    sortBy,
    sortDirection,
  } = props;

  const {
    passwordID
  } = match.params;
  const userId = Meteor.userId();
  const layout = useSelector( ( state ) => state.metadata.value ).layout;

  if ( window.innerWidth <= 820 || layout === PLAIN ) {
    if ( passwordID === "password-add" ) {
      return <AddPassword {...props} />;
    }
    switch ( match.path ) {
      case listDeletedPasswordsInFolder:
        return <PasswordList {...props} active={false}/>;
      case listPasswordsInFolder:
        return <PasswordList {...props} active={true}/>;
      case viewPassword:
        return <PasswordView {...props} />;
      case editPassword:
        return <EditPassword {...props} />;
      case viewPreviousPassword:
        return <PasswordView {...props} />;
      case passwordHistory:
        return <PasswordHistoryList {...props} />
      default:
        return <PasswordList {...props} />;
    }
  }

  return (
    <div style={{display: "flex", height: "-webkit-fill-available"}}>
      <div style={{width: "600px"}}>
        {
          match.path.includes("deleted") &&
          <PasswordList {...props} columns={true} active={false}/>
        }
        {
          !match.path.includes("deleted") &&
          <PasswordList {...props} columns={true} active={true}/>
        }
      </div>
      <div style={{width: "-webkit-fill-available", backgroundColor: "transparent", height: "-webkit-fill-available", borderLeft: "0px solid #d6d6d6"}}>
        {
          passwordID &&
          (match.path === viewPassword || match.path === viewPreviousPassword) &&
          <PasswordView {...props} columns={true} />
        }
        {
          passwordID &&
          match.path === editPassword &&
          <EditPassword {...props} columns={true} />
        }
        {
          passwordID &&
          passwordID === "password-add" &&
          <AddPassword {...props} columns={true} />
        }

        {
          passwordID && match.path.includes("history") &&
          <PasswordHistoryList {...props} columns={true} />
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
