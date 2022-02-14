import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  Modal,
  ModalBody
} from 'reactstrap';

import { CSVLink, CSVDownload } from "react-csv";

import Select from 'react-select';

import ImportPasswords from './import';
import ExportPasswords from './export';

import {
  setSearch
} from '/imports/redux/metadataSlice';

import {
  BackIcon,
  CopyIcon,
  SearchIcon,
  PencilIcon,
  CloseIcon,
  DeleteIcon,
  EyeIcon,
  FolderIcon,
  PlusIcon,
  RestoreIcon,
} from "/imports/other/styles/icons";

import {
  selectStyle
} from '/imports/other/styles/selectStyles';

import {
  Card,
  BorderedLinkButton,
  BorderedFullButton,
  Form,
  SearchSection,
  Input,
  ItemContainer,
  List,
  LinkButton,
  PasswordContainer,
} from "/imports/other/styles/styledComponents";

import {
  addFolder,
  addPassword,
  deletedFolders,
  listAllPasswords,
  viewPasswordStart,
  listPasswordsInFolderStart,
} from "/imports/other/navigationLinks";

const { DateTime } = require("luxon");

export default function PasswordList( props ) {

  const dispatch = useDispatch();

  const {
    match,
    history,
    location,
    active,
    columns,
    passwords
  } = props;

const userId = Meteor.userId();

const {
  folderID,
  passwordID
} = match.params;

  const isGlobalSearch = folderID === "search";

const {
  search,
  sortBy,
  sortDirection
} = useSelector( ( state ) => state.metadata.value );

const [ showImportDialog, setShowImportDialog ] = useState(false);
const [ showExportDialog, setShowExportDialog ] = useState(false);

const folders = useSelector( ( state ) => state.folders.value );
let folder = useSelector( ( state ) => state.metadata.value ).selectedFolder;

if (!folder && folders.length > 0){
  folder = folders.find(f => f._id === folderID);
}

const searchedPasswords = useMemo( () => {
  if (isGlobalSearch){
    return search.length ? passwords.filter( password =>
      password.title?.toLowerCase().includes( search.toLowerCase() ) ||
      password.username?.toLowerCase().includes( search.toLowerCase() ) ||
      password.url?.toLowerCase().includes( search.toLowerCase() )
    ) : [];
  }
  return passwords.filter( password => password.title.toLowerCase().includes( search.toLowerCase() ) || password.username.toLowerCase().includes( search.toLowerCase() ) );
}, [ passwords, search ] );

const passwordsWithFolders = useMemo( () => {
  if (isGlobalSearch){
    return searchedPasswords.map(password => ({
      ...password,
      folder: folders.find(folder => folder._id === password.folder)
    }));
  }
  return searchedPasswords;
}, [ searchedPasswords, folders ] );

const sortedPasswords = useMemo( () => {
  const multiplier = !sortDirection || sortDirection === "asc" ? -1 : 1;
  return passwordsWithFolders
    .sort( ( p1, p2 ) => {
      if ( sortBy === "date" ) {
        return p1.createdDate < p2.createdDate ? 1 * multiplier : ( -1 ) * multiplier;
      }
      return p1.title.toLowerCase() < p2.title.toLowerCase() ? 1 * multiplier : ( -1 ) * multiplier;
    } );
}, [ passwordsWithFolders, sortBy, sortDirection ] );

  const restoreFolder = () => {
    if ( window.confirm( "Are you sure you want to restore this folder?" ) ) {

          Meteor.call(
            'folders.restoreFolder',
            folderID,
            (err, response) => {
            if (err) {
            } else if (response) {
              history.push( `${listPasswordsInFolderStart}${folderID}` );
            }
          }
          );

    }
  };

  const permanentlyDeleteFolder = () => {
    if ( window.confirm( "Are you sure you want to permanently remove this folder and all passwords in it?" ) ) {

        Meteor.call(
          'folders.permanentlyDeleteFolder',
          folderID
        );

      const passwordsToRemove = passwords.filter( pass => pass.folder === folderID );
      passwordsToRemove.forEach( ( pass, index ) => {

        Meteor.call(
          'passwords.remove',
          pass._id
        );

      } );

      history.goBack();
    }
  };

  const leaveFolder = () => {
    if ( folder && window.confirm( "Are you sure you want to remove yourself from this folder?" ) ) {

          Meteor.call(
            'folders.changeUsers',
            folderID,
            folder.users.filter( u => u._id !== userId ),
            (err, response) => {
            if (err) {
            } else if (response) {
              history.push( `` );
            }
          }
          );

    }
  };

  const folderCanBeDeleted = useMemo( () => {
    return folder?.users?.find( ( user ) => user._id === userId ).level === 0;
  }, [ folder ] );

  const folderIsDeleted = useMemo( () => {
    return folder?.deletedDate;
  }, [ folder ] );

  const userIsNotAdmin = useMemo( () => {
    return folder?.users?.find( ( user ) => user._id === userId ).level !== 0;
  }, [ folder ] );

  const canAddPasswords = useMemo( () => {
    return folder?.users?.find( ( user ) => user._id === userId ).level <= 1;
  }, [ folder ] );

  if ( !folder ) {
    return ( <div></div> )
  }

  const yellowMatch = ( string, title, emptyString ) => {
    if (!string || string.length === 0){
      return `${title}: ${emptyString}`;
    }
    if ( search.length === 0 || !string.toLowerCase().includes( search.toLowerCase() ) ) {
      return `${title ? title + ":" : "" } ${string}`;
    }
    let startIndex = string.toLowerCase().indexOf( search.toLowerCase() );
    let endIndex = startIndex + search.length;
    return <span>{title ? `${title}: ` : ""} {string.substring( 0, startIndex  )} <span style={{ backgroundColor: "yellow" }}> {string.substring( startIndex, endIndex )} </span> {string.substring(endIndex )} </span>;
  }

  return (
    <List columns={columns}>

      {
        !active &&
        <div className="card-header">
          <LinkButton onClick={(e) => {
              e.preventDefault();
              history.push(`${listPasswordsInFolderStart}${folder._id}`);
            }}>
            <img
              src={BackIcon}
              alt=""
              className="icon"
              />
          </LinkButton>
          <h2>Deleted passwords</h2>
        </div>
      }

      <span className="command-bar" style={{marginBottom: "1em", marginTop: "1em"}}>
        <div className="command">
            <SearchSection>
              <LinkButton
                font="#0078d4"
                searchButton
                onClick={(e) => {}}
                >
                <img
                  className="search-icon"
                  src={SearchIcon}
                  alt="Search icon not found"
                  />
              </LinkButton>
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
                />
              <LinkButton
                font="#0078d4"
                searchButton
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(setSearch(""));
                }}
                >
                <img
                  className="search-icon"
                  src={CloseIcon}
                  alt="Close icon not found"
                  />
              </LinkButton>
            </SearchSection>
          </div>

              {
                !isGlobalSearch &&
                active &&
                match.params.folderID &&
                !folder.deletedDate &&
                canAddPasswords &&
                <div className="command">
                <BorderedFullButton
                  fit={true}
                  onClick={() => history.push(`/folders/${match.params.folderID}/password-add`)}
                  >
                  <img
                    className="icon"
                    src={PlusIcon}
                    alt="Plus icon not found"
                    />
                    <span>
                      Password
                    </span>
                </BorderedFullButton>
              </div>
              }

              {
                active &&
                !isGlobalSearch &&
                folder.deletedDate &&
                folderCanBeDeleted &&
                <div className="command">
                <BorderedLinkButton
                  fit={true}
                  font="red"
                  onClick={(e) => {
                    e.preventDefault();
                    permanentlyDeleteFolder();
                  }}
                  >
                  <img
                    className="icon red"
                    src={DeleteIcon}
                    alt="Delete icon not found"
                    />
                  DELETE FOREVER
                </BorderedLinkButton>
              </div>
              }

              {
                active &&
                !isGlobalSearch &&
                folder.deletedDate &&
                folderCanBeDeleted &&
                <div className="command">
                <BorderedLinkButton
                  fit={true}
                  onClick={(e) => {
                    e.preventDefault();
                    restoreFolder();
                  }}
                  >
                  <img
                    className="icon"
                    src={RestoreIcon}
                    alt="RestoreIcon icon not found"
                    />
                  Restore folder
                </BorderedLinkButton>
              </div>
              }

              {
                !isGlobalSearch &&
                active &&
                userIsNotAdmin &&
                <div className="command">
                <BorderedLinkButton
                  fit={true}
                  onClick={(e) => {
                    e.preventDefault();
                    leaveFolder();
                  }}
                  >
                  <img
                    className="icon"
                    src={CloseIcon}
                    alt="CloseIcon icon not found"
                    />
                  LEAVE THIS FOLDER
                </BorderedLinkButton>
              </div>
              }

