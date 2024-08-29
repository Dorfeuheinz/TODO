import React, { useState, useEffect } from 'react';
import "App.css";
import { GlobalActionTypes, useGlobalContext } from "contexts/Global";
import { OverridableTokenClientConfig, googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import Todo from 'containers/Todo';

function App(): React.JSX.Element {
  // const { globalState, globalDispatch } = useGlobalContext();

  return (
    <Todo />
  )
}

export default App;