import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  setFolders
} from '../redux/foldersSlice';

import {
  useTracker
} from 'meteor/react-meteor-data';

import Menu from './sidebar';
import SortAndLayout from '/imports/ui/other/sortAndLayout';

import {
  LogoutIcon,
  MenuIcon,
  MenuIcon2,
  SettingsIcon,
} from "/imports/other/styles/icons";

import {
  PageHeader,
  LinkButton,
} from '/imports/other/styles/styledComponents';

import {
  COLUMNS
} from "/imports/other/constants";

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

import {
  deletedFolders,
  editCurrentUser,
  editFolderStart,
  login,
} from "/imports/other/navigationLinks";

export default function Header( props ) {

  const dispatch = useDispatch();


  const {
    match,
    history,
    setParentOpenSidebar,
  } = props;

  const currentUser = useTracker( () => Meteor.user() );
  const {
    layout,
  } = useSelector( ( state ) => state.metadata.value );
    const {
      folderID,
    } = match.params;
    const folders = useSelector( ( state ) => state.folders.value );

  const [ title, setTitle ] = useState( "LanPass" );
  const [ openSidebar, setOpenSidebar ] = useState( true );
  const [ openSort, setOpenSort ] = useState( false );

  useEffect( () => {
    if ( window.innerWidth >= 800 ) {
      setParentOpenSidebar( true );
      setOpenSidebar( true );
    } else {
      setOpenSidebar( false );
      setParentOpenSidebar( false );
    }
  }, [ window.innerWidth ] );

  useEffect( () => {
    if ( location.pathname === deletedFolders ) {
      setTitle( "Deleted folders" );
    } else if ( location.pathname.includes( "password-add" ) ) {
      setTitle( "Add password" );
    } else if ( !folderID ) {
      setTitle( "LanPass" );
    } else if ( location.pathname.includes( "history" ) ) {
      setTitle( "Password history" );
    } else {
      let folder = folders.find( folder => folder._id === folderID );
      if ( folder ) {
        setTitle( folder.name );
      } else {
        setTitle( "LanPass" );
      }
    }
  }, [ folderID, location.pathname, folders ] );

  useEffect(() => {
    document.addEventListener( "click", ( evt ) => {
      let targetElement = evt.target; // clicked element
      const itemsInMenu = [
        "sort-menu-button",
        "sort-menu-icon",
        "sort-menu",
        "sort-header-1",
        "sort-header-2",
        "sort-menu-plain-layout",
        "plain-layout",
        "plain-layout-label",
        "sort-menu-columns-layout",
        "columns-layout",
        "columns-layout-label",
      ];
      if (!itemsInMenu.includes(targetElement.id) && !targetElement.id.includes("order") && !targetElement.id.includes("label")){
        setOpenSort(false);
        return;
      }
    } );
  }, []);

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

  const menuBtnComponent = () => {
    if (currentUser){
      return (
        <LinkButton
          font="white"
          onClick={(e) => {
            e.preventDefault();
            setOpenSidebar(!openSidebar);
            setParentOpenSidebar(!openSidebar);
          }}
          >
          <img
          className="header-icon"
            src={MenuIcon}
            alt="Menu icon not found"
            />
        </LinkButton>
      )
    }
    return null;
  }

  const titleComponent = () => {
    return (
      <h1 onClick={(e) => props.history.push(`${listPasswordsInFolderStart}all`)}>{title}</h1>
    )
  }

  const sortAndLayoutBtnComponent = () => {
    if (currentUser){
      return (
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
            id="sort-menu-icon"
            className="header-icon"
            src={MenuIcon2}
            alt="MenuIcon2 icon not found"
            />
        </LinkButton>
      )
    }
    return null;
  }

  return (
    <PageHeader openSidebar={openSidebar} columns={layout === COLUMNS}>

        <section className="header-section-left">
          {
            menuBtnComponent()
          }
        </section>

      {
        window.innerWidth >= 800 &&
        <section className="header-section-center">
          {
            titleComponent()
          }
        </section>
      }

      {
        window.innerWidth < 800 &&
          titleComponent()
      }

      {
        window.innerWidth >= 800 &&
        <section className="header-section-right" style={{justifyContent: "flex-end"}}>
          {
            sortAndLayoutBtnComponent()
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
      }

      {
        window.innerWidth < 800 &&
        <section className="header-section-right" style={{justifyContent: "flex-end"}}>
          {
            sortAndLayoutBtnComponent()
          }
        </section>
      }

        {
          openSidebar &&
          currentUser &&
          <Menu {...props} closeSelf={() => setOpenSidebar(false)}/>
        }

        {
          openSort &&
          <SortAndLayout {...props} setOpenSort={setOpenSort} />
        }

    </PageHeader>
  )

  if ( window.innerWidth >= 800 ) {
    return (
      <WebHeader {...props}/>
    );
  }
  return ( <MobileHeader {...props}/> );
};
