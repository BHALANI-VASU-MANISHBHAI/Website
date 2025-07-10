import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GlobalContextProvider from "./contexts/GlobalContext.jsx";
import UserContextProvider from "./contexts/UserContext.jsx";
import OrderContextProvider from "./contexts/OrderContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalContextProvider>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <UserContextProvider>
            <OrderContextProvider>
              <App />
            </OrderContextProvider>
          </UserContextProvider>
        </GoogleOAuthProvider>
      </GlobalContextProvider>
    </BrowserRouter>
  </StrictMode>
);
