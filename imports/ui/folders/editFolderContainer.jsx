import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import moment from 'moment';

import {
  useSelector
} from 'react-redux';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import FolderForm from '/imports/ui/folders/folderForm';

import {
  listPasswordsInFolderStart,
} from "/imports/other/navigationLinks";

export default function EditFolderContainer( props ) {

  const {
    match,
    history
  } = props;

  const folderID = match.params.folderID;
  const folders = useSelector( ( state ) => state.folders.value );
  const folder = useMemo( () => {
    return folders.find( folder => folder._id === folderID );
  }, [ folders, folderID ] );

  const userId = Meteor.userId();

  useEffect( () => {
    if ( folder ) {
      const userIsAdmin = folder.users.find( user => user._id === userId ).level === 0;

      if ( !userIsAdmin ) {
        history.goBack();
      }
    }

  }, [ userId, folder ] );

  const editFolder = ( name, users ) => {
    let data = {
      name,
      users
    };
    FoldersCollection.update( folderID, {
      $set: {
        ...data
      }
    }, ( error ) => {
      if ( error ) {
        console.log( error );
      } else {
        history.push( `/folders/list/${folderID}` );
      }
    } );
  };

  const removeFolder = ( folderId ) => {
    if ( window.confirm( "Are you sure you want to remove this folder? Note: Folder will be moved to the \"Deleted fodlers\" section." ) ) {
      let data = {
        deletedDate: moment().unix(),
      };
      FoldersCollection.update( folderID, {
        $set: {
          ...data
        }
      } );
      props.history.goBack();
    }
  }

  const cancel = () => {
    props.history.goBack();
  }

  return (
    <FolderForm
      {...folder}
      onSubmit={editFolder}
      onCancel={cancel}
      onRemove={removeFolder}
      />
  );
};
