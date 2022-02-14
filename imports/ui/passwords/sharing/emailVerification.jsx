import React, {
  useState,
} from 'react';

import {
  useTracker
} from 'meteor/react-meteor-data';

import {
  Spinner
} from 'reactstrap';

import SharedPasswordView from './sharedPasswordView';

import {
  SharingCollection
} from '/imports/api/sharingCollection';

import Loader from '/imports/ui/other/loadingScreen';

import {
  Form,
  Card,
  Input,
  BorderedFullButton,
  BorderedLinkButton,
} from "/imports/other/styles/styledComponents";

import {
  EyeIcon,
  CopyIcon
} from "/imports/other/styles/icons";

const { DateTime } = require("luxon");

export default function EmailVerification( props ) {

  const {
    match,
  } = props;

  const { sharingID } = match.params;

  const [ verificationSuccessful, setVerificationSuccessful ] = useState(false);
  const [ code, setCode ] = useState("");
  const [ generatedCode, setGeneratedCode ] = useState("");
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState("");

  const { sharingData } = useTracker(() => {
    const noDataAvailable = { sharingData: null };
    const handler = Meteor.subscribe('sharing');

    if (!handler.ready()) {
      return noDataAvailable;
    }

    const sharingData = SharingCollection.findOne(
       {
         _id: sharingID
       }
     );

    return { sharingData };
  });

  const generateCode = () => {
    let items = [];
    for (var i = 0; i < 10; i++) {
      items.push(i);
    }
    const letters = "qwertyuiopasdfghjklzxcvbnm";
    for (var i = 0; i < letters.length; i++) {
      items.push(letters[i]);
      items.push(letters[i].toUpperCase());
    }

    let code = "";
    for (var i = 0; i < 8; i++) {
      code += items[Math.floor(Math.random()*items.length)];
    }

    return code;
  }

  const generateVerificationCodeAndSendMail = () => {
    const code = generateCode();

    Meteor.call(
      'sharing.update',
      sharingID,
      {
        code
      },
      (err, response) => {
      if (err) {
        console.log(err);
      } else if (response) {
        setGeneratedCode(code);
        sendMail(code);
        setLoading(false);
      }
    }
    );

  }

  const sendMail = (code) => {
    const subject = `Verification code for lanPass password`;
    const object = `Greetings, your verification code is: ${code}`;

      Meteor.call(
      'sendEmail',
      `<${sharingData.email}>`,
      'lan-task@webmon.sk',
      subject,
      object
      );

  }

  if (!sharingData){
    return (
      <Loader />
    )
  }

  if (sharingData.validUntil < parseInt(DateTime.now().toSeconds())){
    return (
      <Form columns={false} style={{maxWidth: "1000px"}}>
        <Card>
          <h2>Access denied</h2>
          <label>Access to this password is not longer possible.</label>
        </Card>
      </Form>
    )
  }

  if (verificationSuccessful){
    return (<SharedPasswordView {...props} passwordId={sharingData.passwordId} />)
  }

  return (
    <Form columns={false} style={{maxWidth: "1000px"}}>
      <Card>
        <section>
          <h2>Email verification</h2>
          <label>Click the button below to send a verification code to your email in order to access the password.</label>
        </section>

        <section>
          <BorderedLinkButton
            disabled={generatedCode.length > 0}
            onClick={(e) => {
              e.preventDefault();
              setLoading(true);
              generateVerificationCodeAndSendMail();
            }}
            >
            {
              loading &&
              <Spinner className="spinner" children="" style={{ height: "1.2em", width: "1.3em",  marginRight: "7px"}}/>
            }
            <span>
              Send verification code
            </span>
          </BorderedLinkButton>
        </section>

        {
          generatedCode &&
        <section>
          <span>Verification code was sent to your email address. It can take up to a minute for the code to arrive in your inbox.</span>
        </section>
      }

        <section>
          <label htmlFor="code">Code {error && <span style={{color: "red"}}>{error}</span> }</label>
          <div>
            <Input
              type="text"
              id="code"
              name="code"
              error={error.length > 0}
              value={code}
              onChange={(e) => {
                setError("");
                setCode(e.target.value);
              }}
              />
          </div>
        </section>


        <section>
          <BorderedFullButton
            onClick={(e) => {
              e.preventDefault();
              if (((sharingData && code === sharingData.code) || code === generatedCode) && code.length > 0){
                setVerificationSuccessful(true);
              } else if (code.length === 0) {
                setError("Code cannot be empty!");
              } else {
                setError("Wrong code! If you have generated more verification codes in a row, please kepp in mind that only the last one is correct.");
              }
            }}
            >
            <span>
              Verify
            </span>
          </BorderedFullButton>
        </section>

      </Card>
    </Form>
  );
};
