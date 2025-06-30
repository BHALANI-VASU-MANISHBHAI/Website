import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import GlobalContextProvider from "./context/GlobalContextProvider.jsx";
import CartContextProvider from "./context/CartContextProvider.jsx";
import UserContextProvider from "./context/UserContextProvider.jsx";
import ProductContextProvider from "./context/ProductContextProvider.jsx";
import ScrollToTop from './components/ScrollToTop .jsx'
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
   
    <GoogleOAuthProvider clientId={clientId}>
      <GlobalContextProvider>
        <UserContextProvider>
          <ProductContextProvider>
            <CartContextProvider>
               <ScrollToTop />
              <App />
            </CartContextProvider>
          </ProductContextProvider>
        </UserContextProvider>
      </GlobalContextProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
