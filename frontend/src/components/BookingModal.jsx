import { useEffect, useState } from "react";
import axios from "../axios";
import {
  getCateringsAll,
  getMaterialsAll,
  transformEventToBooking,
  formatEventDate,
} from "../helper/helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { Modal, Button, Form, FloatingLabel } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import classNames from "classnames";

const BookingModal = ({
  show,
  onHide,
  selectedEvent,
  onEventChanged,
  bookingDate,
}) => {
  const { user } = useAuth();
  const [caterings, setCaterings] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [isMultiDays, setIsMultiDays] = useState(false);
  const [needVouchers, setNeedVoucher] = useState(false);

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

  const fetchMaterials = async () => {
    const data = await getMaterialsAll();
    if (data) {
      setMaterials(data);
      setLoading(false);
    }
  };

  const fetchCaterings = async () => {
    const data = await getCateringsAll();
    if (data) {
      setCaterings(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    const transformedEvent = transformEventToBooking(selectedEvent, user);

    setFormData((prevState) => {
      return {
        ...prevState,
        ...transformedEvent,
        // if date (not event) clicked and bookingDate is set.
        ...{
          start_date: bookingDate.start_date,
          end_date: bookingDate.end_date,
        },
      };
    });
    setIsMultiDays(bookingDate.isMulti);

    // get materials and caterings data from api
    fetchMaterials();
    fetchCaterings();
  }, [selectedEvent, bookingDate]);

  // handle BookingModal input changes
  const handleInputChange = (e) => {
    console.log("handleInputChange() : e", e.target.name, e.target.value);
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "start") {
        const datePart = prev.start_date.split("T")[0];

        return {
          ...prev,
          ...{ start_date: `${datePart}T${value}:00` },
        };
      } else if (name === "end") {
        const datePart = prev.end_date.split("T")[0];

        return {
          ...prev,
          ...{ end_date: `${datePart}T${value}:00` },
        };
      } else if (name === "start_date") {
        const timePart = prev.start_date.split("T")[1];

        return {
          ...prev,
          ...{ start_date: `${value}T${timePart}` },
        };
      } else if (name === "end_date") {
        const timePart = prev.end_date.split("T")[1];

        return {
          ...prev,
          ...{ end_date: `${value}T${timePart}` },
        };
      } else if (name === "") {
        const timePart = prev.end_date.split("T")[1];

        return {
          ...prev,
          ...{ end_date: `${value}T${timePart}` },
        };
      } else {
        console.log(
          "handleInputChange() else block: ",
          name,
          value,
          prev,
          formData
        );
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  // handle form submit
  const handleSubmitEvent = (e, formData) => {
    console.log("handleSubmitEvent() -> event: ", e, "formData: ", formData);
    e.preventDefault();

    axios
      .post("/bookings", formData)
      .then((response) => {
        console.log("api response from storeBookings: ", response.data);

        // Assuming response.data contains the newly created booking with the correct ID
        setFormData((prev) => ({
          ...prev,
          id: response.data.id,
        }));

        onEventChanged();
        onHide();
        throwToast("Buchung erfolgreich!");
      })
      .catch((error) => {
        throwToast("Buchung nicht erfolgreich!", "error");
        console.error("There was an error fetching the data", error);
      });
  };

  // handle form update
  const handleUpdateEvent = (e, event) => {
    e.preventDefault();
    console.log(
      "handleUpdateEvent() -> Updating event with ID:",
      event.id,
      event
    );

    const updateBooking = async (bookingId, updatedData) => {
      try {
        const response = await axios.put(`bookings/${bookingId}`, updatedData);
        console.log("api response from updateBooking: ", response.data);

        // Assuming response.data contains the updated booking with the correct ID
        setFormData((prev) => ({
          ...prev,
          id: response.data.id,
        }));

        onEventChanged();
        onHide();
        throwToast("Buchung erfolgreich geändert!");
      } catch (error) {
        throwToast("Änderung fehlgeschlagen!", "warning");
        console.error("There was an error updating the booking:", error);
      }
    };

    updateBooking(formData.id, event);
  };

  // handle delete event
  const handleDeleteEvent = (e, event) => {
    e.preventDefault();
    console.log(" handleDeleteEvent() -> e: ", e, "event: ", event);

    const deleteBooking = async (bookingId) => {
      try {
        const response = await axios.delete(`bookings/${bookingId}`);
        console.log("api response from deleteBooking", response.data);
        onEventChanged();
        onHide();
        throwToast("Buchung erfolgreich gelöscht!");
      } catch (error) {
        throwToast("Änderung fehlgeschlagen!", "warning");
        console.error("There was an error updating the booking:", error);
      }
    };
    deleteBooking(event.id);
  };

  const handleCheckboxChange = (materialId, materialName, isChecked) => {
    setFormData((prev) => {
      const newMaterials = [...prev.materials];
      const existingMaterialIndex = newMaterials.findIndex(
        (item) => item.id === materialId
      );

      if (isChecked) {
        // If checked, add the material to formData.materials
        if (existingMaterialIndex === -1) {
          newMaterials.push({ id: materialId, name: materialName });
        }
      } else {
        // If unchecked, remove the material from formData.materials
        if (existingMaterialIndex !== -1) {
          newMaterials.splice(existingMaterialIndex, 1);
        }
      }

      return { ...prev, materials: newMaterials };
    });

    // Check if the current material is id: 1 - "WLAN-Codes"
    if (materialId === 1) {
      setNeedVoucher(isChecked);
    }
  };

  const renderCloseBadge = (materialId, materialName) => (
    <div
      className="close-badge"
      onClick={() => handleCheckboxChange(materialId, materialName, false)}
    >
      <FontAwesomeIcon icon={faTimes} />
    </div>
  );

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton onClick={() => onHide()}>
        <Modal.Title>Raum buchen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => handleSubmitEvent(e, formData)}>
          {/* Raum */}
          <Form.Group className="form-group-select mb-3">
            <FloatingLabel controlId="room_id" label="Wähle einen Raum">
              <Form.Control
                as="select"
                name="room_id"
                value={formData.room_id}
                onChange={handleInputChange}
              >
                <option value={1}>Kesselraum</option>
                <option value={2}>Alte Räucherei</option>
                <option value={3}>Kreativwerkstatt</option>
                <option value={4}>Kammer 1</option>
                <option value={5}>Kammer 2</option>
                <option value={6}>Geheime Weide</option>
              </Form.Control>
            </FloatingLabel>
          </Form.Group>
          {/* Name des Kunden */}
          <Form.Group className="form-group-input mb-3">
            <FloatingLabel
              controlId="customer_name"
              label="Terminname | Name des Kunden"
            >
              <Form.Control
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
              />
            </FloatingLabel>
          </Form.Group>
          {/* Personenzahl */}
          <Form.Group className="form-group-select mb-3">
            <FloatingLabel controlId="person_count" label="Personenzahl">
              <Form.Control
                type="number"
                name="person_count"
                value={formData.person_count}
                onChange={handleInputChange}
              />
            </FloatingLabel>
          </Form.Group>
          {/* Multi-day toggle */}
          <Form.Check
            type="checkbox"
            name="multi"
            label="Ist der Termin mehrtägig?"
            className="mb-3"
            checked={isMultiDays}
            onChange={() => setIsMultiDays(!isMultiDays)}
          />
          {/* Start Date */}
          <Form.Group className="form-group-date mb-3">
            <FloatingLabel controlId="start_date" label="Datum">
              <Form.Control
                type="date"
                name="start_date"
                value={formatEventDate(formData.start_date, "date")}
                onChange={(eventInfo) => handleInputChange(eventInfo)}
              />
            </FloatingLabel>

            {/* End Date - Conditionally Rendered */}
            {isMultiDays && (
              <FloatingLabel controlId="end_date" label="End Datum">
                <Form.Control
                  type="date"
                  name="end_date"
                  value={formatEventDate(formData.end_date, "date")}
                  onChange={handleInputChange}
                />
              </FloatingLabel>
            )}
          </Form.Group>
          {/* Start Time & End Time */}
          <Form.Group className="form-group-time mb-3">
            <FloatingLabel controlId="start" label="Start-Uhrzeit">
              <Form.Control
                type="time"
                name="start"
                value={formatEventDate(formData.start_date, "time")}
                onChange={handleInputChange}
              />
            </FloatingLabel>

            <FloatingLabel controlId="end" label="End-Uhrzeit">
              <Form.Control
                type="time"
                name="end"
                value={formatEventDate(formData.end_date, "time")}
                onChange={handleInputChange}
              />
            </FloatingLabel>
          </Form.Group>
          {/* Verpflegung */}
          <Form.Group className="form-group-checkbox mb-3">
            <Form.Label>Verpflegung</Form.Label>
            <div>
              {!loading &&
                caterings.map((item, idx) => {
                  const isChecked = formData.caterings.some(
                    (catering) => catering.id === item.id
                  );

                  return (
                    <Button
                      key={idx + item.name}
                      variant={isChecked ? "primary" : "outline-primary"}
                      className="m-2"
                      onClick={() => {
                        const itemId = item.id;
                        const itemName = item.name;
                        const isChecked = !formData.caterings.some(
                          (catering) => catering.id === item.id
                        );
                        handleCheckboxChange(itemId, itemName, isChecked);
                      }}
                    >
                      {item.name}
                    </Button>
                  );
                })}
            </div>
          </Form.Group>
          {/* Material */}
          <Form.Group className="form-group-checkbox mb-3">
            <Form.Label>Material</Form.Label>
            <div>
              {materials.map((material, idx) => {
                const isChecked = formData.materials.some(
                  (item) => item.id === material.id
                );

                // Check if the current material is id: 1 - "WLAN-Codes"
                const isWlanCodes = material.id === 1;

                return (
                  <Button
                    key={idx + material.name}
                    variant={isChecked ? "primary" : "outline-primary"}
                    className={classNames("m-2", {
                      "w-100": isWlanCodes && isChecked,
                    })}
                    onClick={(e) => {
                      e.stopPropagation(); // Stop the event propagation
                      handleCheckboxChange(
                        material.id,
                        material.name,
                        !isChecked
                      );
                    }}
                  >
                    {material.name}
                    {isWlanCodes && isChecked && (
                      <div className="badge-container">
                        {renderCloseBadge(material.id, material.name)}
                      </div>
                    )}
                    {isWlanCodes && isChecked && (
                      <div
                        className="form-group-wlan-info"
                        onClick={(e) => {
                          e.stopPropagation(); // Stop the event propagation
                        }}
                      >
                        <FloatingLabel
                          controlId="voucher_lifetime"
                          label="Gültigkeit in Tagen?"
                        >
                          <Form.Control
                            as="select"
                            name="voucher_lifetime"
                            value={1}
                            onChange={(e) => {
                              handleInputChange(e);
                            }}
                          >
                            {Array.from({ length: 5 }, (_, index) => (
                              <option key={index + 1} value={index + 1}>
                                {index + 1}
                              </option>
                            ))}
                          </Form.Control>
                        </FloatingLabel>
                        <FloatingLabel
                          controlId="voucher_count"
                          label="Anzahl benötigter WLAN Codes?"
                        >
                          <Form.Control
                            as="select"
                            name="voucher_count"
                            value={1}
                            onChange={(e) => {
                              e.stopPropagation(); // Stop the event propagation
                              handleInputChange(e);
                            }}
                          >
                            {Array.from({ length: 20 }, (_, index) => (
                              <option key={index + 1} value={index + 1}>
                                {index + 1}
                              </option>
                            ))}
                          </Form.Control>
                        </FloatingLabel>
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </Form.Group>
          {/* Sonstiges */}
          <Form.Group className="form-group-input mb-3">
            <FloatingLabel controlId="others" label="Sonst noch Wünsche?">
              <Form.Control
                type="textarea"
                name="others"
                size={"sm"}
                value={formData.others}
                onChange={handleInputChange}
                placeholder="Sonstige Kommentare oder Anmerkungen..."
              />
            </FloatingLabel>
          </Form.Group>
          {/* Submit Button */}
          <Button type="submit" variant="success">
            Buchen
          </Button>
          {/* Buchung bearbeiten/ löschen Buttons */}
          <Button
            variant="primary"
            className="mx-3 my-3"
            onClick={(e) => handleUpdateEvent(e, formData)}
          >
            Buchung ändern
          </Button>
          <Button
            variant="danger"
            onClick={(e) => handleDeleteEvent(e, formData)}
          >
            Buchung löschen
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BookingModal;
