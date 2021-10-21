import React from 'react';
import {
  Meteor
} from 'meteor/meteor';
import {
  Spinner
} from 'reactstrap';

import {
  LoadingScreen,
} from "/imports/other/styles/styledComponents";

export default function Search( props ) {
  return (
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
      onChange={(e) => setSearch(e.target.value)}
      />
    <LinkButton
    font="#0078d4"
    searchButton
    onClick={(e) => {
      e.preventDefault();
      setSearch("");
    }}
    >
    <img
      className="search-icon"
      src={CloseIcon}
      alt="Close icon not found"
      />
    </LinkButton>
    </SearchSection>
  );
};
