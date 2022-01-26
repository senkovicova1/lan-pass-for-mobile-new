import React, {
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
  setFolders
} from '/imports/redux/foldersSlice';

import {
  LogoutIcon,
  SettingsIcon,
} from "/imports/other/styles/icons";

import {
  setLayout,
  setSortBy,
  setSortDirection
} from '/imports/redux/metadataSlice';

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

import {
  Sort,
  LinkButton
} from '/imports/other/styles/styledComponents';

import {
  editCurrentUser,
  editFolderStart,
  login
} from "/imports/other/navigationLinks";

const sortByOptions = [
  {
    label: "Name",
    value: "name"
  },
  {
    label: "Creation date",
    value: "date"
  },
];

const sortDirectionOptions = [
  {
    label: "Ascending",
    value: "asc"
  },
  {
    label: "Descending",
    value: "desc"
  },
];

export default function SortAndLayout( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history,
    setOpenSort,
  } = props;

    const {
      folderID,
    } = match.params;

  const {
    layout,
    sortBy,
    sortDirection,
  } = useSelector( ( state ) => state.metadata.value );
  const folders = useSelector( ( state ) => state.folders.value );

  const currentUser = useTracker( () => Meteor.user() );

  const logout = () => {
    dispatch( setFolders( [] ) );
    Meteor.logout();
  }

  const avatar = useMemo( () => {
    if ( !currentUser || !currentUser.profile.avatar ) {
      return null;
    }
    return uint8ArrayToImg( currentUser.profile.avatar );
  }, [ currentUser ] );

    const folderCanBeEdited = folders.find( folder => folder._id === folderID )?.users.find( user => user._id === currentUser._id ).level === 0;

  return (
    <Sort id="sort-menu" name="sort-menu">
      {
        window.innerWidth > 820 &&
        <h3 id="sort-header-1" >Layout</h3>
      }
        {
          window.innerWidth > 820 &&
        <span id="sort-menu-plain-layout">
          <input
            id="plain-layout"
            name="layout"
            type="radio"
            checked={layout === PLAIN}
            onChange={() => {
              dispatch(setLayout(PLAIN));
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                setOpenSort(false);
              }
            }}
            />
          <label id="plain-layout-label" htmlFor="plain-layout">
            Basic
          </label>
        </span>
      }
        {
          window.innerWidth > 820 &&
        <span id="sort-menu-columns-layout">
          <input
            id="columns-layout"
            name="layout"
            type="radio"
            checked={layout === COLUMNS}
            onChange={() => {
              dispatch(setLayout(COLUMNS));
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                setOpenSort(false);
              }
            }}
            />
          <label id="columns-layout-label" htmlFor="columns-layout">
            Columns
          </label>
        </span>
      }

      <h3 id="sort-menu-header-2">Sort by</h3>
      {
        sortByOptions
        .flatMap(x => sortDirectionOptions.map(y => ({
          label: `${x.label}  (${y.label})`,
          value: `${x.value}-${y.value}`,
          sortByValue: x.value,
          sortDirectionValue: y.value
        })))
        .map(item => (
          <span id={`sort-menu-${item.value}`} key={item.value}>
            <input
              id={`${item.value}-order`}
              name="sort"
              type="radio"
              checked={sortBy === item.sortByValue && sortDirection === item.sortDirectionValue}
              onChange={() => {
                dispatch(setSortBy(item.sortByValue));
                dispatch(setSortDirection(item.sortDirectionValue));
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                  setOpenSort(false);
                }
              }}
              />
            <label id={`sort-menu-${item.value}-label`} htmlFor={`${item.value}-order`}>{item.label}</label>
          </span>
        ))
      }

      {
        window.innerWidth < 800 &&
        <h3 style={{marginTop: "0.6em"}}>Settings</h3>
        }

      {
        window.innerWidth < 800 &&
        currentUser &&
        !match.params.passwordID &&
        <LinkButton
          onClick={(e) => {
            e.preventDefault();
            history.push(editCurrentUser);
          }}
          >
          {
            avatar &&
            <img className="avatar" src={avatar} alt="assignedAvatar" />
          }
          {
            !avatar &&
            <img className="icon" src={UserIcon} alt="assignedAvatar" />
          }
          <span>
            Profile
          </span>
        </LinkButton>
      }

      {
        window.innerWidth < 800 &&
        folderID &&
        currentUser &&
        folderCanBeEdited &&
        !location.pathname.includes("edit") &&
        !location.pathname.includes("password") &&
        !match.params.passwordID &&
        <LinkButton
          onClick={(e) => {
            e.preventDefault();
            history.push(`${editFolderStart}${folderID}`);
          }}
          >
          <img
            className="icon"
            src={SettingsIcon}
            alt="Settings icon not found"
            />
            <span>
              Folder settings
            </span>
        </LinkButton>
      }

      {
        window.innerWidth < 800 &&
        currentUser &&
        <LinkButton
          onClick={(e) => {
            e.preventDefault();
            history.push(login);
            logout();
          }}
          >
          <img
            className="icon"
            src={LogoutIcon}
            alt="Logout icon not found"
            />
            <span>
              Log out
            </span>
        </LinkButton>
      }
    </Sort>
  );
};
