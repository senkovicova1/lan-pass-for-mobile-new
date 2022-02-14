import React, {
  useState,
  useEffect,
} from 'react';

import {
  isEmail,
  uint8ArrayToImg
} from '/imports/other/helperFunctions';

import {
  PencilIcon,
  BackIcon,
  DeleteIcon
} from "/imports/other/styles/icons";

import {
  Form,
  Input,
  ButtonRow,
  BorderedLinkButton,
  BorderedFullButton,
} from "/imports/other/styles/styledComponents";

const allRights = [
  {
    label: "System admin",
    value: "sysAdmin",
  }
]

export default function UserForm( props ) {

  const {
    _id: userId,
    user,
    privateKey,
    onSubmit,
    onRemove,
    onCancel,
    isSignIn,
    openLogIn,
    errorMessage,
  } = props;

  const [ name, setName ] = useState( "" );
  const [ surname, setSurname ] = useState( "" );
  const [ email, setEmail ] = useState( "" );
  const [ avatar, setAvatar ] = useState( {
    name: "",
    buffer: null,
    img: null
  } );
  const [ password1, setPassword1 ] = useState( '' );
  const [ password2, setPassword2 ] = useState( '' );
  const [ rights, setRights ] = useState({});
  const [ key, setKey ] = useState( "" );

  const [ errors, setErrors ] = useState( [] );

  useEffect( () => {
    if ( user?.name ) {
      setName( user.name );
    } else {
      setName( "" );
    }
    if ( user?.surname ) {
      setSurname( user.surname );
    } else {
      setSurname( "" );
    }
    if ( user?.avatar ) {
      const img = uint8ArrayToImg( user.avatar );
      setAvatar( {
        name: "",
        buffer: user.avatar,
        img
      } );
    } else {
      setAvatar( {
        name: "",
        buffer: null,
        img: null
      } );
    }
    if ( user?.rights ) {
      setRights( user.rights );
    } else {
      setRights( {} );
    }
  }, [ user ] );

  return (
    <Form columns={true}>

      <h2>User profile</h2>

      <section>
        <label htmlFor="name">Name<span style={{color: "red"}}>*</span></label>
        <Input
          error={errors.includes("name") && true}
          id="name"
          name="name"
          placeholder="Enter name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.length > 0){
              setErrors(errors.filter(e => e !== "name"));
            }
          }}
          />
      </section>

      <section>
        <label htmlFor="surname">Surname<span style={{color: "red"}}>*</span></label>
        <Input
          error={errors.includes("surname") && true}
          id="surname"
          name="surname"
          placeholder="Enter surname"
          type="text"
          value={surname}
          onChange={(e) =>  {
            setSurname(e.target.value);
            if (e.target.value.length > 0){
              setErrors(errors.filter(e => e !== "surname"));
            }
          }}
          />
      </section>

      {
        !user &&
        <section>
          <label  htmlFor="email">Email<span style={{color: "red"}}>*</span></label>
          <Input
            error={errors.includes("email") && true}
            name="email"
            id="email"
            placeholder="Enter email"
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (isEmail(e.target.value)){
                setErrors(errors.filter(e => e !== "email"));
              }
            }}
            />
        </section>
      }

      <section>
        <label htmlFor="avatar">Avatar</label>
        <div>
          {
            avatar.img &&
            <img src={avatar.img} alt="avatar" width="50" height="50"/>
          }
          <Input
            id="avatar"
            name="avatar"
            type="file"
            value={avatar.name}
            onChange={(e) =>  {
              e.persist();
              var file = e.target.files[0];
              if (!file) return;
              var reader = new FileReader();
              reader.onload = function(event){
                var buffer = new Uint8Array(reader.result);
                const img = uint8ArrayToImg(buffer);
                setAvatar({name: e.target.value, buffer, img});
              }
              reader.readAsArrayBuffer(file);
            }}
            />
        </div>
      </section>

      {
        !user &&
        <section>
          <label htmlFor="key">Key (10-20 characters, A-Z, a-z, 0-9)</label>
          <Input
            error={errors.includes("key") && true}
            id="key"
            name="key"
            placeholder="Enter key"
            type="text"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              if (e.target.value.length >= 10 || e.target.value.length <= 20){
                setErrors(errors.filter(e => e !== "key"));
              }
            }}
            />
        </section>
      }


      {
        !user &&
        <section>
          <label htmlFor="password1">Password<span style={{color: "red"}}>*</span></label>
          <Input
            error={errors.includes("password") && true}
            type="password"
            placeholder="Password"
            id="password1"
            name="password1"
            type="password"
            value={password1}
            required
            onChange={e => {
              setPassword1(e.target.value);
              if (e.target.value === password2 && password2.length >= 7){
                setErrors(errors.filter(e => e !== "password"));
              }
            }}
            />
        </section>
      }
      {
        !user &&
        <section>
          <label htmlFor="password2">Repeat password<span style={{color: "red"}}>*</span></label>
          <Input
            error={errors.includes("password") && true}
            type="password"
            placeholder="Repeat password"
            id="password2"
            name="password2"
            type="password"
            value={password2}
            required
            onChange={e => {
              setPassword2(e.target.value);
              if (e.target.value === password1 && password1.length >= 7){
                setErrors(errors.filter(e => e !== "password"));
              }
            }}
            />
        </section>
      }

      <table width="100%">
        <thead>
          <tr>
            <th width="50%">Right</th>
            <th width="50%">Granted</th>
          </tr>
        </thead>
        <tbody>
          {allRights.map(right =>
            <tr key={right.value}>
              <td>{right.label}</td>
              <td>
                <Input
                  type="checkbox"
                  checked={rights[right.value]}
                  onClick={() => {
                    let newRights = {...rights};
                    newRights[right.value] = !rights[right.value];
                    setRights(newRights);
                  }}
                  />
              </td>
            </tr>

          )}
        </tbody>
      </table>

      {
        privateKey &&
        <section>
          <label htmlFor="privateKey">Please make sure to remember the key you entered above, it will be used to decrpypt your passwords.</label>
        </section>
      }

      {
        errorMessage &&
        <p>{errorMessage}</p>
      }

      <ButtonRow>
        {
          onCancel &&
          <BorderedLinkButton
            onClick={(e) => {
              e.preventDefault();
              onCancel()
            }}
            >
              <img
                src={BackIcon}
                alt=""
                className="icon"
                />
            Back
          </BorderedLinkButton>
        }
        {
          openLogIn &&
          <BorderedLinkButton
            onClick={(e) => {
              e.preventDefault();
              openLogIn()
            }}
            >
              <img
                src={BackIcon}
                alt=""
                className="icon"
                />
            Cancel
          </BorderedLinkButton>
        }
        {
          onRemove &&
          false &&
          <BorderedLinkButton
            onClick={(e) => {
              e.preventDefault();
              onRemove(userId);
              onCancel();
            }}
            >
              <img
                src={DeleteIcon}
                alt=""
                className="icon start"
                />
            Delete
          </BorderedLinkButton>
        }
        <BorderedFullButton
          onClick={(e) => {
            e.preventDefault();
            let errors = [];
            if (name.length === 0){
              errors.push("name");
            }
            if (surname.length === 0){
              errors.push("surname");
            }
            if (!user && !isEmail(email)){
              errors.push("email");
            }
            if (key.length < 10 || key.length > 20){
              errors.push("key");
            }
            if  ((!user && password1 !== password2) || (!user && password1.length < 7)){
              errors.push("password");
            }
            if (name.length > 0 &&surname.length > 0 && (user || isEmail(email)) && (user || (password1 === password2 && password1.length >= 7))  && (!user && key.length >= 10 && key.length <= 20)) {
              onSubmit(
                name,
                surname,
                avatar.buffer,
                rights,
                email,
                password1,
                key
              );
            }
            setErrors(errors);
          }}
          >
            <img
              src={PencilIcon}
              alt=""
              className="icon start"
              />
          { isSignIn ? "Sign in" : "Save changes"}
        </BorderedFullButton>
      </ButtonRow>

    </Form>
  );
};
