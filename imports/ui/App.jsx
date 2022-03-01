import React from 'react';

import "react-datetime/css/react-datetime.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import Navigation from './navigation';

import {
  MainPage
} from '/imports/other/styles/styledComponents';

export const App = () => (
  <MainPage style={{overflowY: "hidden"}}>
    <Navigation />
  </MainPage>
);
