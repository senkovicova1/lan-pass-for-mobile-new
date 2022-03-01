import React, {
  useState,
} from 'react';

import {
  Spinner
} from 'reactstrap';

import {
  useSelector
} from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  CSVLink
} from "react-csv";

import EnterSecretKey from '/imports/ui/other/enterSecretKey';

import {
  Form,
  Input,
  BorderedFullButton,
  BorderedLinkButton,
  CircledButton,
  CommandRow,
} from "/imports/other/styles/styledComponents";

import {
  CloseIcon,
} from "/imports/other/styles/icons";

import {
  importKeyAndDecrypt,
} from '/imports/other/helperFunctions';

const {
  DateTime
} = require( "luxon" );

export default function ImportPasswords( props ) {

  const {
    close,
    match,
    passwords,
    folder
  } = props;

  const {
    folderID
  } = match.params;

  const currentUser = useTracker( () => Meteor.user() );
  const {
    secretKey
  } = useSelector( ( state ) => state.currentUserData.value );

  const [ valueSeparator, setValueSeparator ] = useState( `,` );
  const [ enclosingCharacter, setEnclosingCharacter ] = useState( `"` );
  const [ emptyEntry, setEmptyEntry ] = useState( "-" );
  const [ fileName, setFileName ] = useState( `passwords-lan-pass` );
  const [ importing, setImporting ] = useState( false );
  const [ headers, setHeaders ] = useState( [] );
  const [ data, setData ] = useState( [] );

  async function decryptPassword( text ) {
    if ( !folder.algorithm || !folder.key[ currentUser._id ] ) {
      return "";
    }

    const privateKey = decryptStringWithXORtoHex( currentUser.profile.privateKey, secretKey );

    const decodedFolderDecryptedKey = await importKeyAndDecrypt( privateKey, "async", folder.key[ currentUser._id ] );

    const decryptedValue = await importKeyAndDecrypt( decodedFolderDecryptedKey, "sync", text, folder.algorithm );

    return decryptedValue;
  }

  const decryptStringWithXORtoHex = ( text, key ) => {
    let c = "";
    let usedKey = key;

    while ( usedKey.length < ( text.length / 2 ) ) {
      usedKey += usedKey;
    }

    for ( var j = 0; j < text.length; j = j + 2 ) {
      let hexValueString = text.substring( j, j + 2 );

      let value1 = parseInt( hexValueString, 16 );
      let value2 = usedKey.charCodeAt( j / 2 );

      let xorValue = value1 ^ value2;
      c += String.fromCharCode( xorValue ) + "";
    }

    return c;
  }

  async function parsePasswords() {
    const newHeaders = [
      {
        label: "title",
        key: "title"
      },
      {
        label: "login",
        key: "username"
      },
      {
        label: "password",
        key: "password"
      },
      {
        label: "url",
        key: "url"
      },
      {
        label: "note",
        key: "note"
      },
    ];

    let newData = [];
    for ( var i = 0; i < passwords.length; i++ ) {
      const {
        title,
        username,
        password: encryptedPassword,
        url,
        note
      } = passwords[ i ];

      const decryptedPassword = await decryptPassword( encryptedPassword );

      newData.push( {
        title: title ? title : emptyEntry,
        username: username ? username : emptyEntry,
        password: decryptedPassword ? decryptedPassword : emptyEntry,
        url: url ? url : emptyEntry,
        note: note ? note : emptyEntry
      } );
    }

    setHeaders( newHeaders );
    setData( newData );

    setImporting( false );
  }

  if ( secretKey.length === 0 ) {
    return (
      <EnterSecretKey columns={true}/>
    )
  }

  return (
    <Form columns={true}>
      <section>
        <h1>Export passwords to csv</h1>
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
        <label>Value separator</label>
        <Input
          type="text"
          value={valueSeparator}
          placeholder="Default is ,"
          onChange={(e) =>  {
            if (e.target.value.length <= 1){
              setValueSeparator(e.target.value)
            }
          }}
          />
      </section>
      <section>
        <label>Enclosing characters</label>
        <Input
          type="text"
          value={enclosingCharacter}
          placeholder='Default is "'
          onChange={(e) =>  {
            if (e.target.value.length <= 1){
              setEnclosingCharacter(e.target.value);
            }
          }}
          />
      </section>

      <section>
        <label>Empty entry</label>
        <Input
          type="text"
          value={emptyEntry}
          placeholder="Default is '-'"
          onChange={(e) =>  {
            setEmptyEntry(e.target.value);
          }}
          />
      </section>

      <section>
        <label>File name</label>
        <Input
          type="text"
          value={fileName}
          placeholder="Default is 'passwords-lan-pass.csv'"
          onChange={(e) =>  {
            setFileName(e.target.value)
          }}
          />
      </section>

      <section>
        <BorderedFullButton
          onClick={(e) => {
            e.preventDefault();
            setImporting(true);
            parsePasswords();
          }}
          >
          {
            importing &&
            <Spinner className="spinner" children="" style={{ height: "1.3em", width: "1.3em",  marginRight: "7px"}}/>
          }
          Generate export data
        </BorderedFullButton>
      </section>

      <section>
        <label>CSV file</label>
        {
          data.length > 0 &&
          <CSVLink
            data={data}
            headers={headers}
            separator={valueSeparator}
            enclosingCharacter={enclosingCharacter}
            filename={fileName + ".csv"}
            onClick={() => {
              close()
            }}
            >
            Click here to download
          </CSVLink>
        }
        {
          data.length === 0 &&
          <span style={{display: "block"}}>
            Nothing to download. You need to generate your csv file first.
          </span>
        }
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
          Close
        </BorderedLinkButton>
      </CommandRow>
    </Form>
  );
};
