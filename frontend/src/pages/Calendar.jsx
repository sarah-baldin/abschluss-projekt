import { useState, useEffect } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { formatDate } from "@fullcalendar/core";
import { ToastContainer } from "react-toastify";
import BookingModal from "../components/BookingModal";
import axios from "../axios";
import {
  userIsEventOwner,
  transformBookingToEvent,
  formatEventDate,
} from "../helper/helper";
import MyCalendar from "../components/MyCalendar";
import { useAuth } from "../contexts/AuthContext";
import classNames from "classnames";

const CalendarView = () => {
  const { user } = useAuth();
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [events, setEvents] = useState([]);
  const [eventCount, setEventCount] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingDate, setBookingDate] = useState({
    start_date: {},
    end_date: {},
    isMulti: false,
  });

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible);
  };

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

  useEffect(() => {
    setEventCount(events.length);
  }, [events]);

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
    <div className="demo-app">
      {renderSidebar()}
      <div className="demo-app-main">
        <BookingModal
          show={showModal}
          onHide={onHideModal}
          selectedEvent={selectedEvent}
          bookingDate={bookingDate}
          onEventChanged={fetchEvents}
        />
        <MyCalendar
          fcEvents={events}
          fcWeekendsVisible={weekendsVisible}
          fcRenderEventContent={EventContent}
          fcHandleDateSelect={handleDateSelect}
          fcHandleEventClick={handleEventClick}
        />
      </div>
      <ToastContainer />
    </div>
  );

  function renderSidebar() {
    return (
      <div className="demo-app-sidebar mb-3">
        <div className="demo-app-sidebar-section"></div>
        <div className="demo-app-sidebar-section">
          <label>
            <input
              type="checkbox"
              checked={weekendsVisible}
              onChange={handleWeekendsToggle}
            ></input>
            toggle weekends
          </label>
        </div>
        <div className="demo-app-sidebar-section">
          <label>
            Anzahl Buchungsübersicht:{`  `}
            <select onChange={(e) => setEventCount(e.target.value)}>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value={events.length}>{`alle(${events.length})`}</option>
            </select>
          </label>
          <h2>
            {events.length < eventCount ? "Letzte Buchungen" : "Alle Buchungen"}{" "}
            ({events.length})
          </h2>
          <ul>{events.map(renderSidebarEvent)}</ul>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Raum buchen
        </button>
      </div>
    );
  }

  function EventContent({ event }) {
    const HandleTooltipRendering = ({ children }) => {
      return userIsEventOwner(user, event) ? (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-top`}>
              Tooltip on <strong>top</strong>.
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

  function renderSidebarEvent(event) {
    return (
      <li key={event.id}>
        <b>
          {formatDate(event.start, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </b>{" "}
        -{" "}
        <i>
          {user.id === event.extendedProps.user_id ? event.title : "BLOCKER"}
        </i>
      </li>
    );
  }
};

export default CalendarView;
