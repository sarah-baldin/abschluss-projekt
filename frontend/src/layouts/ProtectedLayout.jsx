import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
import axios from "../axios";
import { useAuth } from "../contexts/AuthContext";
import { Button, Col, Container, Row } from "react-bootstrap";

export default function DefaultLayout() {
  const { user, setUser } = useAuth();

  // check if user is logged in or not from server
  useEffect(() => {
    (async () => {
      try {
        const resp = await axios.get("/user");
        if (resp.status === 200) {
          setUser(resp.data.data);
        }
      } catch (error) {
        if (error.response.status === 401) {
          localStorage.removeItem("user");
          window.location.href = "/";
        }
      }
    })();
  }, []);

  // if user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/" />;
  }

  // logout user
  const handleLogout = async () => {
    try {
      const resp = await axios.post("/logout");
      if (resp.status === 200) {
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <Container>
        <Row>
          <Col className="d-flex justify-content-end mt-3">
            <Button onClick={handleLogout} variant="danger">
              Logout
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Outlet />
          </Col>
        </Row>
      </Container>
    </>
  );
}
