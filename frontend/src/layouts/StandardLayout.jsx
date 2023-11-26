import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function StandardLayout() {
  const { user } = useAuth();

  // if user is logged in, redirect to calendar page
  if (user) {
    return <Navigate to="/calendar" />;
  }
  return (
    <>
      <Outlet />
    </>
  );
}
