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
import { useSelector } from 'react-redux';

import { useDispatch } from 'react-redux';
import { setFolders } from '../redux/foldersSlice';

import { SettingsIcon, MenuIcon, LogoutIcon, DeleteIcon, CloseIcon, SearchIcon, LeftArrowIcon, UserIcon, EyeIcon, MenuIcon2 } from  "/imports/other/styles/icons";

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
  Popover
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
    toggleRevealPassword
  } = props;

  const currentUser = useTracker( () => Meteor.user() );

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

    const removePassword = () => {
      const passwordToRemove = passwords.find(pass => pass._id === passwordID);
      let message = "Are you sure you want to remove this password? Note: Password will be moved to the \"Deleted passwords\" section.";
      if (passwordToRemove.version > 0){
        message =  "Are you sure you want to remove this version? ";
      }
      if ( window.confirm( message ) ) {
        if (passwordToRemove.version === 0 && !passwordToRemove.deletedDate){
          let data = {
            deletedDate: moment().unix(),
          };
          PasswordsCollection.update( passwordToRemove._id, {
            $set: {
              ...data
            }
          } );
        } else if (passwordToRemove.version === 0) {
          PasswordsCollection.remove( {
         _id: passwordToRemove._id
         } );
         const passwordsToUpdate = passwords.filter(pass => [pass.passwordId, pass._id].includes(passwordToRemove.passwordId));
         passwordsToUpdate.forEach((pass, index) => {
           PasswordsCollection.remove( {
          _id: pass._id
          } );
         });
        } else {
            PasswordsCollection.remove( {
           _id: passwordToRemove._id
           } );
           const passwordsToUpdate = passwords.filter(pass => [pass.passwordId, pass._id].includes(passwordToRemove.passwordId) && pass.version > passwordToRemove.version);
           passwordsToUpdate.forEach((pass, index) => {
               PasswordsCollection.update( pass._id, { $inc: { version: -1 } } );
           });
        }
        history.push(`${listPasswordsInFolderStart}${folderID}`);
      }
    };

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
        match.params.passwordID &&
        !location.pathname.includes("history") &&
        !location.pathname.includes("edit") &&
        <LinkButton
          onClick={(e) => {
            e.preventDefault();
            toggleRevealPassword();
          }}
          >
        <img className="icon" src={EyeIcon} alt="reveal pass" />
        </LinkButton>
      }
      {
        match.params.passwordID &&
        !location.pathname.includes("history") &&
        password.version === 0 &&
        passwordCanBeEdited &&
        <LinkButton
          onClick={(e) => {
            e.preventDefault();
            togglePopover();
          }}
          >
          <img className="icon" src={MenuIcon2} alt="menu icon" />
        </LinkButton>
      }
      {
        match.params.passwordID &&
        !location.pathname.includes("history") &&
        passwordCanBeEdited &&
        password.version === 0 &&
        popoverOpen &&
        <Popover>
          <LinkButton
            onClick={(e) => {
              e.preventDefault();
              togglePopover();
              removePassword();
            }}
            >
            <img className="basic-icon" src={DeleteIcon} alt="delete" />
            Delete
          </LinkButton>
        </Popover>
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

    </PageHeader>
  );
};
