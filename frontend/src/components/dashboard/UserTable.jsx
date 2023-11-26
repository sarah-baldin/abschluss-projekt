import { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";
import UserModal from "./UserModal";
import CustomButton from "../custom/CustomButton";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../axios";
import { toast } from "react-toastify";

const UserTable = () => {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [isAdmin]);

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/users/${userId}`);

      throwToast("Userdaten erfolgreich gelöscht!");
      // Refresh the user list after deletion
      fetchAllUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await axios.put(`/users/${userId}`, userData);
      // Refresh the user list after updating
      fetchAllUsers();
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleNewUser = async (userData) => {
    try {
      // Send request to register route for adding a new user
      await axios.post("/register", userData);
      // Refresh the user list after adding a new user
      fetchAllUsers();
    } catch (error) {
      console.error("Error creating new user:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  console.log("selectedUser:", selectedUser);

  const throwToast = (
    title,
    type = "success",
    timeout = 5000,
    position = "bottom-right",
    theme = "dark"
  ) => {
    return toast[type](title, {
      position: position,
      autoClose: timeout,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: theme,
    });
  };

  return (
    <div>
      {isAdmin && (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th className="text-center">Role</th>
                <th className="text-center">Admin</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users &&
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{`${user.firstname} ${user.lastname}`}</td>
                    <td>{user.email}</td>
                    <td className="text-center">{user.role}</td>
                    <td className="text-center">
                      {user.admin ? (
                        <FontAwesomeIcon
                          icon={faCheck}
                          style={{ color: "green" }}
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faTimes}
                          style={{ color: "red" }}
                        />
                      )}
                    </td>
                    <td className="text-right">
                      <Button
                        variant="primary"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </Button>{" "}
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          <CustomButton
            label="Neuer User"
            variant="success"
            onClick={() => {
              setSelectedUser(null);
              setShowModal(true);
            }}
          />
        </>
      )}

      {!isAdmin && (
        <CustomButton
          label="Passwort ändern"
          variant="warning"
          onClick={() => {
            setSelectedUser(user);
            setShowModal(true);
          }}
        />
      )}

      <UserModal
        show={showModal}
        onHide={handleCloseModal}
        user={selectedUser}
        onUpdate={handleUpdateUser}
        onNewUser={handleNewUser}
        isAdmin={isAdmin}
        toast={throwToast}
      />
    </div>
  );
};

export default UserTable;
