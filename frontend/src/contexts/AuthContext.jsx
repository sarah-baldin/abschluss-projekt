import { createContext, useContext, useState, useEffect } from "react";
import axios from "../axios";

const AuthContent = createContext({
  user: null,
  isAdmin: false,
  fetchAllUsers: () => {},
  setUser: () => {},
  csrfToken: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, _setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [isAdmin, setIsAdmin] = useState(false);

  // set user and check admin status
  const setUser = (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      setIsAdmin(user.admin || false);
    } else {
      localStorage.removeItem("user");
      setIsAdmin(false);
    }
    _setUser(user);
  };

  // csrf token generation for guest methods
  const csrfToken = async () => {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie");
    return true;
  };

  // fetch all users if admin
  const fetchAllUsers = async () => {
    try {
      if (isAdmin) {
        const response = await axios.post("users");
        // handle the response, maybe update state with the fetched users
        console.log("Fetched Users:", response.data.users);
      } else {
        console.error("User is not an admin");
      }
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  // logout user
  const logout = async () => {
    try {
      const resp = await axios.post("/logout");
      if (resp.status === 200) {
        localStorage.removeItem("user");
        setUser(null); // Clear user in the context
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Check if user is admin on initial load
  useEffect(() => {
    setIsAdmin(user ? user.admin || false : false);
  }, [user]);

  return (
    <AuthContent.Provider
      value={{ user, isAdmin, fetchAllUsers, setUser, csrfToken, logout }}
    >
      {children}
    </AuthContent.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContent);
};
