import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import UserDashboard from "./pages/UserDashboard";
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
