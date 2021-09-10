import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import { NavLink } from 'react-router-dom';

import moment from 'moment';

import { useSelector } from 'react-redux';

import { FolderIcon, DeleteIcon, PlusIcon } from  "/imports/other/styles/icons";

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  Sidebar
} from "/imports/other/styles/styledComponents";
import {
  listPasswordsInFolderStart,
  deletedFolders
} from "/imports/other/navigationLinks";

export default function Menu( props ) {

  const {
    match,
    location,
    closeSelf
  } = props;

  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const folders = useSelector((state) => state.folders.value);

  const [ selectedFolder, setSelectedFolder ] = useState({});

  const myFolders = useMemo(() => {
    return folders.filter(folder => !folder.deletedDate).map(folder => ({...folder, label: folder.name, value: folder._id}));
  }, [userId, folders]);

  const myActiveFolders = useMemo(() => {
    return [...myFolders.filter(folder => !folder.deleted), {label: "Deleted folders", value: "deleted"}];
  }, [myFolders]);

  useEffect(() => {
    if (location.pathname == deletedFolders){
      setSelectedFolder({label: "Deleted folders", value: "deleted"});
    } else if (match.params.folderID && myFolders && myFolders.length > 0){
      const newFolder = myFolders.find(folder => folder._id === match.params.folderID);
      if (!newFolder){
        setSelectedFolder({label: "Deleted folders", value: "deleted"});
      } else {
        setSelectedFolder(newFolder);
      }
    } else {
      setSelectedFolder({});
    }
}, [match.params.folderID, location.pathname,  myFolders]);

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
    <Sidebar>
      {
        myActiveFolders.map(folder => {
          if (folder.value !== "deleted"){
          return (
            <NavLink
              key={folder.value}
              className={selectedFolder.value === folder.value ? "active" : ""}
              to={`${listPasswordsInFolderStart}${folder.value}`}
              onClick={() => {
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                  closeSelf();
                }
              }}
              >
                <img
                  className="icon"
                  src={FolderIcon}
                  alt="Folder icon not found"
                  />
              <span>{folder.label}</span>


              <span className="rights">{getRights(folder)}</span>
              
            </NavLink>
          );
        }
        })
      }

      <NavLink
        key={"add-folder"}
        to="/folders/add"
        onClick={() => {
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            closeSelf();
          }
        }}
        >
        <img
          className="icon"
          src={PlusIcon}
          alt="Plus icon not found"
          />
        Folder
      </NavLink>

      <NavLink
        key={"del"}
        className={selectedFolder.value === "deleted" ? "active" : ""}
        to={deletedFolders}
        onClick={() => {
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            closeSelf();
          }
        }}
        >
        <img
          className="icon"
          src={DeleteIcon}
          alt=""
          />
        Deleted
      </NavLink>

    </Sidebar>
  );
};