{
  active &&
  !folderIsDeleted &&
  <div className="command">
              <BorderedLinkButton
                fit={true}
                onClick={() => {
                  setShowImportDialog(true);
                }}
                >
                  <span>
                    Import
                  </span>
              </BorderedLinkButton>
            </div>
          }

            <div className="command">
            <BorderedLinkButton
              fit={true}
              onClick={() => {
                setShowExportDialog(true);
              }}
              >
                <span>
                  Export
                </span>
            </BorderedLinkButton>
          </div>
      </span>

      {
        sortedPasswords.length === 0 &&
        <Card style={{marginBottom: "1em"}}>
          {
            isGlobalSearch &&
            <span className="message">No password match your search.</span>
          }
          {
            !isGlobalSearch &&
            <span className="message">You have no {active ? "" : "deleted"} passwords.</span>
          }
      </Card>
      }

      {
        sortedPasswords.map((password) => (
          <PasswordContainer
            key={password._id}
            style={password._id === passwordID ? {backgroundColor: "#deeaf3"} : {}}
            onClick={() => {
              history.push(`${viewPasswordStart}${folderID}/${password._id}`)
            }}
            >
            <div onClick={() => {}}>
              <label className="title">
                {yellowMatch(password.title, "", "Untitled")}
              </label>
              <label className="username">
                  { yellowMatch(password.username, "Login", "No login") }
              </label>
              <label className="username">
                {password.password ? `Password: ••••••••••••••••••••` : "Password: No password"}
              </label>
              <label className="username">
                {yellowMatch(password.url, "URL", "No URL")}
              </label>
              {
                isGlobalSearch &&
              <label className="username">
                { `Folder: ${password.folder.name}`}
              </label>
            }
            </div>

          </PasswordContainer>
        ))
      }

      {
        active &&
        !isGlobalSearch &&
        <ItemContainer key={"del"}>
          <span
            style={{paddingLeft: "0px"}}
            onClick={() => history.push(`/folders/list/${folderID}/deleted`)}
            >
            <img
              className="icon folder"
              src={DeleteIcon}
              alt="Delete icon not found"
              />
            Deleted passwords
          </span>
        </ItemContainer>
      }

         <Modal isOpen={showImportDialog} toggle={() => setShowImportDialog(false)}>
           <ModalBody>
             <ImportPasswords
               {...props}
               close={() => setShowImportDialog(false)}
               />
           </ModalBody>
         </Modal>

                <Modal isOpen={showExportDialog} toggle={() => setShowExportDialog(false)}>
                  <ModalBody>
                    <ExportPasswords
                      {...props}
                      passwords={sortedPasswords}
                      close={() => setShowExportDialog(false)}
                      />
                  </ModalBody>
                </Modal>

    </List>
  );
};
