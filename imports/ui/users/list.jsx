import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import { useSelector } from 'react-redux';
import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  Modal,
  ModalBody
} from 'reactstrap';

import { DeleteIcon, PencilIcon } from  "/imports/other/styles/icons";

import AddUser from './addContainer';
import EditUser from './editUserContainer';


import {
  List,
  Input,
  Card,
  LinkButton
} from "/imports/other/styles/styledComponents";

export default function UserList( props ) {

  const users = useSelector((state) => state.users.value);
  const currentUser = useTracker( () => Meteor.user() );

  const [ chosenUser, setChosenUser ] = useState( null );

  const deleteUser = (_id) => {
      if ( window.confirm( "Are you sure you want to remove this user?" ) ) {
        Meteor.users.remove({
          _id
        });
      }
  }

  const userCanManageUsers = currentUser && currentUser.profile.rights && currentUser.profile.rights.sysAdmin;

  if (!userCanManageUsers){
    return <div></div>
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
