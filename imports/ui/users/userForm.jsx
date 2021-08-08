import React, {
  useState,
  useEffect,
} from 'react';

import Select from 'react-select';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  isEmail,
  uint8ArrayToImg
} from '../../other/helperFunctions.js';

import {
  Form,
  Input,
  ButtonCol,
  FullButton,
} from "../../other/styles/styledComponents";

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
  const [ avatar, setAvatar ] = useState( {name: "", buffer: null, img: null} );
  const [ password1, setPassword1 ] = useState( '' );
  const [ password2, setPassword2 ] = useState( '' );

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
      const img = uint8ArrayToImg(profile.avatar);
      setAvatar( {name: "", buffer: profile.avatar, img} );
    } else {
      setAvatar( {name: "", buffer: null, img: null} );
    }
  }, [ profile ] );

  return (
    <Form>

      <section>
        <h1>User profile</h1>
      </section>

      <section>
        <label htmlFor="name">Name</label>
        <Input
          id="name"
          name="name"
          placeholder="Enter name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="surname">Surname</label>
        <Input
          id="surname"
          name="surname"
          placeholder="Enter surname"
          type="text"
          value={surname}
          onChange={(e) =>  setSurname(e.target.value)}
          />
      </section>

      { !profile &&
        <section>
          <label  htmlFor="email">Email</label>
          <Input
            name="email"
            id="email"
            placeholder="Enter email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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


      { !profile &&
        <section>
          <label htmlFor="password1">Password</label>
          <Input
            type="password"
            placeholder="Password"
            id="password1"
            name="password1"
            type="password"
            value={password1}
            required
            onChange={e => setPassword1(e.target.value)}
            />
        </section>
      }
      { !profile &&
        <section>
          <label htmlFor="password2">Repeat password</label>
          <Input
            type="password"
            placeholder="Repeat password"
            id="password2"
            name="password2"
            type="password"
            value={password2}
            required
            onChange={e => setPassword2(e.target.value)}
            />
        </section>
      }

        {
          errorMessage &&
          <p>{errorMessage}</p>
        }
      <ButtonCol>
        {onCancel &&
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); onCancel()}}>Back</FullButton>
        }
        {openLogIn &&
          <FullButton colour="grey" onClick={(e) => {e.preventDefault(); openLogIn()}}>Cancel</FullButton>
        }
        {onRemove &&
          false &&
          <FullButton colour="red" onClick={(e) => {e.preventDefault(); onRemove(userId); onCancel();}}>Delete</FullButton>
        }
        <FullButton
          colour=""
          disabled={name.length + surname.length + email.length === 0 || (!profile && !isEmail(email)) || (!profile && password1 !== password2) || !avatar.buffer || (!profile && password1.length < 7)}
          onClick={(e) => {
            e.preventDefault();
            onSubmit(
              name,
              surname,
              avatar.buffer,
              email,
              password1
            );
          }}
          >
          { isSignIn ? "Sign in" : "Save changes"}
        </FullButton>
      </ButtonCol>

    </Form>
  );
};
