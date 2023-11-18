import { useEffect, useState } from "react";
import axios from "../axios";
import {
  getCateringsAll,
  getMaterialsAll,
  transformEventToBooking,
  formatEventDate,
} from "../helper/helper";
import { toast } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

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

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton onClick={() => onHide()}>
        <Modal.Title>Raum buchen</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(e) => handleSubmitEvent(e, formData)}>
          {/* Raum */}
          <Form.Group className="mb-3">
            <Form.Label>Raum auswählen</Form.Label>
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
          </Form.Group>

          {/* Name des Kunden */}
          <Form.Group className="mb-3">
            <Form.Label>Name des Kunden</Form.Label>
            <Form.Control
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* Personenzahl */}
          <Form.Group className="mb-3">
            <Form.Label>Personenzahl</Form.Label>
            <Form.Control
              type="number"
              name="person_count"
              value={formData.person_count}
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* Multi-day toggle */}
          <Form.Check
            type="checkbox"
            name="multi"
            label="Multi-day event"
            checked={isMultiDays}
            onChange={() => setIsMultiDays(!isMultiDays)}
          />

          {/* Start Date */}
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formatEventDate(formData.start_date, "date")}
              onChange={(eventInfo) => handleInputChange(eventInfo)}
            />
          </Form.Group>

          {/* Start Time & End Time */}
          <Form.Group className="mb-3">
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              type="time"
              name="start"
              value={formatEventDate(formData.start_date, "time")}
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* End Date - Conditionally Rendered */}
          {isMultiDays && (
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={formatEventDate(formData.end_date, "date")}
                onChange={handleInputChange}
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="time"
              name="end"
              value={formatEventDate(formData.end_date, "time")}
              onChange={handleInputChange}
            />
          </Form.Group>

          {/* Verpflegung */}
          <Form.Group className="mb-3">
            <Form.Label>Verpflegung</Form.Label>
            {!loading &&
              caterings.map((item, idx) => {
                const isChecked = formData.caterings.some(
                  (catering) => catering.id === item.id
                );
                return (
                  <Form.Check
                    key={idx + item.name}
                    type="checkbox"
                    label={item.name}
                    name="caterings"
                    value={item.id}
                    checked={isChecked}
                    onChange={(e) => {
                      const itemId = parseInt(e.target.value, 10); // Convert value to integer
                      if (e.target.checked) {
                        // If checked, add the item to formData.catering
                        setFormData((prev) => ({
                          ...prev,
                          caterings: [
                            ...prev.caterings,
                            {
                              id: itemId,
                              name: item.name,
                            },
                          ],
                        }));
                      } else {
                        // If unchecked, remove the item from formData.caterings
                        setFormData((prev) => ({
                          ...prev,
                          caterings: prev.caterings.filter(
                            (catering) => catering.id !== itemId
                          ),
                        }));
                      }
                    }}
                  />
                );
              })}
          </Form.Group>

          {/* Material */}
          <Form.Group className="mb-3">
            <Form.Label>Material</Form.Label>
            {!loading &&
              materials.map((item, idx) => {
                const isChecked = formData.materials.some(
                  (material) => material.id === item.id
                );
                return (
                  <Form.Check
                    key={idx}
                    type="checkbox"
                    label={item.name}
                    name="materials"
                    value={item.id}
                    checked={isChecked}
                    onChange={(e) => {
                      const itemId = parseInt(e.target.value, 10); // Convert value to integer
                      if (e.target.checked) {
                        // If checked, add the item to formData.materials
                        setFormData((prev) => ({
                          ...prev,
                          materials: [
                            ...prev.materials,
                            {
                              id: itemId,
                              name: item.name,
                            },
                          ],
                        }));
                      } else {
                        // If unchecked, remove the item from formData.materials
                        setFormData((prev) => ({
                          ...prev,
                          materials: prev.materials.filter(
                            (material) => material.id !== itemId
                          ),
                        }));
                      }
                    }}
                  />
                );
              })}
          </Form.Group>
          {/* Sonstiges */}
          <Form.Group className="mb-3">
            <Form.Label>Sonstiges</Form.Label>
            <Form.Control
              type="textarea"
              name="others"
              value={formData.others}
              onChange={handleInputChange}
              placeholder="Sonstige Kommentare oder Anmerkungen..."
            />
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
