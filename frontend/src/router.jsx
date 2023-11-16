import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
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
        path: "/register",
        element: <Register />,
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
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
]);

export default router;
