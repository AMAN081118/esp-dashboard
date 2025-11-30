import axios from "axios";

const API_BASE = "http://localhost:5000/api"; // or use LAN IP for devices

export const fetchLiveData = async () => {
  const res = await axios.get(`${API_BASE}/live`);
  return res.data;
};
export const fetchHistory = async () => {
  const res = await axios.get(`${API_BASE}/history`);
  return res.data;
};
