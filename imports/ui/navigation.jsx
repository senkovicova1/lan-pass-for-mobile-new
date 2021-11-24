import React, {
  useEffect,
  useState,
  useMemo,
} from 'react';

import {
  Route,
  BrowserRouter
} from 'react-router-dom';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  setFolders
} from '../redux/foldersSlice';

import {
  setPasswords
} from '../redux/passwordsSlice';

import {
  setUsers
} from '../redux/usersSlice';

import Reroute from './reroute';
import Header from './header';
import Login from './login';
import FolderList from './folders/folderList';
import FolderAdd from './folders/addFolderContainer';
import FolderEdit from './folders/editFolderContainer';
import PasswordList from './passwords/list';
import PasswordContainer from './passwords/passwordsContainer';
import PasswordView from './passwords/view';
import PasswordHistoryList from './passwords/passwordHistoryList';
import EditUserContainer from './users/editUserContainer';

import {
  Content
} from '/imports/other/styles/styledComponents';

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

import {
  login,
  addFolder,
  editFolder,
  listPasswordsInFolder,
  deletedFolders,
  editCurrentUser,
  addPassword,
  editPassword,
  viewPassword,
  passwordHistory,
  viewPreviousPassword,
  listDeletedPasswordsInFolder
} from "/imports/other/navigationLinks";

export default function MainPage( props ) {

  const dispatch = useDispatch();

  console.log( "All our amazing icons are from FlatIcon (https://www.flaticon.com/). Thank you to all creators whose icons we could use: PixelPerfect (https://www.flaticon.com/authors/pixel-perfect), Dmitri13 (https://www.flaticon.com/authors/dmitri13), Phatplus (https://www.flaticon.com/authors/phatplus), Kiranshastry (https://www.flaticon.com/authors/kiranshastry), Those Icons (https://www.flaticon.com/authors/those-icons), Google (https://www.flaticon.com/authors/google), Dave Gandy (https://www.flaticon.com/authors/dave-gandy), Tomas Knop (https://www.flaticon.com/authors/tomas-knop), Gregor Cresnar (https://www.flaticon.com/authors/gregor-cresnar), Freepik (https://www.flaticon.com/authors/freepik)" );

  const currentUser = useTracker( () => Meteor.user() );
  const layout = useSelector( ( state ) => state.metadata.value ).layout;

  const userId = useMemo( () => {
    if ( currentUser ) {
      return currentUser._id;
    }
    return null;
  }, [ currentUser ] );

  const folders = useTracker( () => FoldersCollection.find( {
    users: {
      $elemMatch: {
        _id: userId
      }
    }
  } ).fetch() );

  useEffect( () => {
    if ( folders.length > 0 ) {
      dispatch( setFolders( folders.map( folder => ( {
        ...folder,
        label: folder.name,
        value: folder._id
      } ) ).sort( ( f1, f2 ) => f1.name > f2.name ? 1 : -1 ) ) );
    } else {
      dispatch( setFolders( [] ) );
    }
  }, [ folders ] );

  const savedFolderIds = folders.map( folder => folder._id );
  const passwords = useTracker( () => PasswordsCollection.find( {
    folder: {
      $in: savedFolderIds
    }
  } ).fetch() );
  useEffect( () => {
    if ( passwords.length > 0 ) {
      dispatch( setPasswords( passwords ) );
    }
  }, [ passwords ] );

  const users = useTracker( () => Meteor.users.find( {} ).fetch() );
  useEffect( () => {
    dispatch(
      setUsers(
        users.map( user => ( {
          _id: user._id,
          ...user.profile,
          label: `${user.profile.name} ${user.profile.surname}`,
          value: user._id,
          img: uint8ArrayToImg( user.profile.avatar )
        } ) )
      )
    );
  }, [ users ] );

  const [ search, setSearch ] = useState( "" );
  const [ openSidebar, setOpenSidebar ] = useState( false );
  const [ sortBy, setSortBy ] = useState( "name" );
  const [ sortDirection, setSortDirection ] = useState( "asc" );

  return (
    <div style={{height: "100vh"}}>
      <BrowserRouter>
        <Route
          exact
          path={[
            "/",
            "/folders",
            login,
            addFolder,
            editFolder,
            listPasswordsInFolder,
            deletedFolders,
            viewPreviousPassword,
            editCurrentUser,
            addPassword,
            editPassword,
            viewPassword,
            passwordHistory,
            listDeletedPasswordsInFolder
          ]}
          component={Reroute}
          />

        <Route
          exact
          path={[
            "/",
            login,
            addFolder,
            editFolder,
            listPasswordsInFolder,
            deletedFolders,
            viewPreviousPassword,
            editCurrentUser,
            addPassword,
            editPassword,
            viewPassword,
            passwordHistory,
            listDeletedPasswordsInFolder
          ]}
          render={(props) => (
            <Header
              {...props}
              setParentOpenSidebar={setOpenSidebar}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              />
          )}
          />
        {
          !currentUser &&
          <Content withSidebar={false}>
            <Route path={["/", login]} component={Login} />
          </Content>
        }
        {
          currentUser &&
          <Content withSidebar={openSidebar} columns={layout === COLUMNS}>
            <div style={{height: "100%", position: "relative"}}>

              <Route
                exact
                path={deletedFolders}
                render={(props) => (
                  <FolderList {...props} active={false} search={search} />
                )}
                />

              <Route exact path={addFolder} component={FolderAdd} />

              <Route exact path={editFolder} component={FolderEdit} />

              <Route
                exact
                path={["/", listPasswordsInFolder, listDeletedPasswordsInFolder, passwordHistory, viewPassword, viewPreviousPassword, addPassword, editPassword]}
                render={(props) => (
                  <PasswordContainer
                    {...props}
                    setSearch={setSearch}
                    search={search}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    />
                )}
                />

              <Route
                exact
                path={editCurrentUser}
                render={(props) => (
                  <EditUserContainer {...props} />
                )}
                />

            </div>
          </Content>
        }
      </BrowserRouter>
    </div>
  );
};
