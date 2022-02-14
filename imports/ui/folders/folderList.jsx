import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  setFolder
} from '/imports/redux/metadataSlice';

import {
  MetaCollection
} from '/imports/api/metaCollection';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

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

  const dispatch = useDispatch();

  const {
    match,
    history,
  } = props;

  const passwords = useSelector( ( state ) => state.passwords.value );
  const folders = useSelector( ( state ) => state.passwords.value );
  const user = useTracker( () => Meteor.user() );
  const userId = Meteor.userId();

  const [ showClosed, setShowClosed ] = useState( false );

    const { myFolders } = useTracker(() => {
      const noDataAvailable = { myFolders: [] };
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
        deletedDate: {
        $gte: 0
      }
      }, {
        sort: {name: 1}
      }).fetch();

      return { myFolders };
    });

  const permanentlyDelete = useCallback( () => {
    if ( window.confirm( "Are you sure you want to permanently remove these folders? Note: Only folders you have authorization to remove will be removed." ) ) {
      const foldersToDelete = myFolders.filter( ( folder ) => folder.users.find( ( u ) => u._id === user._id ).level === 0 );
      foldersToDelete.forEach( ( folder ) => {

              Meteor.call(
                'folders.permanentlyDeleteFolder',
                folderID
              );

      } );
      const fodlersIds = foldersToDelete.map( folder => folder._id );
      const passWordsToDelete = passwords.filter( pass => fodlersIds.includes( pass.folder ) );
      passWordsToDelete.forEach( ( pass ) => {

              Meteor.call(
                'passwords.remove',
                pass._id
              );

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

      <span className="command-bar" style={{marginBottom: "1em"}}>


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
              onClick={() =>{
                dispatch(setFolder(folder)); history.push(`${listPasswordsInFolderStart}${folder._id}`)
              }}
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
