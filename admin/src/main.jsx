import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import GlobalContextProvider from './contexts/GlobalContext.jsx';
import UserContextProvider from './contexts/UserContext.jsx'; // Import UserContextProvider

createRoot(document.getElementById('root')).render(
    <GlobalContextProvider>    {/* 🔗 Wrap GlobalContext first */}
      <UserContextProvider>     {/* 🔗 Wrap UserContext inside GlobalContext */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserContextProvider>
    </GlobalContextProvider>

);
