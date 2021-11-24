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
  Card,
  CommandRow,
  BorderedLinkButton,
  BorderedFullButton,
} from "/imports/other/styles/styledComponents";

export default function UserForm( props ) {

  const {
    _id: userId,
    profile,
    onSubmit,
    onRemove,
    onCancel,
    isSignIn,
    openLogIn,
    errorMessage
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

  const [ errors, setErrors ] = useState( [] );

  useEffect( () => {
    if ( profile?.name ) {
      setName( profile.name );
    } else {
      setName( "" );
    }
    if ( profile?.surname ) {
      setSurname( profile.surname );
    } else {
      setSurname( "" );
    }
    if ( profile?.avatar ) {
      const img = uint8ArrayToImg( profile.avatar );
      setAvatar( {
        name: "",
        buffer: profile.avatar,
        img
      } );
    } else {
      setAvatar( {
        name: "",
        buffer: null,
        img: null
      } );
    }
  }, [ profile ] );

  return (
    <Form>

        <h2>User profile</h2>

      <Card>

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
        !profile &&
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
        !profile &&
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
        !profile &&
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

      {
        errorMessage &&
        <p>{errorMessage}</p>
      }

    </Card>

      <CommandRow>
        {
          onCancel &&
          <BorderedLinkButton
            colour="grey"
            onClick={(e) => {
              e.preventDefault();
              onCancel()
            }}
            >
              <img
                src={BackIcon}
                alt=""
                className="icon start"
                />
            Back
          </BorderedLinkButton>
        }
        {
          openLogIn &&
          <BorderedLinkButton
            colour="grey"
            onClick={(e) => {
              e.preventDefault();
              openLogIn()
            }}
            >
              <img
                src={BackIcon}
                alt=""
                className="icon start"
                />
            Cancel
          </BorderedLinkButton>
        }
        {
          onRemove &&
          false &&
          <BorderedLinkButton
            colour="red"
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
          colour=""
          onClick={(e) => {
            e.preventDefault();
            let errors = [];
            if (name.length === 0){
              errors.push("name");
            }
            if (surname.length === 0){
              errors.push("surname");
            }
            if (!profile && !isEmail(email)){
              errors.push("email");
            }
            if  ((!profile && password1 !== password2) || (!profile && password1.length < 7)){
              errors.push("password");
            }
            if (name.length > 0 &&surname.length > 0 && (profile || isEmail(email)) && (profile || (password1 === password2 && password1.length >= 7)) ) {
              onSubmit(
                name,
                surname,
                avatar.buffer,
                email,
                password1
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
      </CommandRow>

    </Form>
  );
};
