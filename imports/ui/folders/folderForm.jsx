import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSelector
} from 'react-redux';

import Select from 'react-select';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  DeleteIcon,
  PencilIcon,
  CloseIcon
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  Card,
  CommandRow,
  BorderedLinkButton,
  BorderedFullButton,
  ButtonCol,
  Form,
  FullButton,
  Input,
  LinkButton,
  UserEntry
} from "/imports/other/styles/styledComponents";

import {
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

export default function FolderForm( props ) {

  const {
    match,
    location,
    _id: folderId,
    name: folderName,
    users: folderUsers,
    onSubmit,
    onRemove,
    onCancel,
  } = props;

  const userId = Meteor.userId();

  const [ name, setName ] = useState( "" );
  const [ users, setUsers ] = useState( [] );

  const { dbUsers, usersLoading } = useTracker(() => {
    const noDataAvailable = { dbUsers: [], usersLoading: true };
    if (!Meteor.user()) {
      return noDataAvailable;
    }

    const handler = Meteor.subscribe('users');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    let dbUsers = Meteor.users.find( {}, {
    sort: {name: 1}
  }).fetch();

  dbUsers =  dbUsers.map( user =>  ({
            _id: user._id,
            ...user.profile,
            email: user.emails[0].address,
            label: `${user.profile.name} ${user.profile.surname}`,
            value: user._id,
          })
         )

    return {dbUsers, usersLoading: false};
  });

  useEffect( () => {

    if ( folderName ) {
      setName( folderName );
    } else {
      setName( "" );
    }

      if ( folderUsers ) {
        setUsers( folderUsers );
      } else {
        setUsers( [ {
          _id: userId,
          level: 0
        } ] );
      }

  }, [ folderName, folderUsers ] );

  const usersWithRights = useMemo( () => {
    return users.map( user => {
      let newUser = {
        ...dbUsers.find( u => u._id === user._id ),
        level: user.level
      };
      return newUser;
    } ).sort( ( u1, u2 ) => ( u1.level > u2.level ? 1 : -1 ) );
  }, [ users, dbUsers ] );

  const usersToSelect = useMemo( () => {
    return dbUsers.filter( user => !users.find( u => u._id === user._id ) );
  }, [ dbUsers, users ] );
  document.onkeydown = function( e ) {
    e = e || window.event;
    switch ( e.which || e.keyCode ) {
      case 13:
        break;
    }
  }

  return (
    <Form>

      <Card>

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
            setUsers([...users, { _id: e._id, level: 2}]);
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
              <tr key={user._id}>
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
                          return ({ ...user, level: 2});
                        })
                      } else {
                        newUsers = users.map((u) => {
                          if (user._id !== u._id){
                            return u;
                          }
                          return ({ ...user, level: 1});
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
    </Card>

    <CommandRow>
      <BorderedLinkButton
        font="red"
        fit={true}
        onClick={(e) => {
          e.preventDefault();
          onCancel();
        }}
        >
        <img
          src={CloseIcon}
          alt=""
          className="icon red"
          />
        Cancel
      </BorderedLinkButton>
      {
        onRemove &&
        <BorderedFullButton
          fit={true}
          font="red"
          colour="red"
          onClick={(e) => {
            e.preventDefault();
            onRemove(folderId);
          }}
          >
          <img
            src={DeleteIcon}
            alt=""
            className="icon"
            />
          Delete
        </BorderedFullButton>
      }
      <BorderedFullButton
        fit={true}
        disabled={name.length === 0}
        onClick={(e) => {
          e.preventDefault();
          onSubmit(
            name,
            users,
            dbUsers,
          );
        }}
        >
        <img
          src={PencilIcon}
          alt=""
          className="icon"
          />
        Save
      </BorderedFullButton>
    </CommandRow>

    </Form>
  );
};
