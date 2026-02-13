import axios from "axios";
import { api } from "../api/client";
import { saveToken, removeToken } from "../utils/authStorage";

export const login = async ({ email, password }) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    await saveToken(response.data.token);

    return { success: true, data: response.data, message: null };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return { success: false, message: "Identifiants incorrects" };
    }
    if (axios.isAxiosError(err) && err.response?.status === 400) {
      return { success: false, message: "Email ou mot de passe manquant" };
    }
    return { success: false, message: "Erreur serveur, réessayez plus tard" };
  }
};

export const getMe = async () => {
  try {
    const response = await api.get("/auth/me");
    return { success: true, data: response.data, message: null };
  } catch {
    return { success: false, message: "Impossible de récupérer le profil " };
  }
};

export const logout = async () => {
  await removeToken();
};
