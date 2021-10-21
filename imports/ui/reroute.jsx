import React, {
  useEffect,
  useMemo
} from 'react';

import {
  useSelector
} from 'react-redux';

import {
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

export default function Reroute( props ) {
const {
  match,
  history
} = props;
const {
  folderID
} = match.params;

const folders = useSelector( ( state ) => state.folders.value );

const myFolders = useMemo( () => {
  return folders.filter( folder => !folder.deletedDate ).map( folder => ( {
    ...folder,
    label: folder.name,
    value: folder._id
  } ) );
}, [ folders ] );

useEffect( () => {
  if ( match.path === "/" || match.path === "/folders" ) {
    if ( myFolders.length > 0 ) {
      const newFolder = myFolders[ 0 ];
      history.push( `/folders/list/${newFolder._id}` );
    }
  }
}, [ match.path, folderID, myFolders ] );

  return (
    <div style={{display: "none"}}></div>
  );
};
