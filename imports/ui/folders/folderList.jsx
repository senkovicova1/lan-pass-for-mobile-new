import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import PasswordList from '/imports/ui/passwords/list';

import {
  DeleteIcon,
  PlusIcon,
  FolderIcon,
} from "/imports/other/styles/icons";

import {
  BorderedLinkButton,
  Card,
  ItemContainer,
  List,
  LinkButton
} from "/imports/other/styles/styledComponents";

import {
  addFolder,
  deletedFolders,
  listPasswordsInFolderStart,
} from "/imports/other/navigationLinks";

export default function FolderList( props ) {

  const {
    match,
    history,
  } = props;

  const folders = useSelector( ( state ) => state.folders.value );
  const passwords = useSelector( ( state ) => state.passwords.value );
  const user = useTracker( () => Meteor.user() );
  const userId = Meteor.userId();

  const [ showClosed, setShowClosed ] = useState( false );

  const myFolders = useMemo( () => {
    let newMyFolders = folders.filter( folder => folder.deletedDate );
    return newMyFolders;
  }, [ folders ] );

  const permanentlyDelete = useCallback( () => {
    if ( window.confirm( "Are you sure you want to permanently remove these folders? Note: Only folders you have authorization to remove will be removed." ) ) {
      const foldersToDelete = myFolders.filter( ( folder ) => folder.users.find( ( u ) => u._id === user._id ).level === 0 );
      foldersToDelete.forEach( ( folder ) => {
        FoldersCollection.remove( {
          _id: folder._id
        } );
      } );
      const fodlersIds = foldersToDelete.map( folder => folder._id );
      const passWordsToDelete = passwords.filter( pass => fodlersIds.includes( pass.folder ) );
      passWordsToDelete.forEach( ( pass ) => {
        PasswordsCollection.remove( {
          _id: pass._id
        } );
      } );
    }
  }, [ myFolders, user._id ] );

  const getRights = (folder) => {
    const userLevel = folder.users.find(u => u._id === userId).level;
    switch (userLevel) {
      case 0:
        return "R W A";
        break;
      case 1:
        return "R W";
        break;
    case 2:
      return "R";
      break;
      default:
        return "R";
    }
  }

  return (
    <List  columns={false}>

      <span className="command-bar" style={{marginBottom: "1em", marginTop: "1em"}}>

            {
              myFolders.length !== 0 &&
              <div className="command">
              <BorderedLinkButton
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
              </BorderedLinkButton>
            </div>
            }

          </span>

      {
        myFolders.length === 0 &&
        <span className="message">You have no folders here</span>
      }
      {
        myFolders.map(folder =>
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
            <span style={{textAlign: "end"}}>{getRights(folder)}</span>
          </ItemContainer>
        )
      }

    </List>
  );
};
