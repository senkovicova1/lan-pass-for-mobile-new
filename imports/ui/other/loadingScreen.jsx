import React from 'react';

import {
  Spinner
} from 'reactstrap';

import {
  LoadingScreen,
} from "/imports/other/styles/styledComponents";

export default function Loader( props ) {
  return (
    <LoadingScreen>
      <Spinner color="primary" />
    </LoadingScreen>
  );
};
