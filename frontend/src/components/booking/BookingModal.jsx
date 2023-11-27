import { useEffect, useState } from "react";
import axios from "../../axios";
import _ from "lodash";
import {
  getCateringsAll,
  getMaterialsAll,
  getBookableRooms,
  transformEventToBooking,
  formatEventDate,
  modifyDate,
} from "../../helper/helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { Modal, Button, Form, FloatingLabel } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
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
  const [bookableRooms, setBookableRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [isMultiDays, setIsMultiDays] = useState(false);
  const [isNewBooking, setIsNewBooking] = useState(false);
  const [isOverlapping, setIsOverlapping] = useState(false);
  const [isCapacityExceeded, setIsCapacityExceeded] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState(false);

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

  const fetchBookableRooms = async () => {
    const data = await getBookableRooms();
    if (data) {
      setBookableRooms(data);
      setLoading(false);
    }
  };

  // get materials, caterings and bookableRooms data from api on initial render
  useEffect(() => {
    fetchMaterials();
    fetchCaterings();
    fetchBookableRooms();
  }, []);

  console.log("RRROOOOMS: ", bookableRooms);

  useEffect(() => {
    const transformedEvent = transformEventToBooking(selectedEvent, user);
    console.log("selectedEvent outside:", selectedEvent);
    setIsNewBooking(selectedEvent === null);

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
  }, [selectedEvent, bookingDate, user]);

  // Fuction to check if new booking fits room capacities or room is booked already
  const checkOverlappingAndCapacity = async (event, variant = "") => {
    let emptyDate = _.isEmpty(event.start_date);
    console.log("date.replace: ", formData, modifyDate(event.start_date));
    // Check for overlapping bookings and capacity
    if (!emptyDate) {
      const response = await axios.post("/bookings/check-overlapping", {
        room_id: event.room_id,
        start_date: modifyDate(
          event.start_date,
          variant === "update" && "rm-Zone"
        ),
        end_date: modifyDate(event.end_date, variant === "update" && "rm-Zone"),
        person_count: event.person_count,
      });

      const { overlapping, capacityExceeded } = response.data;

      setIsOverlapping(overlapping);
      setIsCapacityExceeded(capacityExceeded);

      // You can display a toast or perform other actions based on the results
      if (capacityExceeded && overlapping) {
        setValidationErrorMessage(
          "Raum zu dieser Zeit nicht verfügbar & Raumkapazität überschritten!",
          "error"
        );
      } else if (capacityExceeded) {
        setValidationErrorMessage("Raumkapazität überschritten!", "error");
      } else if (overlapping) {
        setValidationErrorMessage(
          "Raum zu dieser Zeit nicht verfügbar!",
          "error"
        );
      }
    }
  };

  useEffect(() => {
    // Watch for changes in start_date, end_date, and room_id
    if ((show, formData.start_date && formData.end_date && formData.room_id)) {
      checkOverlappingAndCapacity(formData);
    }
  }, [show, formData]);

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
      } else {
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
    checkOverlappingAndCapacity(formData);

    // Check if there are overlapping bookings or capacity is exceeded
    if (isOverlapping || isCapacityExceeded) {
      // Display a toast or handle the situation accordingly
      throwToast(validationErrorMessage, "error");
      return;
    } else {
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
    }
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
      // TODO!!!!! check error in console!
      checkOverlappingAndCapacity(updatedData);

      const modifiedData = {
        ...updatedData,
        start_date: modifyDate(updatedData.start_date, "rm-Zone"),
        end_date: modifyDate(updatedData.end_date, "rm-Zone"),
      };

      console.log("Modiefiiiiied: ", modifiedData);

      // Check if there are overlapping bookings or capacity is exceeded
      if (isOverlapping || isCapacityExceeded) {
        // Display a toast or handle the situation accordingly
        throwToast(validationErrorMessage, "error");
        return;
      } else {
        try {
          const response = await axios.put(
            `bookings/${bookingId}`,
            modifiedData
          );
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

  const handleCheckboxChange = (itemId, itemName, isChecked, category) => {
    setFormData((prev) => {
      const newArray = !isChecked
        ? [...prev[category], { id: itemId, name: itemName }]
        : prev[category].filter((item) => item.id !== itemId);

      /* console.log({ ...prev, [category]: newArray }); */
      return { ...prev, [category]: newArray };
    });
  };

  // Function to render WLAN-Code button or voucher codes
  const renderWlanOptions = () => {
    const isWlanCodesChecked = formData.materials.some((item) => item.id === 1);
    return (
      <>
        {isWlanCodesChecked && (
          <div className="form-group-wlan-options">
            <FloatingLabel
              controlId="voucher_lifetime"
              label="Gültigkeit (Tage)?"
            >
              <Form.Control
                as="select"
                name="voucher_lifetime"
                value={formData.voucher_lifetime}
                onChange={(e) => handleInputChange(e)}
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                ))}
              </Form.Control>
            </FloatingLabel>
            <FloatingLabel controlId="voucher_count" label="Anzahl Codes?">
              <Form.Control
                as="select"
                name="voucher_count"
                value={formData.voucher_count}
                onChange={(e) => handleInputChange(e)}
              >
                {Array.from({ length: 21 }, (_, index) => (
                  <option key={index} value={index}>
                    {index}
                  </option>
                ))}
              </Form.Control>
            </FloatingLabel>
          </div>
        )}
      </>
    );
  };

  return (
    !loading && (
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
                  {bookableRooms.map((room) => (
                    <option key={`room-${room.id}`} value={room.id}>
                      {room.name}
                    </option>
                  ))}
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
                          const isChecked = formData.caterings.some(
                            (catering) => catering.id === item.id
                          );

                          handleCheckboxChange(
                            itemId,
                            itemName,
                            isChecked,
                            "caterings"
                          );
                        }}
                      >
                        {item.name}
                      </Button>
                    );
                  })}
              </div>
            </Form.Group>
            ;{/* Material */}
            <Form.Group className="form-group-checkbox mb-3">
              <Form.Label>Material</Form.Label>
              <div className="materials-wrapper">
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
                      className={classNames("m-2", "wlan-selected", {
                        "w-100": isWlanCodes && isChecked,
                      })}
                      onClick={(e) => {
                        e.stopPropagation();

                        if (isWlanCodes && isChecked) {
                          // If Wlan-Codes is checked and has vouchers, uncheck the button
                          handleCheckboxChange(
                            material.id,
                            material.name,
                            true,
                            "materials"
                          );
                        } else {
                          // Otherwise, proceed with the normal checkbox change
                          handleCheckboxChange(
                            material.id,
                            material.name,
                            isChecked,
                            "materials"
                          );
                        }
                      }}
                    >
                      {material.name}
                      {isWlanCodes && isChecked && (
                        <>
                          <div className="close-badge position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                            <FontAwesomeIcon icon={faTimes} />
                          </div>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {renderWlanOptions()}
                          </div>
                        </>
                      )}
                    </Button>
                  );
                })}
              </div>
            </Form.Group>
            ; ; ;{/* Sonstiges */}
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
            {/* Add WLAN-Codes if existing */}
            <div className="voucher-wrapper">
              {formData.vouchers &&
                formData.vouchers.length > 0 &&
                formData.vouchers.map((voucher, index) => (
                  <div key={index} className="voucher-code my-3">
                    WLAN-Code {index + 1}: {voucher.code}
                  </div>
                ))}
            </div>
            {/* Modal CRUD-Buttons */}
            <div className="crud-button-group d-flex my-3 gap-3">
              {isNewBooking ? (
                <Button type="submit" variant="success">
                  Buchen
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
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
                </>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    )
  );
};

export default BookingModal;
