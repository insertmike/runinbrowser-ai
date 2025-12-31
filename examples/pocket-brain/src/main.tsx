import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/globals.css";
import BaseLayout from "./components/Layout/BaseLayout";
import LandingPage from "./pages/LandingPage";
import Chat from "./pages/Chat";
import { RoutePath } from "./config/routes";

const router = createBrowserRouter([
  {
    element: <BaseLayout />,
    children: [
      {
        path: RoutePath.HOME,
        element: <LandingPage />,
      },
      {
        path: RoutePath.CHAT,
        element: <Chat />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
