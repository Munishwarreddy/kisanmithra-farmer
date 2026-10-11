import axios from "axios";
import { getApiBaseUrl } from "./apiUrl";

const API_URL = getApiBaseUrl();

export const resolveFarmerId = async (farmer) => {
  const farmerId = farmer?._id || farmer;
  if (/^[a-f\d]{24}$/i.test(String(farmerId || ""))) {
    return String(farmerId);
  }

  const email = farmer?.email || farmer?.farmerEmail;
  if (!email) {
    throw new Error("This farmer does not have a registered account yet.");
  }
  if (!API_URL) {
    throw new Error("The API is not configured. Set VITE_API_URL and redeploy the client.");
  }

  const { data } = await axios.get(`${API_URL}/users/farmers`);
  const farmers = Array.isArray(data?.data) ? data.data : [];
  const matchingFarmer = farmers.find(
    (candidate) => candidate.email?.trim().toLowerCase() === email.trim().toLowerCase()
  );

  if (!matchingFarmer?._id) {
    throw new Error("This farmer does not have a registered account yet.");
  }

  return String(matchingFarmer._id);
};
