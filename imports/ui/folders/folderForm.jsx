import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';

import Select from 'react-select';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import { DeleteIcon } from  "/imports/other/styles/icons";

import {
  uint8ArrayToImg
} from '../../other/helperFunctions';

import { useSelector } from 'react-redux';
import {
  translations
} from '../../other/translations.jsx';

import {
  Form,
  Input,
  ButtonCol,
  LinkButton,
  FullButton,
  UserEntry
} from "../../other/styles/styledComponents";

export default function FolderForm( props ) {

  const {
    _id: folderId,
    name: folderName,
    users: folderUsers,
    onSubmit,
    onRemove,
    onCancel,
    match,
    location
  } = props;

const dbUsers = useSelector((state) => state.users.value);

const userId = Meteor.userId();

  const [ name, setName ] = useState( "" );
  const [ users, setUsers ] = useState( [] );

  useEffect( () => {
    if ( folderName ) {
      setName( folderName );
    } else {
      setName( "" );
    }
    if ( folderUsers ) {
      setUsers( folderUsers );
    } else {
      setUsers( [{_id: userId, level: 0}] );
    }
  }, [ folderName, folderUsers ] );

  const usersWithRights = useMemo(() => {
   return users.map(user =>
        {
        let newUser = {...dbUsers.find(u => u._id === user._id), level: user.level};
        return newUser;
      }). sort((u1, u2) => (u1.level > u2.level ? 1 : -1));
  }, [users, dbUsers]);

  const usersToSelect = useMemo(() => {
    return dbUsers.filter(user => !users.find(u => u._id === user._id));
  }, [dbUsers, users]);

  return (
    <Form>

      <section>
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </section>

      <section>
        <Select
          styles={selectStyle}
          value={{label: "Choose another user", value: 0}}
          onChange={(e) => {
            setUsers([...users, {_id: e._id, level: 2}]);
          }}
          options={usersToSelect}
          />
      </section>

      <section>
        <table width="100%">
          <thead>
            <tr>
              <th width="33%"> Name </th>
              <th width="33%">Edit passwords</th>
              <th width="33%">View passwords</th>
            </tr>
          </thead>
          <tbody>
            {usersWithRights.map((user) => (
              <tr>
                <td>{user.label}</td>
                <td>
                  <Input
                    id="write"
                    name="write"
                    type="checkbox"
                    disabled={user.level === 0}
                    checked={user.level <= 1}
                    onChange={(e) =>  {
                      let newUsers = [];
                      if (user.level === 1) {
                        newUsers = users.map((u) => {
                          if (user._id !== u._id){
                            return u;
                          }
                          return ({_id: user._id, level: 2});
                        })
                      } else {
                        newUsers = users.map((u) => {
                          if (user._id !== u._id){
                            return u;
                          }
                          return ({_id: user._id, level: 1});
                        })
                      }
                      setUsers(newUsers);
                    }}
                    />
              </td>
                  <td>
                    <Input
                      id="read"
                      name="read"
                      type="checkbox"
                      disabled={user.level === 0}
                      checked
                      onChange={(e) =>  {
                        let newUsers = users.filter((u) => (user._id !== u._id));
                        setUsers(newUsers);
                      }}
                      />
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>



      <ButtonCol>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel();}}>Cancel</FullButton>
        {onRemove &&
          <FullButton colour="red" onClick={(e) => {e.preventDefault(); onRemove(folderId);}}>Delete</FullButton>
        }
        <FullButton
          colour=""
          disabled={name.length === 0}
          onClick={(e) => {
            e.preventDefault();
            onSubmit(
               name,
               users
            );
          }}
          >
          Save
        </FullButton>
      </ButtonCol>

    </Form>
  );
};
