import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";

function LoginRegisterCard({ onSubmit }) {
  return (
    <Card
      className="login-register-card"
      style={{ margin: "auto", maxWidth: "60vw" }}
    >
      <Card.Header as="h5">Login</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" />
            {/* <Form.Text className="text-muted">
              We'll never share your email with anyone else.
            </Form.Text> */}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Stay logged in?" />
          </Form.Group>
          <Button variant="primary" size="lg" type="submit" onSubmit={onSubmit}>
            Login
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default LoginRegisterCard;
