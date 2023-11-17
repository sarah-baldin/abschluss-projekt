import { useState, useEffect } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { formatDate } from "@fullcalendar/core";
import { ToastContainer } from "react-toastify";
import BookingModal from "../components/BookingModal";
import axios from "../axios";
import MyCalendar from "../components/MyCalendar";
import { useAuth } from "../contexts/AuthContext";

export const getBackgroundColorForRoom = (roomId) => {
  const colors = {
    1: "#1F2041",
    2: "#4B3F72",
    3: "#252525",
    4: "#119DA4",
    5: "#19647E",
    6: "#E1A8A4",
  };
  return colors[roomId] || "#FFFFFF"; // Fallback-Farbe, falls keine Raum-ID gefunden wurde
};

export const transformBookingToEvent = (booking) => {
  const username = booking.user?.firstname
    ? ` (booked by: ${booking.user?.firstname} ${booking.user?.lastname})`
    : " (undefined Testuser)";

  const modifyDate = (date) => {
    return date.replace(" ", "T");
  };

  const modifiedStartDate = modifyDate(booking.start_date);
  const modifiedEndDate = modifyDate(booking.end_date);

  return {
    ...{
      id: booking.id || null,
      allday: false,
      title: booking.customer_name + username,
      start: modifiedStartDate,
      end: modifiedEndDate,
      backgroundColor: getBackgroundColorForRoom(booking.room_id),
      extendedProps: {
        start_date: modifiedStartDate,
        end_date: modifiedEndDate,
        person_count: booking.person_count,
        others: booking.others,
        user_id: booking.user?.id || 257,
        room_id: booking.room_id,
        created_at: booking.created_at || new Date(),
        updated_at: booking.updated_at || new Date(),
        user: {
          firstname: booking.user?.firstname || "Undefined",
          lastname: booking.user?.lastname || "Test-User",
          email: booking.user?.email || "undefinded@testuser.de",
        },
        materials: [...booking.materials],
        caterings: [...booking.caterings],
      },
    },
  };
};

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
    console.log("Alle events: ", events);
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
      const { start_date, end_date } = e.event._def.extendedProps;

      setSelectedEvent(e.event);
      setBookingDate({
        start_date: start_date,
        end_date: end_date,
        isMulti: !checkSameDay(start_date, end_date),
      });
      setShowModal(true);
    } else {
      console.log("Calendar-> handleEventClick: no event clicked or selected!");
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

    // Set these dates to state, and open your modal
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
      Calendar App
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
          fcRenderEventContent={renderEventContent}
          fcHandleDateSelect={handleDateSelect}
          fcHandleEventClick={handleEventClick}
        />
      </div>
      <ToastContainer />
    </div>
  );

  function renderSidebar() {
    return (
      <div className="demo-app-sidebar m-3">
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

  function renderEventContent(eventInfo) {
    return (
      <>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-top`}>
              Tooltip on <strong>top</strong>.
            </Tooltip>
          }
        >
          <div
            className="sarah-test"
            style={{
              backgroundColor: eventInfo.event.backgroundColor,
              color: "white",
            }}
          >
            <i>{eventInfo.event.title}</i>
            <div className="event-text">
              <b>{eventInfo.timeText}</b>
              <i>{eventInfo.event.title}</i>
            </div>
          </div>
        </OverlayTrigger>
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
        - <i>{event.title}</i>
      </li>
    );
  }
};

export default CalendarView;
