import React from 'react';

import WebHeader from '/imports/ui/webHeader';
import MobileHeader from '/imports/ui/mobileHeader';

export default function Header( props ) {

  console.log("hi");

  if (window.innerWidth >= 800) {
  return (
    <WebHeader {...props}/>
  );
  }
  return (<MobileHeader {...props}/>);
};
