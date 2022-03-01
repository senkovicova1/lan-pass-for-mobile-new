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
  importKeyAndEncrypt,
  importKeyAndDecrypt
} from '/imports/other/helperFunctions';

const {
  DateTime
} = require( "luxon" );

export default function ImportPasswords( props ) {

  const {
    close,
    match,
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
  const [ enclosingCharacters, setEnclosingCharacters ] = useState( `"` );
  const [ emptyEntry, setEmptyEntry ] = useState( "-" );
  const [ importing, setImporting ] = useState( false );
  const [ data, setData ] = useState( "" );

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


  async function encryptPassword( text ) {
    if ( !folder.algorithm || !folder.key[ currentUser._id ] ) {
      return "";
    }

    const privateKey = decryptStringWithXORtoHex( currentUser.profile.privateKey, secretKey );

    const decodedFolderDecryptedKey = await importKeyAndDecrypt( privateKey, "async", folder.key[ currentUser._id ] );

    const encryptedValue = await importKeyAndEncrypt( decodedFolderDecryptedKey, "sync", text, folder.algorithm );

    return encryptedValue;
  }

  async function addNewPassword( title, username, password, url, note ) {

    let actualTitle = title;
    if ( actualTitle === emptyEntry ) {
      actualTitle = "";
    }
    let actualUsername = username;
    if ( actualUsername === emptyEntry ) {
      actualUsername = "";
    }
    let actualPassword = password;
    if ( actualPassword === emptyEntry ) {
      actualPassword = "";
    }
    let actualUrl = url;
    if ( actualUrl === emptyEntry ) {
      actualUrl = "";
    }
    let actualNote = note;
    if ( actualNote === emptyEntry ) {
      actualNote = "";
    }

    const encryptedPassword = await encryptPassword( actualPassword );
    const createdDate = parseInt( DateTime.now().toSeconds() );

    Meteor.call(
      'passwords.create',
      actualTitle,
      folderID,
      actualUsername,
      encryptedPassword,
      actualUrl,
      actualNote,
      false,
      null,
      createdDate,
      createdDate,
      null,
    );

  }

  async function parsePasswords() {
    const lines = data.split( /\r\n|\n\r|\n|\r/ );
    const attributeIndices = {};
    let headers = lines[ 0 ].split( valueSeparator ? valueSeparator : "," );
    headers.forEach( ( item, i ) => {
      const attribute = item.replaceAll( enclosingCharacters ? enclosingCharacters : '"', "" );
      headers[ i ] = attribute;
      attributeIndices[ attribute ] = i;
    } );
    const passwords = lines.slice( 1 );

    for ( var i = 0; i < passwords.length; i++ ) {
      let passwordData = passwords[ i ].split( valueSeparator ? valueSeparator : "," );
      passwordData.forEach( ( item, i ) => {
        passwordData[ i ] = item.replaceAll( enclosingCharacters ? enclosingCharacters : '"', "" );
      } );
      if ( passwordData.length !== headers.length ) {
        continue;
      }
      await addNewPassword(
        passwordData[ attributeIndices[ "title" ] ],
        passwordData[ attributeIndices[ "login" ] ],
        passwordData[ attributeIndices[ "password" ] ],
        passwordData[ attributeIndices[ "url" ] ],
        passwordData[ attributeIndices[ "note" ] ],
      )
    };

    setImporting( false );
    close();
  }

  if ( secretKey.length === 0 ) {
    return (
      <EnterSecretKey columns={true}/>
    )
  }

  return (
    <Form columns={true}>
           <section>
         <h1>Import passwords from csv</h1>
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
           value={enclosingCharacters}
           placeholder='Default is "'
           onChange={(e) =>  {
             if (e.target.value.length <= 1){
               setEnclosingCharacters(e.target.value);
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
           <label>File to import</label>
           <Input
             type="file"
             onChange={(e) =>  {
             e.persist();
             var file = e.target.files[0];
             if (!file) return;
             var reader = new FileReader();
             reader.readAsText(file);
             reader.onload = function(event){
               setData(event.target.result);
             }
           }}
           />
       </section>

       <CommandRow>

         <BorderedLinkButton
           font="red"
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
           disabled={data.length === 0}
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
           <span>
           Import
         </span>
         </BorderedFullButton>

         </CommandRow>
       </Form>
  );
};
