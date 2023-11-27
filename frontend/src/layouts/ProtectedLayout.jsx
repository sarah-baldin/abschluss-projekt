import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "../axios";
import { useAuth } from "../contexts/AuthContext";
import CustomButton from "../components/custom/CustomButton";
import { Col, Container, Row } from "react-bootstrap";
import CustomButtonGroup from "../components/custom/CustomButtonGroup";

export default function DefaultLayout() {
  const { user, setUser } = useAuth();
  const location = useLocation();

  // check if user is logged in or not from the server
  useEffect(() => {
    const fetchUser = async () => {
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
    };

    fetchUser();
    // eslint-disable-next-line
  }, []);

  // if the user is not logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Container>
        <Row>
          <Col className="d-flex justify-content-end mt-3">
            <CustomButtonGroup>
              <CustomButton
                useAs={
                  location.pathname === "/dashboard"
                    ? "toCalendar"
                    : "toDashboard"
                }
              />
              <CustomButton useAs="logout" />
            </CustomButtonGroup>
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
