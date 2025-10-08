import axios from "axios";
import { API_BASE_URL, API_CONSUMER_KEY, API_CONSUMER_SECRET } from "@/utils/apiUtils/constants";

const client = axios.create({
  baseURL: API_BASE_URL,
  auth: {
    username: API_CONSUMER_KEY,
    password: API_CONSUMER_SECRET,
  },
});

export default client;
