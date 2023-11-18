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
