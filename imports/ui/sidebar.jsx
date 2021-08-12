import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import { NavLink } from 'react-router-dom';

import moment from 'moment';

import { useSelector } from 'react-redux';

import { ListIcon, FolderIcon, DeleteIcon } from  "/imports/other/styles/icons";

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

  const [ selectedFolder, setSelectedFolder ] = useState({label: "All passwords", value: "all"});

  const myFolders = useMemo(() => {
    return folders.filter(folder => !folder.deletedDate).map(folder => ({...folder, label: folder.name, value: folder._id}));
  }, [userId, folders]);

  const myActiveFolders = useMemo(() => {
    return [{label: "All passwords", value: "all"}, ...myFolders.filter(folder => !folder.deleted), {label: "Deleted folders", value: "deleted"}];
  }, [myFolders]);

  useEffect(() => {
    if (!match.params.folderID || match.params.folderID === "all"){
      setSelectedFolder({label: "All passwords", value: "all"});
    } else if (location.pathname == deletedFolders){
      setSelectedFolder({label: "Deleted folders", value: "deleted"});
    } else if (myFolders && myFolders.length > 0){
      const newFolder = myFolders.find(folder => folder._id === match.params.folderID);
      setSelectedFolder(newFolder);
  } else {
    setSelectedFolder({label: "All passwords", value: "all"});
  }
}, [match.params.folderID, location.pathname,  myFolders]);

  const getRights = (folder) => {
    console.log(folder);
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

  console.log(myActiveFolders);

  return (
    <Sidebar>
      {
        myActiveFolders.map(folder => {
          if (folder.value === "deleted"){
            return (
              <NavLink
                key={folder.value}
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
                {folder.label}
              </NavLink>
            );
          }
          return (
            <NavLink
              key={folder.value}
              to={`${listPasswordsInFolderStart}${folder.value}`}
              onClick={() => {
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                  closeSelf();
                }
              }}
              >
              {
                folder.value === "all" &&
                <img
                  className="icon"
                  src={ListIcon}
                  alt="List icon not found"
                  />
              }
              {
                folder.value !== "all" &&
                <img
                  className="icon"
                  src={FolderIcon}
                  alt="Folder icon not found"
                  />
              }
              <span>{folder.label}</span>

                {
                  folder.value !== "all" &&
              <span className="rights">{getRights(folder)}</span>
              }
            </NavLink>
          );
        })
      }
    </Sidebar>
  );
};
