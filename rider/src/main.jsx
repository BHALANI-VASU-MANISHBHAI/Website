import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import GlobalContextProvider from "./contexts/GlobalContext.jsx";
import OrderContextProvider from "./contexts/OrderContext.jsx";
import UserContextProvider from "./contexts/UserContext.jsx";
import "./index.css";

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
