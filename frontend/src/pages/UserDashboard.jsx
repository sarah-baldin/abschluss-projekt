import { Container, Row, Col } from "react-bootstrap";
import UserTable from "../components/dashboard/UserTable";

const UserDashboard = () => {
  return (
    <Container>
      <Row className="mt-5">
        <Col>
          <h1 className="text-center">USER DASHBOARD</h1>
        </Col>
      </Row>
      <UserTable />
    </Container>
  );
};

export default UserDashboard;
