import React, {
  useState,
} from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  useSelector
} from 'react-redux';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import Loader from '/imports/ui/other/loadingScreen';

import {
  Form,
  Card,
  ViewInput,
  LinkButton,
} from "/imports/other/styles/styledComponents";

import {
  EyeIcon,
  CopyIcon
} from "/imports/other/styles/icons";

const { DateTime } = require("luxon");

export default function SharedPasswordView( props ) {

  const {
    match,
    passwordId
  } = props;

    const [ revealPassword, setRevealPassword ] = useState( false );
    const [ decryptedPassword, setDecryptedPassword ] = useState( "" );
    const [ showCopyResponse, setShowCopyResponse ] = useState( [false, false] );

    let timeout = null;

  const encryptionData = useSelector( ( state ) => state.encryptionData.value );

  const { password } = useTracker(() => {
    const noDataAvailable = { password: null };
    const handler = Meteor.subscribe('passwords');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    const password = PasswordsCollection.findOne(
       {
         _id: passwordId
       },
       {
      fields: {
        title: 1,
        username: 1,
        password: 1,
      }
    }
     );

    return { password };
  });

    async function toggleRevealPassword(){
      setRevealPassword( !revealPassword );
      if (decryptedPassword.length === 0){
        const decrypted = await decryptPassword(password.password);
        setDecryptedPassword(decrypted);
      }
    }

  async function decryptPassword(text){
    if (!encryptionData){
      return [];
    }
    const symetricKey = await crypto.subtle.importKey(
      "raw",
        encryptionData.symetricKey,
        encryptionData.algorithm,
      true,
      ["encrypt", "decrypt"]
    );

    let decryptedText = null;
    await window.crypto.subtle.decrypt(
      encryptionData.algorithm,
      symetricKey,
      text
    )
    .then(function(decrypted){
      decryptedText = decrypted;
    })
    .catch(function(err){
      console.error(err);
    });
    let dec = new TextDecoder();
    const decryptedValue = dec.decode(decryptedText);
    return decryptedValue;
  }

  if (!password){
    return (
      <Loader />
    )
  }

  return (
    <Form columns={false} style={{maxWidth: "1000px"}}>
      <Card>
        <h2>{password.title ? password.title : "Untitled password"}</h2>
        <section>
          <label htmlFor="username">Login</label>
          <div>
            <ViewInput
              type="text"
              id="username"
              name="username"
              disabled={true}
              value={password.username ? password.username : "No login"}
              />
            {
              !/Mobi|Android/i.test(navigator.userAgent) &&
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  let newCopyResponses = [...showCopyResponse];
                  newCopyResponses[0] = true;
                  setShowCopyResponse(newCopyResponses);
                  timeout = setTimeout(() => {
                    let newCopyResponses = [...showCopyResponse];
                    newCopyResponses[0] = false;
                    setShowCopyResponse(newCopyResponses);
                  }, 2000);

                  if (/Mobi|Android/i.test(navigator.userAgent)){
                    var copyText = document.getElementById("title");
                    copyText.select();
                    document.execCommand("copy");
                  } else {
                    navigator.clipboard.writeText(password.username ? password.username : "No login");
                  }
                }}
                >
                <img
                  src={CopyIcon}
                  alt=""
                  className="icon"
                  />
                {
                  showCopyResponse[0] &&
                  <span>
                    Copied!
                  </span>
                }
              </LinkButton>
            }
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
              value={revealPassword  ? decryptedPassword : "decrypting_password"}
              />
            <LinkButton
              className="icon"
              onClick={(e) => {
                e.preventDefault();
                toggleRevealPassword();
              }}
              >
              <img className="icon" src={EyeIcon} alt="reveal pass" />
            </LinkButton>
            {
              !/Mobi|Android/i.test(navigator.userAgent) &&
              <LinkButton
                onClick={(e) => {
                  e.preventDefault();
                  let newCopyResponses = [...showCopyResponse];
                  newCopyResponses[1] = true;
                  setShowCopyResponse(newCopyResponses);
                  timeout = setTimeout(() => {
                    let newCopyResponses = [...showCopyResponse];
                    newCopyResponses[1] = false;
                    setShowCopyResponse(newCopyResponses);
                  }, 2000);

                  if (/Mobi|Android/i.test(navigator.userAgent)){
                    var copyText = document.getElementById("title");
                    copyText.select();
                    document.execCommand("copy");
                  } else {
                    navigator.clipboard.writeText(password.password ? password.password : "No password");
                  }
                }}
                >
                <img
                  src={CopyIcon}
                  alt=""
                  className="icon"
                  />
                {
                  showCopyResponse[1] &&
                  <span>
                    Copied!
                  </span>
                }
              </LinkButton>
            }
          </div>
        </section>
      </Card>
    </Form>
  );
};
