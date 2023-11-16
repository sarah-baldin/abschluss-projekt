import axios from "../axios";

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
