import { useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../axios";
import { useAuth } from "../contexts/AuthContext";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

export default function Login() {
  const { user, setUser, csrfToken } = useAuth();
  const [formInput, setFormInput] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    e.preventDefault();
    setFormInput((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // login user
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Hi! Login Versuch gestartet ;)");
    const data = {
      email: formInput.email,
      password: formInput.password,
    };
    console.log("data: ", data);
    await csrfToken();
    try {
      console.log("csrfToken(): ", csrfToken());
      const resp = await axios.post("/login", {
        email: formInput.email,
        password: formInput.password,
      });
      if (resp.status === 200) {
        console.log("resp.data: ", resp.data);
        setUser(resp.data.user);
        return <Navigate to="/calendar" />;
      }
    } catch (error) {
      if (error.response.status === 401) {
        setError(error.response.data.message);
      }
      console.log("error: ", error);
    }
  };

  return (
    <section className="login-wrapper d-flex align-items-center justify-content-center">
      <Card
        className="login-register-card w-50"
        style={{ margin: "auto", maxWidth: "60vw" }}
      >
        <Card.Header as="h5">Login</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                onChange={handleInputChange}
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                onChange={handleInputChange}
                placeholder="Password"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicCheckbox">
              <Form.Check
                type="checkbox"
                label="Stay logged in?"
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="primary" size="lg" type="submit">
              Login
            </Button>
          </Form>
        </Card.Body>
        {user && (
          <>
            <div>
              username: {user.firstname} {user.lastname}
            </div>
            <div>email: {user.email}</div>
            <div>is_admin: {user.admin}</div>
            <div>role: {user.role}</div>
          </>
        )}
      </Card>
    </section>
  );
}
