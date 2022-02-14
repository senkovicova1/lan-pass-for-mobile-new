import React, {
  useState,
} from 'react';

import {
  Spinner
} from 'reactstrap';

import {
  useTracker
} from 'meteor/react-meteor-data';

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
  isEmail
} from '/imports/other/helperFunctions';

const { DateTime } = require("luxon");

export default function SharePassword( props ) {

  const {
    close,
    match,
  } = props;

  const {
    passwordID
  } = match.params;

    const currentUser = useTracker( () => Meteor.user() );

  const [ valueSeparator, setValueSeparator ] = useState(`,`);
  const [ enclosingCharacters, setEnclosingCharacters ] = useState(`"`);
  const [ emptyEntry, setEmptyEntry ] = useState("-");
  const [ importing, setImporting ] = useState(false);
  const [ email, setEmail ] = useState("");

  const createSharing = () => {
    const now = DateTime.now().plus({days: 1});
    Meteor.call(
      'sharing.create',
      passwordID,
      parseInt(now.toSeconds()),
      currentUser._id,
      email,
      (err, response) => {
      if (err) {
        console.log(err);
      } else if (response) {
        sendMail(response, now.toFormat("dd.LL.y HH:mm"));
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
            setImporting(false);
            close();
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
