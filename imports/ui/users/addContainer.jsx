import React, {
  useState
} from 'react';
import {
  Modal,
  ModalBody
} from 'reactstrap';

import UserForm from './form';

import {
  useDispatch,
} from 'react-redux';

import {
  setFolders
} from '../../redux/foldersSlice';

import {
  setPasswords
} from '../../redux/passwordsSlice';

import { PlusIcon } from  "/imports/other/styles/icons";

import {
  Accounts
} from 'meteor/accounts-base';

import {
  BorderedLinkButton
} from '/imports/other/styles/styledComponents';

export default function AddContainer( props ) {

  const dispatch = useDispatch();

    const [ addUserModalOpen, showAddUserModal ] = useState( false );

    const toggleAddUserModal = () => showAddUserModal( !addUserModalOpen );

    const addNewUser = ( name, surname, avatar, rights, email, password ) => {
      Accounts.createUser( {
        password,
        email,
        profile: {
          name,
          surname,
          avatar,
          rights,
        }
      }, (error) => {
        if (error){
          console.log(error);
        } else {
          dispatch(setFolders([]));
          dispatch(setPasswords([]));
          //props.history.push("/folders/add");
          showAddUserModal( false );
        }
      } );
    };

    const closeModal = () => {
      showAddUserModal( false );
    }

  return (
      <div style={{borderBottom: "0px"}}>
        <BorderedLinkButton onClick={toggleAddUserModal} fit={true}>
        <img
          className="icon"
          style={{marginRight: "0.6em"}}
          src={PlusIcon}
          alt=""
          />
         User
       </BorderedLinkButton>
        <Modal isOpen={addUserModalOpen} toggle={toggleAddUserModal}>
          <ModalBody>
            <UserForm
              title={"Add user"}
              onSubmit={addNewUser}
              onCancel={closeModal}
              />
          </ModalBody>
        </Modal>
      </div>
  );
};
