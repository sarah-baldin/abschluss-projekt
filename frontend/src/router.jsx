import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import UserDashboard from "./pages/UserDashboard";
import Dokumentation from "./pages/Dokumentation";
import ProtectedLayout from "./layouts/ProtectedLayout";
import StandardLayout from "./layouts/StandardLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StandardLayout />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/doku",
        element: <Dokumentation />,
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "/calendar",
        element: <Calendar />,
      },
      {
        path: "/dashboard",
        element: <UserDashboard />,
      },
    ],
  },
]);

export default router;
