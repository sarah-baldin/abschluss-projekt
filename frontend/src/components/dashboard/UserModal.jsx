import { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

const UserModal = ({
  show,
  onHide,
  user,
  onUpdate,
  onNewUser,
  isAdmin,
  toast,
}) => {
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "EX",
    admin: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (user) {
      // Populate form fields with user data when editing
      setUserData({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: "",
        password_confirmation: "",
        role: user.role,
        admin: user.admin,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    if (e.target.name === "admin") {
      setUserData({
        ...userData,
        admin: e.target.checked ? 1 : 0,
      });
    } else {
      setUserData({
        ...userData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const validatePassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      if (!userData.firstname || !userData.lastname || !userData.email) {
        setValidationErrors({
          ...validationErrors,
          general: "All fields are required.",
        });
        return;
      }

      if (user && !userData.password) {
        delete userData.password;
        delete userData.password_confirmation;
      } else if (
        !userData.password ||
        userData.password !== userData.password_confirmation ||
        !validatePassword(userData.password)
      ) {
        setValidationErrors({
          ...validationErrors,
          password:
            "Password must have at least 8 characters, including uppercase, lowercase, digits, and symbols.",
          password_confirmation: "Passwords do not match.",
        });
        return;
      }

      if (user) {
        await onUpdate(user.id, userData);
        toast("Userdaten erfolgreich geändert!");
      } else {
        await onNewUser(userData);
        toast("Userdaten erfolgreich hinterlegt!");
      }

      onHide();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        toast(
          "Error, verständigen Sie den Administrator: " +
            error.response.data.errors
        );
        setValidationErrors(error.response.data.errors);
      } else {
        toast("Error submitting user data:" + error);
      }
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      className="d-flex align-items-center justify-content-center"
    >
      <Modal.Header closeButton>
        <Modal.Title>{user ? "Edit User" : "Add User"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {validationErrors.general && (
          <Alert variant="danger">{validationErrors.general}</Alert>
        )}
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formFirstname" className="my-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstname"
              value={userData.firstname}
              onChange={handleChange}
              isInvalid={validationErrors.firstname}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.firstname}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formLastname" className="my-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastname"
              value={userData.lastname}
              onChange={handleChange}
              isInvalid={validationErrors.lastname}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.lastname}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formEmail" className="my-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              isInvalid={validationErrors.email}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.email}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formPassword" className="my-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              isInvalid={validationErrors.password}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.password}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formpassword_confirmation" className="my-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              name="password_confirmation"
              value={userData.password_confirmation}
              onChange={handleChange}
              isInvalid={validationErrors.password_confirmation}
              required
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.password_confirmation}
            </Form.Control.Feedback>
          </Form.Group>
          {isAdmin && (
            <>
              <Form.Group controlId="formRole" className="my-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                  as="select"
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  isInvalid={validationErrors.role}
                  required
                >
                  <option value="RS">RS</option>
                  <option value="CO">CO</option>
                  <option value="EX">EX</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.role}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formAdmin" className="my-3">
                <Form.Check
                  type="checkbox"
                  label="Admin"
                  name="admin"
                  checked={userData.admin}
                  onChange={handleChange}
                  isInvalid={validationErrors.admin}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.admin}
                </Form.Control.Feedback>
              </Form.Group>
            </>
          )}
          <Button
            variant="primary"
            type="submit"
            disabled={
              !userData.firstname ||
              !userData.lastname ||
              !userData.email ||
              !userData.password ||
              userData.password !== userData.password_confirmation
            }
            className="my-3"
          >
            Submit
          </Button>{" "}
          <Button variant="secondary" onClick={onHide}>
            Discard
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserModal;
