import React, {
  useState,
} from 'react';

import {
  Spinner
} from 'reactstrap';

import {
  useSelector
} from 'react-redux';

import { CSVLink } from "react-csv";

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

const { DateTime } = require("luxon");

export default function ImportPasswords( props ) {

  const {
    close,
    match,
    passwords
  } = props;

  const {folderID} = match.params;
  const encryptionData = useSelector( ( state ) => state.encryptionData.value );

  const [ valueSeparator, setValueSeparator ] = useState(`,`);
  const [ enclosingCharacter, setEnclosingCharacter ] = useState(`"`);
  const [ emptyEntry, setEmptyEntry ] = useState("-");
  const [ fileName, setFileName ] = useState(`passwords-lan-pass`);
  const [ importing, setImporting ] = useState(false);
  const [ headers, setHeaders ] = useState([]);
  const [ data, setData ] = useState([]);

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

  async function parsePasswords() {
    const newHeaders = [
      { label: "title", key: "title" },
      { label: "login", key: "username" },
      { label: "password", key: "password" },
      { label: "url", key: "url" },
      { label: "note", key: "note" },
    ];

    let newData = [];
    for (var i = 0; i < passwords.length; i++) {
      const {title, username, password: encryptedPassword, url, note} = passwords[i];
      const decryptedPassword = await decryptPassword(encryptedPassword);

      newData.push({
        title: title ? title : emptyEntry,
        username: username ? username : emptyEntry,
        password: decryptedPassword ? decryptedPassword : emptyEntry,
        url: url ? url : emptyEntry,
        note: note ? note : emptyEntry
      });
    }

    setHeaders(newHeaders);
    setData(newData);

    setImporting(false);
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
