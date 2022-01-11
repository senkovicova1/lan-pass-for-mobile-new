import React, {
  useEffect,
  useMemo
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  setFolder
} from '/imports/redux/metadataSlice';

import {
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

export default function Reroute( props ) {

  const dispatch = useDispatch();

const {
  match,
  history
} = props;
const {
  folderID
} = match.params;

const folders = useSelector( ( state ) => state.folders.value );

useEffect( () => {
  if ( match.path === "/" || match.path === "/folders" ) {
    if ( folders.length > 0 ) {
      const newFolder = folders[0];
      dispatch(setFolder(newFolder));
      history.push( `/folders/list/${newFolder._id}` );
    }
  }
}, [ match.path, folderID, folders ] );

  return (
    <div style={{display: "none"}}></div>
  );
};
