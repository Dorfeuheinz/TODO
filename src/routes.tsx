import { createBrowserRouter } from "react-router-dom";
import App from "App";
import React from "react";
import { GlobalContextProvider } from 'contexts/Global';

import { GoogleOAuthProvider } from '@react-oauth/google';

import Auth from "containers/Auth";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <GoogleOAuthProvider clientId="174116057342-21v188sqa834mvo5lphqisg7lnu733rg.apps.googleusercontent.com" children={<Auth />}></GoogleOAuthProvider>,
    children: [],
  },
  {
    path: "/todo",
    element: <GlobalContextProvider children={<App />}></GlobalContextProvider>,
    children: [],
  },

]);
