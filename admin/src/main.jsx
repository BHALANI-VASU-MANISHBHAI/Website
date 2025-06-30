import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

import GlobalContextProvider from './contexts/GlobalContext.jsx';
import UserContextProvider from './contexts/UserContext.jsx'; // Import UserContextProvider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalContextProvider>    {/* 🔗 Wrap GlobalContext first */}
      <UserContextProvider>     {/* 🔗 Wrap UserContext inside GlobalContext */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserContextProvider>
    </GlobalContextProvider>
  </StrictMode>
);
