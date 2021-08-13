import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import moment from 'moment';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import {
  selectStyle
} from '../../other/styles/selectStyles';

import { DeleteIcon, PlusIcon, LockIcon, RestoreIcon, FolderIcon } from  "/imports/other/styles/icons";

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';
import {
  List,
  PasswordContainer,
  FloatingButton,
  FloatingDangerButton,
  ItemContainer
} from "/imports/other/styles/styledComponents";
import {
  deletedFolders,
  listAllPasswords,
  addPassword,
  addFolder,
  viewPasswordStart
} from "/imports/other/navigationLinks";

export default function PasswordList( props ) {

    const {
      match,
      history,
      location,
      search,
      active
    } = props;

    const userId = Meteor.userId();

    const folderID = match.params.folderID;
    const folders = useSelector((state) => state.folders.value);
    const folder = useMemo(() => {
      if (folders.length > 0){
        return folders.find(folder => folder._id === folderID);
      }
      return {};
    }, [folders, folderID]);

  const listNotInFolder = folderID === "all" || match.path === "/";

  const allPasswords =  useSelector((state) => state.passwords.value);
  const passwords = allPasswords.filter(password => (listNotInFolder ||  password.folder === folderID) && password.version === 0 && ((active && !password.deletedDate) || (!active && password.deletedDate) ));

  const restoreFolder = ( ) => {
    if ( window.confirm( "Are you sure you want to restore this folder?" ) ) {
      let data = {
        deletedDate: null,
      };
      FoldersCollection.update( folderID, {
        $set: {
          ...data
        }
      } );
      history.push(`${listPasswordsInFolderStart}all`);
    }
  };

  const permanentlyDeleteFolder = ( ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this folder and all passwords in it?" ) ) {
        FoldersCollection.remove( {
          _id: folderID
        } );
        const passwordsToRemove = passwords.filter(pass => pass.folder === folderID);
        passwordsToRemove.forEach((pass, index) => {
          PasswordsCollection.remove( {
         _id: pass._id
         } );
        });
        history.push(`${listPasswordsInFolderStart}all`);
    }
  };

  const leaveFolder = ( ) => {
    if ( folder && window.confirm( "Are you sure you want to remove yourself from this folder?" ) ) {
        let data = {
          users: folder.users.filter(u => u._id !== userId),
        };
        FoldersCollection.update( folderID, {
          $set: {
            ...data
          }
        } );
        history.push(`${listPasswordsInFolderStart}all`);
    }
  };

    const searchedPasswords = useMemo(() => {
      return passwords.filter(password => password.title.toLowerCase().includes(search.toLowerCase()) || password.username.toLowerCase().includes(search.toLowerCase()));
    }, [passwords, search])

    const folderCanBeDeleted = useMemo(() => {
      return folder?.users?.find((user) => user._id === userId).level === 0;
    }, [folder]);

    const userIsNotAdmin = useMemo(() => {
      return folder?.users?.find((user) => user._id === userId).level !== 0;
    }, [folder]);

    const canAddPasswords = useMemo(() => {
      return folder?.users?.find((user) => user._id === userId).level <= 1;
    }, [folder]);

    if (!listNotInFolder && !folder){
      return (<div></div>)
    }

    const yellowMatch = (string) => {
      if (search.length === 0 || !string.toLowerCase().includes( search.toLowerCase() )){
        return string;
      }
      let startIndex = string.toLowerCase().indexOf( search.toLowerCase() );
      let endIndex = startIndex + search.length;
      return <span> {string.substring( 0, startIndex - 1 )} <span style={{ backgroundColor: "yellow" }}> {string.substring( startIndex, endIndex )} </span> {string.substring(endIndex )} </span>;
    }


  return (
    <List>
      {
        searchedPasswords.length === 0 &&
        <span className="message">You have no {active ? "" : "deleted"} passwords.</span>
      }

      {
        searchedPasswords.map((password) => (
          <PasswordContainer style={listNotInFolder ? { height: '5.5em', borderBottom: "1px solid #DDD"} : {}} key={password._id} onClick={() => history.push(`${viewPasswordStart}${listNotInFolder ? password.folder : folderID}/${password._id}`)}>
            <img
              src={LockIcon}
              alt=""
              className="icon"
              />
            <div>
              <label className="title">
                {yellowMatch(password.title)}
              </label>
              <label className="username">
                {yellowMatch(password.username)}
              </label>
              {
                listNotInFolder &&
                <label className="username">
                  <img
                    src={FolderIcon}
                    alt=""
                    className="icon"
                    />
                  {folders.length > 0 ? folders.find(f => f._id === password.folder).name : ""}
                </label>
              }
            </div>
          </PasswordContainer>
            ))
      }

      {
        !listNotInFolder &&
        active &&
        match.params.folderID &&
        !folder.deletedDate &&
        canAddPasswords &&
        <FloatingButton
          onClick={() => history.push(`/folders/${match.params.folderID}/password-add`)}
          >
          <img
            className="icon"
            src={PlusIcon}
            alt="Plus icon not found"
            />

          <span>
          Password
          </span>
        </FloatingButton>
      }

      {
        listNotInFolder &&
        active &&
        <FloatingButton
          onClick={() => history.push(`${addFolder}`)}
          >
          <img
            className="icon"
            src={PlusIcon}
            alt="Plus icon not found"
            />

          <span>
          Folder
          </span>
        </FloatingButton>
      }

      {
        !listNotInFolder &&
        active &&
        <ItemContainer key={"del"}>
          <span
            style={{paddingLeft: "0px"}}
            onClick={() => history.push(`${location.pathname}/deleted`)}
            >
            <img
              className="icon folder"
              src={DeleteIcon}
              alt="Delete icon not found"
              />
            Deleted passwords
          </span>
        </ItemContainer>
      }

      {
        !listNotInFolder &&
        active &&
        userIsNotAdmin &&
        <ItemContainer key={"leave"}>
          <span
            style={{paddingLeft: "0px", color: "red"}}
            onClick={() => leaveFolder()}
            >
            LEAVE THIS FOLDER
          </span>
        </ItemContainer>
      }

      {
        !listNotInFolder &&
        folder.deletedDate &&
        folderCanBeDeleted &&
        <FloatingDangerButton
          font="red"
          onClick={(e) => {
            e.preventDefault();
            permanentlyDeleteFolder();
          }}
          >
          <img
            className="icon"
            src={DeleteIcon}
            alt="Delete icon not found"
            />
          DELETE FOLDER FOREVER
        </FloatingDangerButton>
      }

      {
        !listNotInFolder &&
        folder.deletedDate &&
        folderCanBeDeleted &&
        <FloatingButton
          onClick={() => restoreFolder()}
          >
          <img
            className="icon"
            src={RestoreIcon}
            alt="Restore icon not found"
            />
          <span>
          Folder
        </span>
        </FloatingButton>
      }

    </List>
  );
};
