import React, {
  useState,
  useMemo,
  useEffect,
  useCallback
} from 'react';
import Select from 'react-select';
import moment from 'moment';
import { useSelector } from 'react-redux';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  selectStyle
} from '../../other/styles/selectStyles';

import {
  listAllPasswords,
  listPasswordsInFolderStart
} from "/imports/other/navigationLinks";

import {  RestoreIcon, CopyIcon, PencilIcon, BackIcon } from  "/imports/other/styles/icons";

import {
  Form,
  ViewInput,
  ViewTextarea,
  ButtonCol,
  LinkButton,
  GroupButton,
  FloatingButton,
  DifficultyInput
} from "../../other/styles/styledComponents";

export default function PasswordView( props ) {

  const {
    match,
    history,
    location,
    revealPassword
  } = props;

  const userId = Meteor.userId();
  const passwordID = match.params.passwordID;

  const passwords = useSelector((state) => state.passwords.value);
  const password = passwords.find(p => p._id === passwordID);
  const folderID = match.params.folderID;
  const folder = useSelector((state) => state.folders.value).find(f => f._id === folderID);

  const restorePasswordVersion = () => {
    if ( window.confirm( "Are you sure you want to restore this version?" ) ) {
        const passwordId = password.passwordId ? password.passwordId : password._id;

      PasswordsCollection.insert( {
        title: password.title,
        username: password.username,
        password: password.password,
        quality: password.quality,
        note: password.note,
        expires: password.expires,
        expireDate: password.expireDate,
        folder: password.folder,
        createdDate: password.createdDate,
        version: 0,
        updatedDate: moment().unix(),
        passwordId,
      });

      const passwordsToUpdate = passwords.filter(pass => [pass.passwordId, pass._id].includes(passwordId));

      passwordsToUpdate.forEach((pass, index) => {
        if (pass.version >= 20){
          PasswordsCollection.remove( {
         _id: pass._id
         } );
        } else {
          if (pass.version === 0) {
            PasswordsCollection.update( pass._id, { $inc: { version: 1 }, $set: {editedBy: userId} } );
          } else {
            PasswordsCollection.update( pass._id, { $inc: { version: 1 } } );
          }
      }
      });
      history.push(`${listPasswordsInFolderStart}${folderID}`);
    }
  };

  const restoreDeletedPassword = () => {
      if ( window.confirm( "Are you sure you want to restore this deleted password?" ) ) {
          let data = {
            deletedDate: null,
          };
          PasswordsCollection.update( password._id, {
            $set: {
              ...data
            }
          } );
          history.goBack();
      }
  }


  const passwordScore = useMemo(() => {
    let score = 0;
    if (!password || !password.password || password.password.length === 0)
        return score;

    let letters = {};
    for (let i = 0; i < password.password.length; i++) {
        letters[password.password[i]] = (letters[password.password[i]] || 0) + 1;
        score += 5.0 / letters[password.password[i]];
    }

    let variations = {
        digits: /\d/.test(password.password),
        lower: /[a-z]/.test(password.password),
        upper: /[A-Z]/.test(password.password),
        nonWords: /\W/.test(password.password),
    }

    let variationCount = 0;
    for (let check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);
  }, [password]);


  const scoreTranslation = useCallback(() => {
    let result = {mark: "Very weak", colour: "#ff0053"};
    if (passwordScore > 30){
      result.mark = "Weak";
      result.colour = "#ee6e8f";
    }
    if (passwordScore > 60){
      result.mark = "Good";
      result.colour = "#f4e531";
    }
    if (passwordScore > 80){
      result.mark = "Strong";
      result.colour = "#bbe147";
    }
      if (passwordScore > 100){
          result.mark = "Very strong";
          result.colour = "#0bb829";
        }
        return <span style={{color: result.colour}}>{result.mark}</span>
  }, [passwordScore]);

  if (!password){
    return <div></div>;
    }

  const usedPassword = passwords.find(pass =>{
    if (password.passwordId) {
      return [pass.passwordId, pass._id].includes(password.passwordId) && pass.version === 0;
    }
    return pass.passwordId === password._id;
  }
);
  const passwordCanBeEdited = folder.users.find(user => user._id === userId).level <= 1 && password.version === 0;
  const passwordVersionCanBeRestored = folder.users.find(user => user._id === userId).level <= 1 && password.version > 0;

  return (
    <Form>

      <section>
        <label htmlFor="title">Title</label>
        <div>
        <ViewInput
          type="text"
          id="title"
          name="title"
          placeholder="title"
            disabled={true}
          value={password.title ? password.title : "Untitled"}
          />
          <LinkButton onClick={(e) => {e.preventDefault(); navigator.clipboard.writeText(password.title ? password.title : "Untitled")}}>
            <img
            src={CopyIcon}
            alt=""
            className="icon"
            />
        </LinkButton>
      </div>
      </section>

      <section>
        <label htmlFor="username">Username</label>
        <div>
         <ViewInput
            type="text"
            id="username"
            name="username"
              disabled={true}
            value={password.username ? password.username : "No username"}
          />
          <LinkButton onClick={(e) => {e.preventDefault(); navigator.clipboard.writeText(password.username ? password.username : "No username")}}>
            <img
            src={CopyIcon}
            alt=""
            className="icon"
            />
        </LinkButton>
      </div>
      </section>

      <section>
        <label htmlFor="password">Password</label>
        <div>
         <ViewInput
           type={revealPassword ? "text" : "password"}
           id="password"
           name="password"
            disabled={true}
           value={password.password ? password.password : "No password"}
          />
        <LinkButton onClick={(e) => {e.preventDefault();  navigator.clipboard.writeText(password.password ? password.password : "No password")}}>
            <img
            src={CopyIcon}
            alt=""
            className="icon"
            />
        </LinkButton>
      </div>
      </section>

      <section>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <label htmlFor="repeat-password">Password strength </label>
          {scoreTranslation()}
        </div>
        <DifficultyInput
          block
          type="range"
          name="quality"
          id="quality"
          readOnly
          min={0}
          max={110}
          step={1}
          value={passwordScore}
          />
      </section>

      <section>
        <label htmlFor="note">Note</label>
        <div>
          <ViewInput
            id="note"
            name="note"
              disabled={true}
            value={password.note ? password.note : "No note"}
           />
         <LinkButton onClick={(e) => {e.preventDefault();  navigator.clipboard.writeText(password.note ? password.note : "No note")}}>
             <img
             src={CopyIcon}
             alt=""
             className="icon"
             />
         </LinkButton>
         </div>

      </section>

      <section>
        <label htmlFor="expires">Expires</label>
        <div style={{alignItems: "center"}}>
          <ViewInput
              disabled={true}
            type="checkbox"
            id="expires"
            name="expires"
            checked={password.expires}
           />
         {password.expires &&
         <ViewInput
           disabled={true}
           type="datetime-local"
           placeholder="Deadline"
           value={password.expireDate ? moment.unix(password.expireDate).add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T") : ""}
           />
       }
       {!password.expires &&
       <ViewInput
         disabled={true}
         type="text"
         value={"No expiration date"}
         />
     }
   </div>
      </section>

      <section>
        <label htmlFor="expires">Created</label>
         <ViewInput
           disabled={true}
           type="datetime-local"
           placeholder="Deadline"
           value={moment.unix(password.createdDate).add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T")}
           />
      </section>

      <section>
        <label htmlFor="expires">Last updated</label>
         <ViewInput
           disabled={true}
           type="datetime-local"
           placeholder="Deadline"
           value={moment.unix(password.updatedDate).add((new Date).getTimezoneOffset(), 'minutes').format("yyyy-MM-DD hh:mm").replace(" ", "T")}
           />
      </section>

      {
        password.version === 0 &&
      <ButtonCol>
        <LinkButton
          colour=""
          onClick={(e) => history.push(`/folders/${folderID}/${password.passwordId}/history`)}
          >
          Password History
        </LinkButton>
      </ButtonCol>
    }

      {
        passwordCanBeEdited &&
        <FloatingButton
          onClick={() => history.push(`${location.pathname}/edit`)}
          >
            <img
            src={PencilIcon}
            alt=""
            className="icon"
            />
        </FloatingButton>
      }

      {
        password.version > 0 &&
        !usedPassword.deletedDate &&
        passwordVersionCanBeRestored &&
        <FloatingButton
          onClick={(e) => {e.preventDefault(); restorePasswordVersion();}}
          >
            <img
            src={RestoreIcon}
            alt=""
            className="icon"
            />
        </FloatingButton>
      }

        <FloatingButton
          left
          onClick={(e) => {e.preventDefault(); history.push(`/folders/list/${folderID}`);}}
          >
            <img
              style={{marginRight: "2px"}}
            src={BackIcon}
            alt=""
            className="icon"
            />
        </FloatingButton>

      {
        password.deletedDate &&
        passwordCanBeEdited &&
        <FloatingButton
          onClick={(e) => {e.preventDefault(); restoreDeletedPassword();}}
          >
            <img
            src={RestoreIcon}
            alt=""
            className="icon"
            />
        </FloatingButton>
      }

    </Form>
  );
};
