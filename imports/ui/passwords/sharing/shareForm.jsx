import React, {
  useState,
} from 'react';

import {
  Spinner
} from 'reactstrap';

import { useDispatch, useSelector } from 'react-redux';

import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';

import {
  FoldersCollection
} from '/imports/api/foldersCollection';

import {
  useTracker
} from 'meteor/react-meteor-data';

import EnterSecretKey from '/imports/ui/other/enterSecretKey';

import {
  Form,
  Input,
  BorderedFullButton,
  BorderedLinkButton,
  CommandRow,
  CircledButton
} from "/imports/other/styles/styledComponents";

import {
  CloseIcon,
} from "/imports/other/styles/icons";

import {
  isEmail,
  importKeyAndDecrypt,
} from '/imports/other/helperFunctions';

const { DateTime } = require("luxon");

export default function SharePassword( props ) {

  const {
    close,
    match,
  } = props;

  const {
    passwordID,
    folderID
  } = match.params;

  const currentUser = useTracker( () => Meteor.user() );
  const { secretKey } = useSelector( ( state ) => state.currentUserData.value );

  const [ valueSeparator, setValueSeparator ] = useState(`,`);
  const [ enclosingCharacters, setEnclosingCharacters ] = useState(`"`);
  const [ emptyEntry, setEmptyEntry ] = useState("-");
  const [ importing, setImporting ] = useState(false);
  const [ email, setEmail ] = useState("");

  const { password, passwordLoading } = useTracker(() => {
    const noDataAvailable = { password: {}, passwordLoading: true };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    let handler = Meteor.subscribe('passwords');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    const password = PasswordsCollection.findOne( {_id: passwordID} )

    return { password, passwordLoading: false };
  });

  const { folder, folderLoading } = useTracker(() => {
    const noDataAvailable = { folder: {}, folderLoading: true };

    if (!Meteor.user()) {
      return noDataAvailable;
    }

    let handler = Meteor.subscribe('folders');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    const folder = FoldersCollection.findOne( {_id: folderID} )

    return { folder, folderLoading: false };
  });

    const encryptStringWithXORtoHex = (text, key) => {
      let c = "";
      let usedKey = key;

      while (usedKey.length < text.length) {
           usedKey += usedKey;
      }

      for (var i = 0; i < text.length; i++) {
        let value1 = text[i].charCodeAt(0);
        let value2 = usedKey[i].charCodeAt(0);

        let xorValue = value1 ^ value2;

        let xorValueAsHexString = xorValue.toString("16");

        if (xorValueAsHexString.length < 2) {
            xorValueAsHexString = "0" + xorValueAsHexString;
        }

        c += xorValueAsHexString;
      }

      return c;
    }

  const decryptStringWithXORtoHex = (text, key) => {
    let c = "";
    let usedKey = key;

    while (usedKey.length < (text.length/2)) {
         usedKey += usedKey;
    }

    for (var j = 0; j < text.length; j = j+2) {
      let hexValueString = text.substring(j, j+2);

      let value1 = parseInt(hexValueString, 16);
      let value2 = usedKey.charCodeAt(j/2);

      let xorValue = value1 ^ value2;
      c += String.fromCharCode(xorValue) + "";
    }

    return c;
  }

  async function createSharing(){
    const privateKey = decryptStringWithXORtoHex(currentUser.profile.privateKey, secretKey);

    const decodedFolderDecryptedKey = await importKeyAndDecrypt(privateKey, "async", folder.key[currentUser._id]);

    const decryptedValue = await importKeyAndDecrypt(decodedFolderDecryptedKey, "sync", password.password, folder.algorithm);

    const now = DateTime.now().plus({days: 1});
    Meteor.call(
      'sharing.create',
      passwordID,
      parseInt(now.toSeconds()),
      currentUser._id,
      email,
      (err, sharingID) => {
      if (err) {
        console.log(err);
      } else if (sharingID) {
        const encryptedPassword = encryptStringWithXORtoHex(decryptedValue, sharingID);

        Meteor.call(
          'sharing.update',
          sharingID,
          {
            password: encryptedPassword
          },
          (err, response) => {
          if (err) {
            console.log(err);
          } else if (response) {
            sendMail(sharingID, now.toFormat("dd.LL.y HH:mm"));
            setImporting(false);
            close();
          }
        }
        );

      }
    }
    );
  }

  const sendMail = (id, validUntil) => {
    const subject = `${currentUser.profile.name} ${currentUser.profile.surname} shared a password`;
    const object = `${currentUser.profile.name} ${currentUser.profile.surname} is sharing a password with you.
You can access it here until ${validUntil}:
https://lan-pass.meteorapp.com/sharing/${id}
    `;

      Meteor.call(
      'sendEmail',
      `<${email}>`,
      'lan-task@webmon.sk',
      subject,
      object
      );
  }

    if (secretKey.length === 0){
      return (
        <EnterSecretKey columns={true}/>
      )
    }

  return (
    <Form columns={true}>
      <section>
        <h1>Share password</h1>
        <CircledButton
          font={"red"}
          onClick={(e) => {
            e.preventDefault();
            close();
          }}
          >
          <img
            className="icon red"
            src={CloseIcon}
            alt="CloseIcon icon not found"
            />
        </CircledButton>
      </section>
      <section>
        <label htmlFor="email">Email</label>
        <Input
          type="email"
          id="email"
          value={email}
          onChange={(e) =>  {
            setEmail(e.target.value);
          }}
          />
      </section>
      <CommandRow>

        <BorderedLinkButton
          font={"red"}
          onClick={(e) => {
            e.preventDefault();
            close();
          }}
          >
          <img
            className="icon red"
            src={CloseIcon}
            alt="CloseIcon icon not found"
            />
          Cancel
        </BorderedLinkButton>

        <BorderedFullButton
          disabled={email.length === 0 || !isEmail(email)}
          onClick={(e) => {
            e.preventDefault();
            setImporting(true);
            createSharing();
            //setImporting(false);
            //close();
          }}
          >
          {
            importing &&
            <Spinner className="spinner" children="" style={{ height: "1.3em", width: "1.3em",  marginRight: "7px"}}/>
          }
          <span>
            Send mail with password
          </span>
        </BorderedFullButton>

      </CommandRow>
    </Form>
  );
};
