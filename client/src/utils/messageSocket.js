import { io } from "socket.io-client";
import { API_URL } from "./api";

const buildSocketBaseUrl = () => {
  if (API_URL) {
    return API_URL.replace(/\/api\/?$/, "");
  }

  return window.location.origin;
};

export const createMessageSocket = () =>
  io(`${buildSocketBaseUrl()}/messages`, {
    path: "/socket.io",
    transports: ["websocket"],
    autoConnect: false,
  });
