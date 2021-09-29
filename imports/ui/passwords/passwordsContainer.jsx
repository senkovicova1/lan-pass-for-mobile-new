import React from 'react';
import {
  useSelector
} from 'react-redux';

import PasswordList from '/imports/ui/passwords/list';
import PasswordView from '/imports/ui/passwords/view';
import AddPassword from '/imports/ui/passwords/addContainer';
import PasswordHistoryList from '/imports/ui/passwords/passwordHistoryList';
import EditPassword from '/imports/ui/passwords/editContainer';

import {
  PLAIN
} from "/imports/other/constants";
import {
  listPasswordsInFolder,
  listDeletedPasswordsInFolder,
  viewPreviousPassword,
  passwordHistory,
  addPassword,
  editPassword,
  viewPassword,
} from "/imports/other/navigationLinks";

export default function PasswordsContainer( props ) {

  const {
    match,
    history,
    search,
    sortBy,
    sortDirection,
  } = props;

  const { passwordID} = match.params;
  const userId = Meteor.userId();
  const layout = useSelector( ( state ) => state.metadata.value ).layout;

  if (window.innerWidth <= 820 || layout === PLAIN){
    switch (match.path) {
      case listDeletedPasswordsInFolder:
        return <PasswordList {...props} active={false}/>;
      case listPasswordsInFolder:
        return <PasswordList {...props} active={true}/>;
      case viewPassword:
        return <PasswordView {...props} />;
      case editPassword:
        return <EditPassword {...props} />;
      case viewPreviousPassword:
        return <PasswordView {...props} />
      case passwordHistory:
        return <PasswordHistoryList {...props} />
      default:
        return <PasswordList {...props} />;
    }
  }

  return (
    <div style={{display: "flex", height: "-webkit-fill-available"}}>
      <div style={{width: "100%", position: "relative"}}>
        {
          match.path.includes("deleted") &&
          <PasswordList {...props} active={false}/>
        }
        {
          !match.path.includes("deleted") &&
          <PasswordList {...props} active={true}/>
          }
      </div>
      <div style={{width: "80%", backgroundColor: "white", height: "-webkit-fill-available", position: "relative"}}>
        {
          passwordID &&
          (match.path === viewPassword || match.path === viewPreviousPassword) &&
          <PasswordView {...props} />
        }
          {
            passwordID &&
            match.path === editPassword &&
            <EditPassword {...props} />
          }
          {
            passwordID &&
            passwordID === "password-add" &&
            <AddPassword {...props} />
          }

          {
            passwordID && match.path.includes("history") &&
            <PasswordHistoryList {...props} />
          }
        {
          !passwordID &&
        <div style={{paddingLeft: "20px"}}><h2>No chosen note</h2> </div>
      }
      </div>
    </div>
  );
};
