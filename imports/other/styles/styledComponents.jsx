import styled from 'styled-components'

//colours
const backgroundColour = "#f6f6f6";
const phColour = "#004578";
const basicBlueColour = "#0078d4";
const lightBlueColour = "#deeaf3";

//numeric values
const contentOffset = "calc((100vw - 800px)/2)";
const sidebarWidthWeb = "250px";
const sidebarWidthMobile = "300px";
const inputOffset = "15px";

export const MainPage = styled.div `
  font-size: 1em;
  text-align: left;
  line-height: 1.5em;

  h1, h2, h3, h4 {
    font-weight: lighter;
  }

  h2 {
    font-size: 2em;
  }

  ul {
    list-style-type: none;
  }

  label {
    margin: 0px;
  }

  hr{
    color: #d6d6d6;
    margin: 0px;
    opacity: 1;
  }

  img.icon {
    height: 1.3em;
    filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
  }

  img.avatar {
    width:32px;
    height: 32px;
    border-radius: 50px;
  }
`;

export const MobilePageHeader = styled.header `
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: 50px;
  background-color: ${basicBlueColour};
    padding: 0px ${inputOffset};
    i {
      font-size: 1.5em;
    }
    img.icon {
      filter: invert(1);
      height: 1.5em;
      width: 1.5em;
      margin-right: 0px;
    }
    img.search-icon{
      height: 1.3em;
      width: 1.3em;
    }
    button{
      i{
        margin: 0px !important;
      }
      margin-right: 1em;
    }
    button:last-of-type{
        margin: 0px !important;
    }

    h1 {
      height: 32px;
      padding-left: 0em;
      display: inline;
      font-size: 1.5em;
      color: white;
      margin-bottom: 0em;
    }

    div.search-section{
      width: -webkit-fill-available;
      input{
        width: -webkit-fill-available;
        border: none !important;
        outline: none !important;
      }
      input:focus{
        border: none !important;
      }
    }
`;

export const PageHeader = styled.header `
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: 50px;
  background-color: ${basicBlueColour};
  padding: 0px ${inputOffset};

  section.header-section{
    width: 300px;
    align-items: center;
    display: flex;

     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;

  button{
    margin-right: 1em;
  }
  button:last-of-type{
    margin: 0px !important;
  }

  h1 {
     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;
    height: 32px;
    padding-left: 0em;
    display: inline;
    font-size: 1.5em;
    color: white;
    margin-bottom: 0em;
    margin-left: 1em;
  }

  img.icon {
    filter: invert(1);
    height: 1.5em;
    width: 1.5em;
    margin-right: 0px;
  }
  }

  div.search-section{
    width: -webkit-fill-available;
    input{
      width: -webkit-fill-available;
      border: none !important;
      outline: none !important;
    }
    input:focus{
      border: none !important;
    }
`;

export const SearchSection = styled.section `
  display: flex;
  width: 800px !important;
  input{
    width: -webkit-fill-available;
    border: none !important;
    outline: none !important;
  }
  input:focus{
    border: none !important;
  }

    img.search-icon{
      height: 1.3em;
      width: 1.3em;
    }

  button:last-of-type {
    margin-left: 0em !important;
    margin-right: 1em;
    padding-left: ${inputOffset};
  }

  button:first-of-type {
    margin-right: 0em;
    padding-left: ${inputOffset};
    margin-left: ${inputOffset};
  }
`;

export const Content = styled.main `
  display: block;
  height: calc(100vh - 50px);
  @media all and (max-width: 799px), @media handheld {
    width: 100%;
  }
  @media all and (min-width: 800px) and (max-width: 1299px){
    width: 800px;
    margin-left: auto;
    margin-right: auto;

    ${(props) =>
      props.columns &&
      `
        width: 100%;
        margin-left: ${props.withSidebar ? sidebarWidthWeb : "auto"};
        margin-right: auto;
      `
    }
  }
  @media all and (min-width: 1300px) {
    width: 800px;
    margin-left: auto;
    margin-right: auto;

    ${(props) =>
      props.columns &&
      `
        width: ${props.withSidebar ? `calc(100vw - ${sidebarWidthWeb} - 18px)` : `100%`};
        margin-left: ${props.withSidebar ? sidebarWidthWeb : "auto"};
        margin-right: auto;
      `
    }
  }
`;

