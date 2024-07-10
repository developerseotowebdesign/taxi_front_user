// axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3050/",
});

export default axiosInstance;

export const weburl = "http://localhost:3050/";
export const mainurl = "https://taxi.delhiexpert.com";
