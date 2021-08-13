import React, {
  useState,
  useMemo,
  useEffect,
  useCallback
} from 'react';
import { useSelector } from 'react-redux';

import {
  useTracker
} from 'meteor/react-meteor-data';
import {
  Modal,
  ModalBody
} from 'reactstrap';

import {
  Form,
  Input,
  ButtonCol,
  FullButton,
  LinkButton
} from "/imports/other/styles/styledComponents";

export default function GeneratorSettings( props ) {

  const {
    match,
    history
  } = props;

  const user = useTracker( () => Meteor.user() );

  const [ settingsOpen, setSettingsOpen ] = useState( false );

  const [ length, setLength ] = useState( 16 );
  const [ upperCase, setUpperCase ] = useState( true );
  const [ lowerCase, setLowerCase ] = useState( true );
  const [ includeNumbers, setIncludeNumbers ] = useState( true );
  const [ includeSymbols, setIncludeSymbols ] = useState( true );

  useEffect( () => {
    if ( user?.profile.passwordSettings ) {
      setLength( user.profile.passwordSettings.length );
      setUpperCase( user.profile.passwordSettings.upperCase );
      setLowerCase( user.profile.passwordSettings.lowerCase );
      setIncludeNumbers( user.profile.passwordSettings.includeNumbers );
      setIncludeSymbols( user.profile.passwordSettings.includeSymbols );
    } else {
      setLength( 16 );
      setUpperCase( true );
      setLowerCase( true );
      setIncludeNumbers( true );
      setIncludeSymbols( true );
    }
  }, [ user._id ] );

const submit = () => {
      let data = {
        ...user.profile,
        passwordSettings: {
          length,
          upperCase,
          lowerCase,
          includeNumbers,
          includeSymbols
        }
      };

      Meteor.users.update(user._id, {
        $set: {
          profile: data
        }
      });
      setSettingsOpen(false);
};

  return (
    <div  style={{width: "150px"}}>

    <LinkButton
      colour=""
      onClick={(e) => {e.preventDefault(); setSettingsOpen(true)}}
      >
      Generator settings
    </LinkButton>

    <Modal isOpen={settingsOpen}>
      <ModalBody>
        <h1 style={{fontSize: "2em"}}>Generator settings</h1>

    <Form>

      <section>
        <label htmlFor="length">Length</label>
        <Input
          type="number"
          id="length"
          name="length"
          value={length}
          min={6}
          onChange={(e) => setLength(e.target.value)}
          />
      </section>

      <section>
        <label htmlFor="lowerCase">Use lower case letters</label>
          <Input
            style={{marginBottom: "0.3em"}}
            type="checkbox"
            id="lowerCase"
            name="lowerCase"
            checked={lowerCase}
            onChange={() => setLowerCase(!lowerCase)}
           />
      </section>

      <section>
        <label htmlFor="upperCase">Use upper case letters</label>
          <Input
            style={{marginBottom: "0.3em"}}
            type="checkbox"
            id="upperCase"
            name="upperCase"
            checked={upperCase}
            onChange={() => {console.log(upperCase);console.log("hi");setUpperCase(!upperCase);}}
           />
      </section>

      <section>
        <label htmlFor="numbers">Use numbers</label>
        <Input
          style={{marginBottom: "0.3em"}}
          type="checkbox"
          id="numbers"
          name="numbers"
          checked={includeNumbers}
          onChange={() => setIncludeNumbers(!includeNumbers)}
          />
      </section>

      <section>
        <label htmlFor="symbols">Use symbols</label>
          <Input
            style={{marginBottom: "0.3em"}}
            type="checkbox"
            id="symbols"
            name="symbols"
            checked={includeSymbols}
            onChange={() => setIncludeSymbols(!includeSymbols)}
           />
      </section>

      <ButtonCol>
        <FullButton colour="grey" onClick={(e) => {e.preventDefault(); setSettingsOpen(false)}}>Cancel</FullButton>
        <FullButton
          colour=""
          disabled={length.length <= 0 || !(upperCase || lowerCase || includeSymbols || includeNumbers)}
          onClick={(e) => {e.preventDefault(); submit();}}
          >
          Save
        </FullButton>
      </ButtonCol>

    </Form>
  </ModalBody>

</Modal>

</div>
  );
};