export const Sidebar = styled.section `
  background-color: ${backgroundColour};
  position: absolute;
  left: 0;
  @media all and (max-width: 799px), @media handheld  {
    box-shadow: 5px 0px 13px 0px slategrey;
    width: ${sidebarWidthMobile};
  }
  @media all and (min-width: 800px){
    box-shadow: none;
    border-right: 0px solid #d6d6d6;
    width: ${sidebarWidthWeb};
    background-color: white;
  }
  top: 50px;
  height: calc(100vh - 50px);
  z-index: 3;
  padding: 0px;

  a, .imitation-navlink {
    color: ${basicBlueColour} !important;
    display: flex;
    align-items: center;
    padding: 1em;
    text-decoration: none !important;
    i, img.icon{
      margin-right: 10px;
    }
    img.icon{
      filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(80%) contrast(101%);
    }

    .last-icon{
      margin-left: auto;
      margin-right: 0px !important;
    }

    button{
      width: 100%;
      height: fit-content;
    }
  }

  a.active {
    background-color: ${basicBlueColour}22;
  }

  .rights{
    margin-left: auto;
    width: 30%;
    text-align: end;
  }

  .imitation-navlink{
    height:
  }

`;

export const ButtonRow = styled.section `
  display: flex;
  margin-top: 0em !important;
  margin-bottom: 0em;
  button:first-of-type{
    margin-right: 0.5em;
  }
  button:last-of-type{
    margin-left: 0.5em;
  }
  }
`;

export const ButtonCol = styled.section `
  margin-top: 0em !important;
  button {
    margin-bottom: 1em;
  }
  .icon{
    margin: 0px;
  }
`;

export const LinkButton = styled.button `
  color: ${(props) => props.font ? props.font : basicBlueColour};
  padding: 0px;
  height: 2.5em;
  background-color: ${(props) => props.searchButton ? "white" : "transparent" } !important;
  outline: none !important;
  border: none !important;
  line-height: 1em;
  display: flex;
  align-items: center;
  i, img {
    margin-right: ${(props) => props.searchButton ? "0.6em" : "0.3em" }
  }
  img {
    ${(props) => props.searchButton && `
      filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(191deg) brightness(97%) contrast(101%) !important;
      `};
  }

      img.basic-icon {
          height: 1.5em;
          width: 1.5em;
          filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
      }
`;

export const FullButton = styled.button `
  width: 100%;
  color: white;
  padding: 0px;
  background-color: ${(props) => props.colour ? props.colour : "#0078d4" } !important;
  outline: none !important;
  border: none !important;
  line-height: 2em;
  height: 2em;
  align-items: center;
  padding: 0px 0.5em;
  i, img.icon {
    margin-right: 0.3em;
  }
  img.icon{
    filter: invert(1) !important;
  }
`;

export const FloatingButton = styled.button `
  color: white;
  padding: 0px 0.8em;
  height: 2.5em;
  background-color: ${(props) => props.font ? props.font : basicBlueColour};
  outline: none !important;
  border: none !important;
  border-radius: 1.5em;
  align-items: center;
  position: absolute;
  bottom: 40px;
  ${(props) => props.left &&
  `
  left: ${inputOffset};
  `};
  ${(props) => !props.left &&
  `
  right: ${inputOffset};
  `};
  display: flex;

  span{
    vertical-align: text-bottom;
    margin-left: 0.3em;
  }
  img.icon{
    filter: invert(1) !important;
  }
`;

export const FloatingDangerButton = styled.button `
  color: red;
  padding: 0px;
  height: 2.5em;
  background-color: transparent;
  outline: none !important;
  border: none !important;
  border-radius: 1.5em;
  align-items: center;
  position: absolute;
  bottom: 1em;
  left: 0;
  display: flex;

  span{
    vertical-align: text-bottom;
  }
  img.icon{
    margin-right: 0.3em;
    filter: invert(14%) sepia(86%) saturate(7381%) hue-rotate(1deg) brightness(101%) contrast(117%) !important;
  }
`;

