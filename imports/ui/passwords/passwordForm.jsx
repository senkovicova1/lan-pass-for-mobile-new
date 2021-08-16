import React, {
  useState,
  useMemo,
  useEffect,
} from 'react';
import Select from 'react-select';
import moment from 'moment';
import { useSelector } from 'react-redux';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  Form,
  FormTable,
  Input,
  Textarea,
  TitleInput,
  ButtonCol,
  FullButton,
  GroupButton,
  LinkButton
} from "../../other/styles/styledComponents";

export default function PasswordForm( props ) {

  const {
    match,
    history,
    revealPassword,
    onSubmit,
    onCancel,
  } = props;

  const userId = Meteor.userId();
  const folderID = match.params.folderID;
  const folder = useSelector((state) => state.folders.value).find(f => f._id === folderID);

  const passwordID = match.params.passwordID;
  const password = useSelector((state) => state.passwords.value).find(p => p._id === passwordID);

  const [ title, setTitle ] = useState( "" );
  const [ username, setUsername ] = useState( "" );
  const [ password1, setPassword1 ] = useState( "" );
  const [ password2, setPassword2 ] = useState( "" );
  const [ quality, setQuality ] = useState( 29 );
  const [ note, setNote ] = useState( "" );
  const [ expires, setExpires ] = useState( false );
  const [ expireDate, setExpireDate ] = useState( "" );

  useEffect( () => {
    if ( !(folder?.users.find(user => user._id === userId)?.level <= 1) ){
      history.goBack();
    }
  }, [ userId, folder ] );


  useEffect( () => {
    if ( password ) {
      setTitle( password.title );
      setUsername( password.username );
      setPassword1( password.password );
      setPassword2( password.password );
      setQuality( password.quality );
      setNote( password.note );
      setExpires( password.expires );
      setExpireDate( password.expireDate );
    } else {
      setTitle( "" );
      setUsername( "" );
      setPassword1( "" );
      setPassword2( "" );
      setQuality( 29 );
      setNote( "" );
      setExpires( false );
      setExpireDate( "" );
    }
  }, [ password ] );

  return (
    <Form>

      <section>
        <label htmlFor="title">Title</label>
        <Input
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="username">Username</label>
         <Input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="password">Password</label>
         <Input
           type={revealPassword ? "text" : "password"}
           id="password"
           name="password"
           value={password1}
           onChange={(e) => setPassword1(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="repeat-password">Repeat password</label>
          <Input
            type={revealPassword ? "text" : "password"}
            id="repeat-password"
            name="repeat-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
           />
      </section>

      <section>
        <label htmlFor="password-quality">Password quality</label>
          <Input
            type="number"
            id="password-quality"
            name="password-quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
           />
      </section>

      <section>
        <label htmlFor="note">Note</label>
          <Textarea
            id="note"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
           />
      </section>

      <section>
        <label htmlFor="expires">Expires</label>
        <div style={{alignItems: "center"}}>
          <Input
            type="checkbox"
            id="expires"
            name="expires"
            checked={expires}
            onChange={() => setExpires(!expires)}
           />
         <Input
           disabled={!expires}
           type="datetime-local"
           placeholder="Deadline"
           value={expireDate ? moment.unix(expireDate).add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T") : ""}
           min={moment.unix().add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T")}
           onChange={(e) => setExpireDate(e.target.valueAsNumber/1000)}
           />
       </div>
      </section>

      <ButtonCol>
        <FullButton
          colour=""
          disabled={title.length === 0 || password1 !== password2}
          onClick={(e) => {e.preventDefault(); onSubmit(
            title,
            username,
            password1,
            quality,
            note,
            expires,
            expireDate,
            password ? password.createdDate : moment().unix(),
            moment().unix(),
            password ? (password.passwordId ? password.passwordId : password._id) : null
          );}}
          >
          Save
        </FullButton>
      </ButtonCol>

    </Form>
  );
};
