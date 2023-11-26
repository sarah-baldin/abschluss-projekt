import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const CustomButton = ({ useAs, ...extraProps }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getButtonProps = () => {
    switch (useAs) {
      case "toCalendar":
        return {
          variant: "primary",
          label: "Kalender",
          onClick: () => navigate("/calendar"),
        };
      case "toDashboard":
        return {
          variant: "primary",
          label: "User-Dashboard",
          onClick: () => navigate("/dashboard"),
        };
      case "logout":
        return {
          variant: "danger",
          label: "Logout",
          onClick: () => handleLogout(),
        };
      default:
        return {}; // Default button props
    }
  };

  const { variant, label, onClick, ...rest } = {
    ...getButtonProps(),
    ...extraProps,
  };

  return (
    <Button variant={variant} onClick={onClick} {...rest}>
      {label}
    </Button>
  );
};

export default CustomButton;
