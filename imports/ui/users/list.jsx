import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import {
  useSelector
} from 'react-redux';
import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  DeleteIcon,
  PencilIcon,
  UserIcon
} from "/imports/other/styles/icons";

import AddUser from './addContainer';
import EditUser from './editUserContainer';
import Loader from '/imports/ui/other/loadingScreen';

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

import {
  List,
  Input,
  Card,
  LinkButton
} from "/imports/other/styles/styledComponents";

export default function UserList( props ) {

  const currentUser = useTracker( () => Meteor.user() );

  const [ chosenUser, setChosenUser ] = useState( null );

  const {
    users,
    usersLoading
  } = useTracker( () => {
    const noDataAvailable = {
      users: [],
      usersLoading: true
    };
    if ( !Meteor.user() ) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe( 'users' );

    if ( !handler.ready() ) {
      return noDataAvailable;
    }

    let users = Meteor.users.find( {}, {
      sort: {
        name: 1
      }
    } ).fetch();

    users = users.map( user => ( {
      _id: user._id,
      ...user.profile,
      email: user.emails[ 0 ].address,
      label: `${user.profile.name} ${user.profile.surname}`,
      value: user._id,
      img: user.profile.avatar ? uint8ArrayToImg( user.profile.avatar ) : UserIcon
    } ) )

    return {
      users,
      usersLoading: false
    };
  } );

  const deleteUser = ( _id ) => {
    if ( window.confirm( "Are you sure you want to remove this user?" ) ) {
      Meteor.users.remove( {
        _id
      } );
    }
  }

  const userCanManageUsers = currentUser && currentUser.profile.rights && currentUser.profile.rights.sysAdmin;

  if ( !userCanManageUsers ) {
    return <div></div>
  }

  if ( usersLoading ) {
    return ( <Loader /> )
  }

  return (
    <List>
      <h2>Users</h2>
      <span className="command-bar">
        {
          userCanManageUsers &&
          <AddUser {...props} />
        }
      </span>
      <Card>
        <table width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th width="50%">System admin</th>
              {userCanManageUsers && <th>Actions</th> }
            </tr>
          </thead>
          <tbody>
            {users.map(user =>
              <tr
                key={user._id}
                >
                <td>{user.name + " " + user.surname}</td>
                <td>{user.rights?.sysAdmin ? "Yes" : "No"}</td>
                {userCanManageUsers &&
                  <td style={{display: "flex"}}>
                    <LinkButton
                      onClick={(e) => {
                        e.preventDefault();
                        setChosenUser(user);
                      }}
                      >
                      <img
                        className="icon"
                        src={PencilIcon}
                        alt=""
                        />
                    </LinkButton>
                    {
                      user._id !== currentUser._id &&
                      <LinkButton
                        onClick={(e) => {
                          e.preventDefault();
                          deleteUser(user._id);
                        }}
                        >
                        <img
                          className="icon"
                          src={DeleteIcon}
                          alt=""
                          />
                      </LinkButton>
                    }
                  </td>
                }
              </tr>
            )}
          </tbody>
        </table>

        {
          chosenUser &&
          <Modal isOpen={true} toggle={() => setChosenUser(null)}>
            <ModalBody>
              <EditUser
                userID={chosenUser._id}
                closeSelf={() => setChosenUser(null)}
                />
            </ModalBody>
          </Modal>
        }

      </Card>
    </List>
  );
};
