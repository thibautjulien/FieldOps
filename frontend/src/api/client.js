import axios from "axios";
import { Platform } from "react-native";
import { getToken } from "../utils/authStorage";

const LAN_URL = "http://192.168.1.51:3000";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : LAN_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

console.log("[API BASE URL]", BASE_URL);
