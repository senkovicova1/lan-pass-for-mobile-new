import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import moment from 'moment';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import {
  selectStyle
} from '../../other/styles/selectStyles';

import { DeleteIcon, PlusIcon, RestoreIcon, FolderIcon, EyeIcon, CopyIcon } from  "/imports/other/styles/icons";

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  FoldersCollection
} from '/imports/api/foldersCollection';
import {
  PasswordsCollection
} from '/imports/api/passwordsCollection';
import {
  List,
  PasswordContainer,
  FloatingButton,
  FloatingDangerButton,
  ItemContainer,
  LinkButton
} from "/imports/other/styles/styledComponents";
import {
  deletedFolders,
  listAllPasswords,
  addPassword,
  addFolder,
  viewPasswordStart
} from "/imports/other/navigationLinks";

export default function PasswordList( props ) {

    const {
      match,
      history,
      location,
      search,
      active,
      sortBy,
      sortDirection,
    } = props;

    const userId = Meteor.userId();

    const [revealedPasswords, setRevealedPasswords] = useState([]);

    const folderID = match.params.folderID;
    const folders = useSelector((state) => state.folders.value);
    const folder = useMemo(() => {
      if (folders.length > 0){
        return folders.find(folder => folder._id === folderID);
      }
      return {};
    }, [folders, folderID]);

  const allPasswords =  useSelector((state) => state.passwords.value);
  const passwords = allPasswords.filter(password => password.folder === folderID && password.version === 0 && ((active && !password.deletedDate) || (!active && password.deletedDate) ));

  const searchedPasswords = useMemo(() => {
    return passwords.filter(password => password.title.toLowerCase().includes(search.toLowerCase()) || password.username.toLowerCase().includes(search.toLowerCase()));
  }, [passwords, search]);

  const sortedPasswords = useMemo(() => {
    const multiplier = !sortDirection || sortDirection === "asc" ? -1 : 1;
    return searchedPasswords
    .sort((p1, p2) => {
      if (sortBy === "date"){
        return p1.createdDate < p2.createdDate ? 1*multiplier : (-1)*multiplier;
      }
        return p1.title.toLowerCase() < p2.title.toLowerCase() ? 1*multiplier : (-1)*multiplier;
    });
  }, [searchedPasswords, sortBy, sortDirection]);

  const restoreFolder = ( ) => {
    if ( window.confirm( "Are you sure you want to restore this folder?" ) ) {
      let data = {
        deletedDate: null,
      };
      FoldersCollection.update( folderID, {
        $set: {
          ...data
        }
      } );
      history.push(`${listPasswordsInFolderStart}folderID`);
    }
  };

  const permanentlyDeleteFolder = ( ) => {
    if ( window.confirm( "Are you sure you want to permanently remove this folder and all passwords in it?" ) ) {
        FoldersCollection.remove( {
          _id: folderID
        } );
        const passwordsToRemove = passwords.filter(pass => pass.folder === folderID);
        passwordsToRemove.forEach((pass, index) => {
          PasswordsCollection.remove( {
         _id: pass._id
         } );
        });
        history.goBack();
    }
  };

  const leaveFolder = ( ) => {
    if ( folder && window.confirm( "Are you sure you want to remove yourself from this folder?" ) ) {
        let data = {
          users: folder.users.filter(u => u._id !== userId),
        };
        FoldersCollection.update( folderID, {
          $set: {
            ...data
          }
        } );
        history.push(``);
    }
  };

      const folderCanBeDeleted = useMemo(() => {
      return folder?.users?.find((user) => user._id === userId).level === 0;
    }, [folder]);

    const userIsNotAdmin = useMemo(() => {
      return folder?.users?.find((user) => user._id === userId).level !== 0;
    }, [folder]);

    const canAddPasswords = useMemo(() => {
      return folder?.users?.find((user) => user._id === userId).level <= 1;
    }, [folder]);

    if (!folder){
      return (<div></div>)
    }

    const yellowMatch = (string) => {
      if (search.length === 0 || !string.toLowerCase().includes( search.toLowerCase() )){
        return string;
      }
      let startIndex = string.toLowerCase().indexOf( search.toLowerCase() );
      let endIndex = startIndex + search.length;
      return <span> {string.substring( 0, startIndex - 1 )} <span style={{ backgroundColor: "yellow" }}> {string.substring( startIndex, endIndex )} </span> {string.substring(endIndex )} </span>;
    }

    const displayPassword = (id, password) => {
      if (revealedPasswords.includes(id)){
        return password;
      }
      return '••••••••••••••••••••';
    }

  return (
    <List>
      {
        sortedPasswords.length === 0 &&
        <span className="message">You have no {active ? "" : "deleted"} passwords.</span>
      }

      {
        sortedPasswords.map((password) => (
          <PasswordContainer key={password._id}>
            <div onClick={() => history.push(`${viewPasswordStart}${folderID}/${password._id}`)}>
              <label className="title">
                {yellowMatch(password.title)}
              </label>
              <label className="username">
                {password.username ? `Username: ${yellowMatch(password.username)}` : "Username: No username"}
              </label>
              <label className="username">
                {password.password ? `Username: ${displayPassword(password._id, password.password)}` : "Password: No password"}
              </label>
            </div>

              <LinkButton
                className="icon"
                onClick={(e) => {
                  e.preventDefault();
                  if (revealedPasswords.includes(password._id)){
                    setRevealedPasswords(revealedPasswords.filter(pass => pass !== password._id));
                  } else {
                    setRevealedPasswords([...revealedPasswords, password._id]);
                  }
                }}
                >
                <img className="icon" src={EyeIcon} alt="reveal pass" />
              </LinkButton>
              <LinkButton onClick={(e) => {e.preventDefault();  navigator.clipboard.writeText(password.password ? password.password : "No password")}}>
                  <img
                  src={CopyIcon}
                  alt=""
                  className="icon"
                  />
              </LinkButton>
          </PasswordContainer>
            ))
      }

      {
        active &&
        match.params.folderID &&
        !folder.deletedDate &&
        canAddPasswords &&
        <FloatingButton
          onClick={() => history.push(`/folders/${match.params.folderID}/password-add`)}
          >
          <img
            className="icon"
            src={PlusIcon}
            alt="Plus icon not found"
            />

          {!/Mobi|Android/i.test(navigator.userAgent) &&
          <span>
          Password
          </span>
        }
        </FloatingButton>
      }

      {
        active &&
        <ItemContainer key={"del"}>
          <span
            style={{paddingLeft: "0px"}}
            onClick={() => history.push(`${location.pathname}/deleted`)}
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

      {
        active &&
        userIsNotAdmin &&
        <ItemContainer key={"leave"}>
          <span
            style={{paddingLeft: "0px", color: "red"}}
            onClick={() => leaveFolder()}
            >
            LEAVE THIS FOLDER
          </span>
        </ItemContainer>
      }

      {
        folder.deletedDate &&
        folderCanBeDeleted &&
        <FloatingDangerButton
          font="red"
          onClick={(e) => {
            e.preventDefault();
            permanentlyDeleteFolder();
          }}
          >
          <img
            className="icon"
            src={DeleteIcon}
            alt="Delete icon not found"
            />
          DELETE FOLDER FOREVER
        </FloatingDangerButton>
      }

    </List>
  );
};
