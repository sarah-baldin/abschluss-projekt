import axios from "../axios";

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

const defaultEventData = {
  user: "undefined user",
  user_id: 1,
  room_id: 1,
  backgroundColor: "#ff0000",
  customer_name: "",
  person_count: 0,
  start_date: "",
  end_date: "",
  caterings: [],
  materials: [],
  others: "",
};

export const formatEventDate = (timestamp, variant = "full") => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  // Producing the format: yyyy-MM-ddThh:mm:ss
  return variant === "full"
    ? `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
    : variant === "date"
    ? `${year}-${month}-${day}`
    : variant === "time"
    ? `${hours}:${minutes}`
    : new Error('Invalid type provided. Use "full", "date" or "time".');
};

// transform CalendarEvent to correct Format for BookingModal Form
export const transformEventToBooking = (event, user) => {
  console.log("transform event to booking", event);
  if (event) {
    const { title, extendedProps } = event;
    const customerName = title.split("(")[0].trim();
    const userName = user
      ? `${user.firstname} ${user.firstname}`
      : title.split("(")[1].trim().slice(0, -1);

    return {
      id: event.id,
      user: userName,
      customer_name: customerName,
      start_date: formatEventDate(extendedProps.start_date),
      end_date: formatEventDate(extendedProps.end_date),
      person_count: extendedProps.person_count,
      others: extendedProps.others,
      user_id: user ? user.id : extendedProps.user_id,
      room_id: extendedProps.room_id,
      backgroundColor: getBackgroundColorForRoom(extendedProps.room_id),
      materials: extendedProps.materials,
      caterings: extendedProps.caterings,
    };
  } else {
    return defaultEventData;
  }
};

export const transformBookingToEvent = (booking) => {
  const modifyDate = (date) => {
    return date.replace(" ", "T");
  };

  const modifiedStartDate = modifyDate(booking.start_date);
  const modifiedEndDate = modifyDate(booking.end_date);

  return {
    ...{
      id: booking.id || null,
      allday: false,
      title: booking.customer_name,
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


export const userIsEventOwner = (user, event) => {
  return event.extendedProps.user_id === user.id;
};

export const getRoomName = async (roomId) => {
  try {
    const response = await axios.get(`room/${roomId}`);
    return response.data.name;
  } catch (error) {
    console.error("Failed to fetch room details", error);
    return null;
  }
};

export const getRoomsAll = async () => {
  try {
    const response = await axios.get(`rooms`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch rooms ", error);
    return null;
  }
};

export const getCateringsAll = async () => {
  try {
    const response = await axios.get(`caterings`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch caterings", error);
    return null;
  }
};

export const getMaterialsAll = async () => {
  try {
    const response = await axios.get(`materials`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch materials", error);
    return null;
  }
};