export const List = styled.section `
  width: 100%;
  padding: 0em;
  display: inline-block;
  verticalAlign: top;

  &>div{
      display: flex;
  }

  &>section.showClosed{
    display: block;
    height: 3em;
    input{
      width: 1.5em !important;
    }
    label{
      padding: 10px;
    }
  }

    button.item{
      i {
        width: 1.5em;
        margin-right: 10px;
      }
      height: 3em;
    }

  &>section.showClosed, button{
    margin-left: ${inputOffset};
  }

  span.message{
    margin: 0em ${inputOffset};
    line-height: 3em;
  }

  h2{
    color: ${basicBlueColour};
  }
`;

export const ItemContainer = styled.section `
  &:hover{
    cursor: pointer;
  }

  margin: 0em ${inputOffset};
  height: 3em;
  display: flex;
  align-items: center;
  color: ${basicBlueColour};

  input[type=checkbox]{
    width: 1.5em !important;
    height: 1.5em !important;
  }

  &> span {
    margin-right: auto;
    padding: 10px;
    width: calc(100% - 6em);
    overflow-wrap: anywhere;
  }

  img.icon{
    height: 1.3em;
    filter: invert(32%) sepia(81%) saturate(4601%) hue-rotate(210deg) brightness(90%) contrast(101%);
  }

  img.folder{
    margin-right: 0.3em;
  }

  img.avatar {
    margin-right: 0.6em;
  }
`;

export const Form = styled.form `
  padding: 1em ${inputOffset};
  width: -webkit-fill-available;

  section {
    margin: 0em 0em 1.5em 0em;

    i {
      font-size: 1.5em;
    }

    div{
      display: flex;
      img{
        margin: 0px;
      }
    }

    img {
      width:32px;
      height: 32px;
      border-radius: 50px;
      margin-right: 1em;
    }

    label{
      margin: 0px 1em 0em 0em;
      font-weight: 500;
    }

    input[type=text], input[type=color], input[type=password], input[type=datetime-local], input[type=number], teaxtarea, &>div {
      width: -webkit-fill-available;
    }

    input[type=color]{
        border: none;
        background-color: transparent !important;
        padding: 0px;
    }

    input[type=file]{
      width: calc(100% - 5em);
      border: none;
      background-color: transparent !important;
    }

    input[type=checkbox] + label{
        vertical-align: middle;
      }

      input[type=checkbox]{
        margin-right: 5px;
        width: 1.5em !important;
        height: 1.5em !important;
    }

  }

  section:last-of-type {
    margin: 0em !important;
  }


  section.password>div.input-section{
    display: flex;
    input#password{
      border-right: none !important;
    }
    button.icon{
      border: 1px solid #d6d6d6 !important;
      border-left: none !important;
      background-color: white !important;
    }
    input#password:focus + button.icon {
      border: 1px solid ${basicBlueColour} !important;
      border-left: none !important;
    }
  }
`;

export const Input = styled.input `
  background-color: white !important;
  outline: none !important;
  border: ${(props) => props.error ? "1px solid red" : "1px solid #d6d6d6"};
  width: ${(props) => props.width ? props.width : "auto"};
  padding-left: 0.4em;
  height: 2.5em !important;

  &:focus{
    border: 1px solid ${basicBlueColour} !important;
  }

  &[type=checkbox]{
      vertical-align: middle;
  }
`;

export const ViewInput = styled.input `
  background-color: transparent !important;
  outline: none !important;
  border: none;
  width: 100%;
  padding-left: 0.4em;
  height: 2.5em !important;

  &:hover{
    cursor: default;
  }
`;

export const Textarea = styled.textarea `
  background-color: white !important;
  outline: none !important;
  border: 1px solid #d6d6d6;
  width: 100%;
  padding-left: 0.4em;

  &:focus{
    border: 1px solid ${basicBlueColour} !important;
  }
`;

