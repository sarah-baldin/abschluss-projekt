import { useState, useEffect } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { ToastContainer } from "react-toastify";
import BookingModal from "../components/booking/BookingModal";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import l17 from "@fullcalendar/core/locales/de";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "../axios";
import {
  userIsEventOwner,
  transformBookingToEvent,
  formatEventDate,
} from "../helper/helper";
import { useAuth } from "../contexts/AuthContext";
import classNames from "classnames";

const CalendarView = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingDate, setBookingDate] = useState({
    start_date: {},
    end_date: {},
    isMulti: false,
  });

  const onHideModal = () => {
    setSelectedEvent(null);
    setShowModal(false);
  };

  const fetchEvents = () => {
    axios
      .get("/bookings")
      .then((response) => {
        const transformedEvents = response.data.map(transformBookingToEvent);
        setEvents(transformedEvents);
      })
      .catch((error) => {
        console.error("There was an error fetching the data", error);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const checkSameDay = (start, end) => {
    const date1 = new Date(start);
    const date2 = new Date(end);

    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  };

  // just handle existing events
  const handleEventClick = (e) => {
    if (e.event) {
      const { user_id } = e.event.extendedProps;

      // Only open the modal if the event's user_id is the same as the logged-in user
      if (user.id === user_id) {
        setSelectedEvent(e.event);
        setBookingDate({
          start_date: e.event.startStr,
          end_date: e.event.endStr,
          isMulti: !checkSameDay(e.event.startStr, e.event.endStr),
        });
        setShowModal(true);
      }
    }
  };

  const handleDateSelect = (selectInfo) => {
    /* set defaultAllday Option to false first */
    const modifiedEvent = { ...selectInfo, ...{ allDay: false } };

    function subtractOneDay(dateStr) {
      const date = new Date(dateStr); // Convert the string to a Date object
      date.setDate(date.getDate() - 1); // Subtract one day
      return date.toISOString().split("T")[0]; // Convert the Date object back to a string in YYYY-MM-DD format
    }

    let start_date, end_date, isMulti;

    // If it's in dayGridMonth view, the end date is exclusive and needs to be adjusted.
    if (modifiedEvent.view.type === "dayGridMonth") {
      start_date = `${modifiedEvent.startStr}T00:00:00`;
      end_date = `${subtractOneDay(modifiedEvent.endStr)}T00:00:00`;
      isMulti = modifiedEvent.startStr !== subtractOneDay(modifiedEvent.endStr);
    } else {
      // For other views, use the exact start and end times
      start_date = modifiedEvent.startStr;
      end_date = modifiedEvent.endStr;
      isMulti =
        modifiedEvent.startStr.split("T")[0] !==
        modifiedEvent.endStr.split("T")[0];
    }

    setBookingDate({
      start_date,
      end_date,
      isMulti,
    });

    setShowModal(true);

    let calendarApi = modifiedEvent.view.calendar;
    calendarApi.unselect();
  };

  return (
    <div className="book-a-room">
      <div className="test ">
        <h1>book-a-room</h1>
        <button
          className="btn btn-success btn-lg"
          onClick={() => setShowModal(true)}
        >
          Raum buchen
        </button>
      </div>

      <div className="demo-app-main mt-5">
        <BookingModal
          show={showModal}
          onHide={onHideModal}
          selectedEvent={selectedEvent}
          bookingDate={bookingDate}
          onEventChanged={fetchEvents}
        />
        <FullCalendar
          plugins={[
            dayGridPlugin,
            interactionPlugin,
            bootstrapPlugin,
            bootstrap5Plugin,
          ]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth",
          }}
          initialView="dayGridMonth"
          timeZone="local"
          locale={l17}
          firstDay={1}
          defaultAllDay={false}
          themeSystem="bootstrap4"
          events={events}
          editable={false}
          selectable={true}
          selectMirror={true}
          weekNumbers={true}
          weekends={true}
          eventContent={EventContent}
          select={handleDateSelect}
          eventClick={handleEventClick}
        />
      </div>
      <ToastContainer />
    </div>
  );

  function EventContent({ event }) {
    const HandleTooltipRendering = ({ children }) => {
      console.log(event);
      return userIsEventOwner(user, event) ? (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip className={classNames("tooltip-top", "bg-darker")}>
              <div>
                {event.title}
                {`${event.extendedProps.user.firstname} ${event.extendedProps.user.lastname}`}
              </div>
            </Tooltip>
          }
        >
          {children}
        </OverlayTrigger>
      ) : (
        <>{children}</>
      );
    };

    return (
      <>
        <HandleTooltipRendering>
          <div
            className={classNames(
              "custom-event-wrapper",
              userIsEventOwner(user, event)
                ? "cursor-pointer"
                : "cursor-pointer-disabled"
            )}
            style={{
              backgroundColor: event.backgroundColor,
            }}
          >
            {user.id === event.extendedProps.user_id ? (
              <div className="custom-event my-event">
                <div className="event-timespan">
                  <b>
                    {formatEventDate(event.extendedProps.start_date, "time")}
                  </b>
                  <b className="mx-1">{" - "}</b>
                  <b>{formatEventDate(event.extendedProps.end_date, "time")}</b>
                </div>
                <div className="event-title">
                  <i>{event.title}</i>
                </div>
              </div>
            ) : (
              <div className="custom-event other-event">
                <div className="event-timespan">
                  <b>
                    {formatEventDate(event.extendedProps.start_date, "time")}
                  </b>
                  <b className="mx-1">{" - "}</b>
                  <b>{formatEventDate(event.extendedProps.end_date, "time")}</b>
                </div>
                <div className="event-title">
                  <i>BLOCKER</i>
                </div>
              </div>
            )}
          </div>
        </HandleTooltipRendering>
      </>
    );
  }
};

export default CalendarView;
