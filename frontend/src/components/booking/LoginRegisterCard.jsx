import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../axios";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

function LoginRegisterCard() {
  const { setUser, csrfToken } = useAuth();
  const [formInput, setFormInput] = useState({ email: "", password: "" });

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
    await csrfToken()
      .then(async () => {
        const resp = await axios.post("/login", {
          email: formInput.email,
          password: formInput.password,
        });

        if (resp.status === 200) {
          console.log("resp.data: ", resp.data);
          setUser(resp.data.user);
        }
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  };

  return (
    <Card className="login-register-card w-50">
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
    </Card>
  );
}

export default LoginRegisterCard;
