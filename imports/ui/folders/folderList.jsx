import React, {
  useState,
  useMemo,
  useCallback
} from 'react';

import { useSelector } from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import PasswordList from '/imports/ui/passwords/passwordList';
import {
  List,
  FloatingButton,
  FloatingDangerButton,
  ItemContainer,
  LinkButton
} from "../../other/styles/styledComponents";
import { PlusIcon, FolderIcon, DeleteIcon } from  "/imports/other/styles/icons";

import {
  listPasswordsInFolderStart,
  addFolder,
  deletedFolders
} from "/imports/other/navigationLinks";

export default function FolderList( props ) {

  const {
    match,
    history,
    active,
    search
  } = props;

  const folders = useSelector((state) => state.folders.value);
  const passwords = useSelector((state) => state.passwords.value);
  const user = useTracker( () => Meteor.user() );

  const [ showClosed, setShowClosed ] = useState(false);

    const myFolders = useMemo(() => {
      let newMyFolders = folders.filter(folder => (active && !folder.deletedDate) || (!active && folder.deletedDate));
      return newMyFolders;
    }, [folders]);

  const mySearchedFolders = useMemo(() => {
    return myFolders.filter(folder => folder.name.toLowerCase().includes(search.toLowerCase()));
  }, [search, myFolders])

  const permanentlyDelete = useCallback(() => {
    if ( window.confirm( "Are you sure you want to permanently remove these folders? Note: Only folders you have authorization to remove will be removed." ) ) {
      const foldersToDelete = mySearchedFolders.filter((folder) => folder.users.find((u) => u._id ===user._id).level === 0);
      foldersToDelete.forEach((folder) => {
         FoldersCollection.remove( {
        _id: folder._id
        } );
      });
      const fodlersIds = foldersToDelete.map(folder => folder._id);
      const passWordsToDelete = passwords.filter(pass => fodlersIds.includes(pass.folder));
      passWordsToDelete.forEach((pass) => {
         PasswordsCollection.remove( {
        _id: pass._id
        } );
      });
    }
  }, [mySearchedFolders, user._id]);

  if (search){
    return <PasswordList {...props} active={true} search={search}/>
  }

  return (
    <List>
      {
        mySearchedFolders.length === 0 &&
        <span className="message">You have no folders here</span>
      }
      {
        mySearchedFolders.map(folder =>
          <ItemContainer key={folder._id}>
            <span
              style={{paddingLeft: "0px"}}
              onClick={() => history.push(`${listPasswordsInFolderStart}${folder._id}`)}
              >
              <img
                className="icon folder"
                src={FolderIcon}
                alt="Folder icon not found"
                />
              {folder.name}
            </span>
          </ItemContainer>
        )
      }

      {
        active &&
        <ItemContainer key={"del"}>
          <span
            style={{paddingLeft: "0px"}}
            onClick={() => history.push(deletedFolders)}
            >
            <img
              className="icon folder"
              src={DeleteIcon}
              alt="Delete icon not found"
              />
            Deleted folders
          </span>
        </ItemContainer>
      }

      {
        !active &&
        mySearchedFolders.length !== 0 &&
        <FloatingDangerButton
          font="red"
          onClick={(e) => {
            e.preventDefault();
            permanentlyDelete();
          }}
          >
          <img
            className="icon"
            src={DeleteIcon}
            alt="Delete icon not found"
            />
          DELETE FOREVER ALL DELETED FOLDERS
        </FloatingDangerButton>
      }

      {
        active &&
        !match.params.folderID &&
        <FloatingButton
          onClick={() => history.push(addFolder)}
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

    </List>
  );
};
