import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import l17 from "@fullcalendar/core/locales/de";
import interactionPlugin from "@fullcalendar/interaction";

const MyCalendar = ({
  fcEvents,
  fcWeekendsVisible,
  fcRenderEventContent,
  fcHandleDateSelect,
  fcHandleEventClick,
}) => {
  return (
    <FullCalendar
      plugins={[
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin,
        bootstrapPlugin,
        bootstrap5Plugin,
      ]}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      initialView="dayGridMonth"
      timeZone="local"
      locale={l17}
      firstDay={1}
      defaultAllDay={false}
      themeSystem="bootstrap4"
      events={fcEvents}
      editable={false}
      selectable={true}
      selectMirror={true}
      weekNumbers={true}
      weekends={fcWeekendsVisible}
      eventContent={fcRenderEventContent}
      select={fcHandleDateSelect}
      eventClick={fcHandleEventClick}
    />
  );
};

export default MyCalendar;
