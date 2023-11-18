import Axios from "axios";

const axios = Axios.create({
  // eslint-disable-next-line no-undef
  baseURL: import.meta.env.VITE_APP_AXIOS_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default axios;
