import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom'; // ✅ Correct way to import
import GlobalContextProvider from './contexts/GlobalContext.jsx';
import UserContextProvider from './contexts/UserContext.jsx';
import OrderContextProvider from './contexts/OrderContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalContextProvider>
      <UserContextProvider>
      <OrderContextProvider>
      <App />
      </OrderContextProvider>
      </UserContextProvider>
      </GlobalContextProvider>
    </BrowserRouter>
      
  </StrictMode>
);
