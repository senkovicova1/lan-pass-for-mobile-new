import React, {
  useMemo,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';

import {
  setLayout,
  setSortBy,
  setSortDirection
} from '/imports/redux/metadataSlice';

import {
  PLAIN,
  COLUMNS
} from "/imports/other/constants";

import {
  Sort,
} from '/imports/other/styles/styledComponents';

const sortByOptions = [
  {
    label: "Name",
    value: "name"
  },
  {
    label: "Creation date",
    value: "date"
  },
];

const sortDirectionOptions = [
  {
    label: "Ascending",
    value: "asc"
  },
  {
    label: "Descending",
    value: "desc"
  },
];

export default function SortAndLayout( props ) {

  const dispatch = useDispatch();

  const {
    setOpenSort,
  } = props;

  const {
    layout,
    sortBy,
    sortDirection,
  } = useSelector( ( state ) => state.metadata.value );

  return (
    <Sort id="sort-menu" name="sort-menu">
      {
        window.innerWidth > 820 &&
        <h3 id="sort-header-1" >Layout</h3>
      }
        {
          window.innerWidth > 820 &&
        <span id="sort-menu-plain-layout">
          <input
            id="plain-layout"
            name="layout"
            type="radio"
            checked={layout === PLAIN}
            onChange={() => {
              dispatch(setLayout(PLAIN));
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                setOpenSort(false);
              }
            }}
            />
          <label id="plain-layout-label" htmlFor="plain-layout">
            Basic
          </label>
        </span>
      }
        {
          window.innerWidth > 820 &&
        <span id="sort-menu-columns-layout">
          <input
            id="columns-layout"
            name="layout"
            type="radio"
            checked={layout === COLUMNS}
            onChange={() => {
              dispatch(setLayout(COLUMNS));
              if (/Mobi|Android/i.test(navigator.userAgent)) {
                setOpenSort(false);
              }
            }}
            />
          <label id="columns-layout-label" htmlFor="columns-layout">
            Columns
          </label>
        </span>
      }

      <h3 id="sort-menu-header-2">Sort by</h3>
      {
        sortByOptions
        .flatMap(x => sortDirectionOptions.map(y => ({
          label: `${x.label}  (${y.label})`,
          value: `${x.value}-${y.value}`,
          sortByValue: x.value,
          sortDirectionValue: y.value
        })))
        .map(item => (
          <span id={`sort-menu-${item.value}`} key={item.value}>
            <input
              id={`${item.value}-order`}
              name="sort"
              type="radio"
              checked={sortBy === item.sortByValue && sortDirection === item.sortDirectionValue}
              onChange={() => {
                dispatch(setSortBy(item.sortByValue));
                dispatch(setSortDirection(item.sortDirectionValue));
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                  setOpenSort(false);
                }
              }}
              />
            <label id={`sort-menu-${item.value}-label`} htmlFor={`${item.value}-order`}>{item.label}</label>
          </span>
        ))
      }
    </Sort>
  );
};
