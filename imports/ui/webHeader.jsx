import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import {
  Link
} from 'react-router-dom';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';

import { setFolders } from '../redux/foldersSlice';

import { SettingsIcon, MenuIcon, LogoutIcon, CloseIcon, SearchIcon, LeftArrowIcon, UserIcon, MenuIcon2 } from  "/imports/other/styles/icons";

import { setLayout } from '/imports/redux/metadataSlice';
import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import Menu from './sidebar';

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';
import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';
import {
  PageHeader,
  LinkButton,
  FullButton,
  SearchSection,
  Input,
  Popover,
  Sort
} from '../other/styles/styledComponents';

import {
  listAllPasswords,
  addFolder,
  editFolder,
  editFolderStart,
  deletedFolders,
  listPasswordsInFolder,
  listPasswordsInFolderStart,
  listDeletedPasswordsInFolder,
  login,
  editCurrentUser,
  addPassword,
  editPassword,
  viewPassword,
  viewPreviousPassword,
  passwordHistory
} from "/imports/other/navigationLinks";

export default function WebHeader( props ) {

  const dispatch = useDispatch();

  const {
    match,
    location,
    history,
    setSearch,
    search,
    setParentOpenSidebar,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection
  } = props;

  const currentUser = useTracker( () => Meteor.user() );
  const layout = useSelector( ( state ) => state.metadata.value ).layout;

  const logout = () => {
    dispatch(setFolders([]));
    Meteor.logout();
  }

  const folderID = match.params.folderID;
  const folders = useSelector((state) => state.folders.value);
  const passwordID = match.params.passwordID;
  const passwords = useSelector((state) => state.passwords.value);
  const password = passwords.find(p => p._id === passwordID);

  const [ openSidebar, setOpenSidebar ] = useState(true);
  const [ openSort, setOpenSort ] = useState(false);
  const [ openSearch, setOpenSearch ] = useState(true);
  const [ title, setTitle ] = useState("LanPass");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const togglePopover = () => setPopoverOpen(!popoverOpen);

    useEffect(() => {
      if (location.pathname === deletedFolders) {
          setTitle("Deleted folders");
      } else if (location.pathname.includes("password-add")) {
        setTitle("Add password");
      } else if (!folderID) {
        setTitle("LanPass");
      } else if (location.pathname.includes("history")) {
        setTitle("Password history");
      } else {
        let folder = folders.find(folder => folder._id === folderID);
        if (folder) {
          setTitle(folder.name);
        } else {
          setTitle("LanPass");
        }
      }
    }, [folderID, location.pathname, folders]);

    const goBackInPage = useCallback(() => {
      switch (match.path) {
        case folders:
          break;
        case addFolder:
          history.goBack();
          break;
        case editFolder:
          history.push(`/folders/list/${match.params.folderID}`);
          break;
        case listPasswordsInFolder:
          history.push(`/folders`);
          break;

        case listDeletedPasswordsInFolder:
          history.push(`/folders/list/${match.params.folderID}`);
          break;
        case deletedFolders:
          history.push(`/folders`);
          break;
        case editCurrentUser:
          history.goBack();
          break;
        case addPassword:
          history.goBack();
          break;

        case editPassword:
          history.push(`/folders/list/${match.params.folderID}`);
          break;
        case viewPassword:
          history.push(`/folders/list/${match.params.folderID}`);
          break;
        case viewPreviousPassword:
          history.goBack();
          break;
        case passwordHistory:
          history.goBack();
          break;
        default:
          history.goBack();

      }
    }, [match.path, match.params, history]);

  const avatar = useMemo(() => {
    if (!currentUser || !currentUser.profile.avatar){
      return null;
    }
    return uint8ArrayToImg(currentUser.profile.avatar);
  }, [currentUser]);

  const folderCanBeEdited = folders.find(folder => folder._id === folderID)?.users.find(user => user._id === currentUser._id).level === 0;
  const passwordCanBeEdited = passwordID ?  folders.find(folder => folder._id === folderID)?.users.find(user => user._id === currentUser._id).level <= 0 : false;

    document.addEventListener("click", (evt) => {
        const sortMenu = document.getElementById("sort-menu");
        const openSortMenuBtn = document.getElementById("sort-menu-button");
        let targetElement = evt.target; // clicked element
        do {
            if (targetElement == sortMenu) {
                // This is a click inside. Do nothing, just return.
                return;
            }
            if (targetElement == openSortMenuBtn) {
                setOpenSort(!openSort);
                return;
            }
            // Go up the DOM
            targetElement = targetElement.parentNode;
        } while (targetElement);

        // This is a click outside.
        setOpenSort(false);
    });

    useEffect(() => {
      if (window.innerWidth >= 800) {
        setParentOpenSidebar(true);
        setOpenSidebar(true);
      } else {
        setOpenSidebar(false);
        setParentOpenSidebar(false);
      }
    }, [window.innerWidth]);

  return (
    <PageHeader>
      <section className="header-section">
        {
          currentUser &&
          <LinkButton
            font="white"
            onClick={(e) => {
              e.preventDefault();
              setOpenSidebar(!openSidebar);
              setParentOpenSidebar(!openSidebar);
            }}
            >
            <img
              className="icon"
              src={MenuIcon}
              alt="Menu icon not found"
              />
          </LinkButton>
        }
        <h1 onClick={(e) => props.history.push(`${listPasswordsInFolderStart}all`)}>{title}</h1>
      </section>
          {
            currentUser &&
          <SearchSection>
            <LinkButton
              font="#0078d4"
              searchButton
              onClick={(e) => {}}
              >
              <img
                className="search-icon"
                src={SearchIcon}
                alt="Search icon not found"
                />
            </LinkButton>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        <LinkButton
          font="#0078d4"
          searchButton
          onClick={(e) => {
            e.preventDefault();
            setSearch("");
          }}
          >
          <img
            className="search-icon"
            src={CloseIcon}
            alt="Close icon not found"
            />
        </LinkButton>
    </SearchSection>
  }

<section className="header-section" style={{justifyContent: "flex-end"}}>

      {
        currentUser &&
        <LinkButton
          font="white"
          id="sort-menu-button"
          name="sort-menu-button"
          onClick={(e) => {
            e.preventDefault();
            setOpenSort(!openSort);
          }}
          >
          <img
            className="icon"
            src={MenuIcon2}
            alt="MenuIcon2 icon not found"
            />
        </LinkButton>
      }

      {
        currentUser &&
        !match.params.passwordID &&
        <LinkButton
          font="white"
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
        </LinkButton>
      }

      {
        folderID &&
        currentUser &&
        folderCanBeEdited &&
        !location.pathname.includes("edit") &&
        !location.pathname.includes("password") &&
        !match.params.passwordID &&
        <LinkButton
          font="white"
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
        </LinkButton>
      }

      {
        currentUser &&
        <LinkButton
          font="white"
          onClick={(e) => {
            e.preventDefault();
            props.history.push(login);
            logout();
          }}
          >
          <img
            className="icon"
            src={LogoutIcon}
            alt="Logout icon not found"
            />
        </LinkButton>
      }
    </section>

      {
        openSidebar &&
        currentUser &&
        <Menu {...props} closeSelf={() => setOpenSidebar(false)}/>
      }
      {
        openSort &&
        <Sort id="sort-menu" name="sort-menu">
          <h3>Layout</h3>
            <span>
              <input
                id="plain-layout"
                name="plain-layout"
                type="checkbox"
                checked={layout === PLAIN}
                onChange={() => {
                  dispatch(setLayout(PLAIN));
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor="plain-layout">Basic</label>
            </span>

              <span>
                <input
                  id="columns-layout"
                  name="columns-layout"
                  type="checkbox"
                  checked={layout === COLUMNS}
                  onChange={() => {
                    dispatch(setLayout(COLUMNS));
                    if (/Mobi|Android/i.test(navigator.userAgent)) {
                      setOpenSort(!openSort);
                    }
                  }}
                  />
                <label htmlFor="columns-layout">Columns</label>
              </span>
          <h3>Sort by</h3>
          <span>
            <input
              id="sort-by-name-asc"
              name="sort-by-name-asc"
              type="checkbox"
              checked={sortBy === "name" && sortDirection === "asc"}
              onChange={() => {
                setSortBy("name");
                setSortDirection("asc");
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                  setOpenSort(!openSort);
                }
              }}
              />
            <label htmlFor="sort-by-name-asc">Name (ascending)</label>
          </span>

            <span>
              <input
                id="sort-by-name-desc"
                name="sort-by-name-desc"
                type="checkbox"
                checked={sortBy === "name" && sortDirection === "desc"}
                onChange={() => {
                  setSortBy("name");
                  setSortDirection("desc");
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor="sort-by-name-desc">Name (descending)</label>
            </span>

            <span>
              <input
                id="sort-by-date-asc"
                name="sort-by-date-asc"
                type="checkbox"
                checked={sortBy === "date" && sortDirection === "asc"}
                onChange={() => {
                  setSortBy("date");
                  setSortDirection("asc");
                  if (/Mobi|Android/i.test(navigator.userAgent)) {
                    setOpenSort(!openSort);
                  }
                }}
                />
              <label htmlFor="sort-by-name-asc">Date created (ascending)</label>
            </span>

              <span>
                <input
                  id="sort-by-date-desc"
                  name="sort-by-date-desc"
                  type="checkbox"
                  checked={sortBy === "date" && sortDirection === "desc"}
                  onChange={() => {
                    setSortBy("date");
                    setSortDirection("desc");
                    if (/Mobi|Android/i.test(navigator.userAgent)) {
                      setOpenSort(!openSort);
                    }
                  }}
                  />
                <label htmlFor="sort-by-name-asc">Date created (descending)</label>
              </span>
        </Sort>
      }

    </PageHeader>
  );
};
