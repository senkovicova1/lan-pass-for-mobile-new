import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import { NavLink } from 'react-router-dom';

import moment from 'moment';

import { useSelector } from 'react-redux';

import { FolderIcon, DeleteIcon, PlusIcon, UserIcon, ExpandIcon } from  "/imports/other/styles/icons";

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  Sidebar,
  LinkButton
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

  const { folderID } = match.params;
  const userId = Meteor.userId();
  const user = useTracker( () => Meteor.user() );
  const folders = useSelector((state) => state.folders.value);

  const [ showDeletedFolders, setShowDeletedFolders ] = useState( false );

  const myFolders = useMemo(() => {
    return folders.map(folder => ({...folder, label: folder.name, value: folder._id}));
  }, [userId, folders]);

  const myActiveFolders = useMemo(() => {
    return [...myFolders.filter(folder => !folder.deletedDate)];
  }, [myFolders]);

  const myInactiveFolders = useMemo(() => {
    return [...myFolders.filter(folder => folder.deletedDate)];
  }, [myFolders]);

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

  const userCanManageUsers = user && user.profile.rights && user.profile.rights.sysAdmin;

  return (
    <Sidebar>
      {
        myActiveFolders.map(folder => (
            <NavLink
              key={folder.value}
              className={folderID === folder.value ? "active" : ""}
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
          ))
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

      <div className="imitation-navlink">
        <LinkButton
          onClick={() => {
            setShowDeletedFolders(!showDeletedFolders);
          }}
          >
          <img
            className="icon"
            src={DeleteIcon}
            alt=""
            />
          Deleted
          <img
            className="icon last-icon"
            src={ExpandIcon}
            alt=""
            />
        </LinkButton>
      </div>

      {
        showDeletedFolders &&
        myInactiveFolders.map(folder => (
            <NavLink
              key={folder.value}
              className={folderID === folder.value ? "active" : ""}
              to={`/folders/list/${folder.value}`}
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
          )
        )
      }

      {
        userCanManageUsers &&
      <NavLink
        key={"users"}
        className={location.pathname.includes("users") ? "active" : ""}
        to={`/users/list`}
        onClick={() => {
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            closeSelf();
          }
        }}
        >
          <img
            className="icon"
            src={UserIcon}
            alt="Folder icon not found"
            />
          <span>Users</span>

      </NavLink>
    }

    </Sidebar>
  );
};