export const ViewTextarea = styled.textarea `

  background-color: transparent !important;
  outline: none !important;
  border: none;
  width: 100%;
  padding-left: 0.4em;

  &:hover{
    cursor: default;
  }
`;

export const Sort = styled.div`
  position: absolute;
  z-index: 999;
  background-color: white;
  box-shadow: 0px 0px 7px 0px slategrey;
  width: 350px;
  top: 50px;
  right: 20px;
  padding: ${inputOffset};
  span{
    display: flex;
    align-items: center;
    line-height: 2em;
  }
  input{
    height: 1.3em;
    width: 1.3em;
    margin-right: 0.6em;
  }
`;

export const GroupButton = styled.button `
  width: -webkit-fill-available;

  background-color: ${(props) => props.colour ? props.colour : "white"};
  color: ${(props) => props.colour ? "white" : basicBlueColour};
  outline: none !important;
  border: 1px solid ${basicBlueColour};

  border-radius: 0px;

  &:last-of-type{
    border-left: 0px;
  }
`;

export const LoginContainer = styled.div`
  @media all and (max-width: 799px), @media handheld  {
    width: auto;
  }
  @media all and (min-width: 800px){
    width: 500px;
  }

  height: calc(100vh - 50px);
  margin: auto;

  &>div{
      height: -webkit-fill-available;
      width: inherit;
      background-color: ${backgroundColour};
      position: relative;
      display: flex;
      align-items: center;
  }

  h1 {
    margin: 0px;
    background-color: ${basicBlueColour};
    color: white;
    font-size: 1.5em;
    font-weight: 400;
    padding-left: 5px;
    height: 1.5em;
  }
`;

export const PasswordContainer = styled.div`
  &:hover, *:hover{
    cursor: pointer;
  }

  border-bottom: 1px solid #DDD;

  padding: 0.6em 1em;
  display: flex;
  align-items: center;

  div {
    align-items: flex-start;
    display: inline-block;
    margin-right: auto;
    width: calc(100% - 6em);
    overflow-wrap: anywhere;
    padding-bottom: 0.6em;
  }

  label.title {
  display: block;
  color: ${basicBlueColour};
  }

  label.username {
  color: ${basicBlueColour};
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 0.9em;
    img {
      filter: invert(0%) sepia(0%) saturate(17%) hue-rotate(322deg) brightness(102%) contrast(104%);
      margin-right: 0.3em;
    }
  }

  img{
    margin-right: 0em;
  }

  img.icon.start{
    margin-right: 0.3em;
  }
`;

export const LoadingScreen = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  background-color: ${backgroundColour}AA;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  div{
    margin-left: auto;
    margin-right: auto;
    span.sr-only{
      display: none;
    }
  }
`;

export const Popover = styled.div`
  position: absolute;
  border: 1px solid #DDD;
  top: 50px;
  width: auto;
  height: auto;
  background-color: white;
  padding: 0.6em;
  z-index: 99;
  right: calc(${inputOffset} + 45px);
`;

export const DifficultyInput = styled.input`
    background: linear-gradient(to left, #0bb829,#bbe147,#f4e531,#ee6e8f,#ff0053);
    width: 100%;
    border: none;
    height: 1em;
    outline: none;
    transition: background 450ms ease-in;
    -webkit-appearance: none;

    ::-webkit-slider-thumb {
        -webkit-appearance: none;
        -moz-appearance: none;
        -webkit-border-radius: 5px;
        /*16x16px adjusted to be same as 14x14px on moz*/
        height: 1em;
        width: 1em;
        border-radius: 5px;
        background: white;
        border: none;
    }

    ::-moz-range-thumb {
        -webkit-appearance: none;
        -moz-appearance: none;
        -moz-border-radius: 5px;
        height: 1em;
        width: 1em;
        background: white;
        border: none;
    }

    ::-ms-thumb {
        height: 1em;
        width: 1em;
        background: white;
        border: none;
    }
`;
