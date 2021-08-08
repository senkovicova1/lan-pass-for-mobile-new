import React, {
  useState,
  useEffect,
  useMemo
} from 'react';
import moment from 'moment';

import { useSelector } from 'react-redux';
import {
  Modal,
  ModalBody
} from 'reactstrap';

import FolderForm from './folderForm';
import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  listFolders,
} from "/imports/other/navigationLinks";

export default function EditFolderContainer( props ) {

  const {
    match,
    history
  } = props;

  const folderID = match.params.folderID;
  const folders = useSelector((state) => state.folders.value);
  const folder = useMemo(() => {
    return  folders.find(folder => folder._id === folderID);
  }, [folders, folderID]);

  const userId = Meteor.userId();

    useEffect( () => {
      if (folder){
        const userIsAdmin = folder.users.find(user => user._id === userId).level === 0;

        if ( !userIsAdmin ) {
          history.push(listFolders);
        }
      }

    }, [ userId, folder ] );

  const editFolder = ( name, users ) => {
    let data = {
      name, users
    };
    FoldersCollection.update( folderID, {
      $set: {
        ...data
      }
    } );
    cancel();
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
      props.history.push(listFolders);
    }
  }

  const cancel = () => {
    props.history.goBack();
  }

  return (
      <FolderForm {...folder} onSubmit={editFolder} onCancel={cancel} onRemove={removeFolder}/>
  );
};
