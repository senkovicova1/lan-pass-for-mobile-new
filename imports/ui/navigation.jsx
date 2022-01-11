import React, {
  useEffect,
  useState,
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
  MetaCollection
} from '/imports/api/metaCollection';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  setFolders
} from '/imports/redux/foldersSlice';

import {
  setPasswords
} from '/imports/redux/passwordsSlice';

import {
  setEncryptionData
} from '/imports/redux/encryptionSlice';

import {
  setUsers
} from '/imports/redux/usersSlice';

import Reroute from '/imports/ui/reroute';
import Header from '/imports/ui/header';
import Login from '/imports/ui/login';
import FolderList from '/imports/ui/folders/folderList';
import FolderAdd from '/imports/ui/folders/addFolderContainer';
import FolderEdit from '/imports/ui/folders/editFolderContainer';
import PasswordList from '/imports/ui/passwords/list';
import PasswordContainer from '/imports/ui/passwords/passwordsContainer';
import PasswordView from '/imports/ui/passwords/view';
import PasswordHistoryList from '/imports/ui/passwords/passwordHistoryList';
import EditUserContainer from '/imports/ui/users/editUserContainer';
import UsersList from '/imports/ui/users/list';

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
  usersList,
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

  const [ openSidebar, setOpenSidebar ] = useState( false );

  const currentUser = useTracker( () => Meteor.user() );
  const userId = currentUser ? currentUser._id : null;
  const layout = useSelector( ( state ) => state.metadata.value ).layout;

  const encryptionData = useTracker(() => MetaCollection.find({}).fetch());
  const folders = useTracker( () => FoldersCollection.find( {
    users: {
      $elemMatch: {
        _id: userId
      }
    },
    deletedDate: null
  }, {
    sort: {name: 1}
  } ).fetch() );
  const users = useTracker( () => Meteor.users.find( {} ).fetch() );

  useEffect( () => {
      dispatch( setEncryptionData( encryptionData[0] ) );
  }, [ encryptionData ] );

  useEffect( () => {
    if ( folders.length > 0 ) {
      dispatch( setFolders( folders.map( folder => ( {
        ...folder,
        label: folder.name,
        value: folder._id
      } ) )));
    } else {
      dispatch( setFolders( [] ) );
    }
  }, [ folders ] );

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
            usersList,
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
            usersList,
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
                path={usersList}
                component={UsersList}
                />

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
