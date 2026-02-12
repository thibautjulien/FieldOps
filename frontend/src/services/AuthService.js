import axios from "axios";

const API_URL = "http://10.0.2.2:3000";

export const login = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    return { success: true, data: response.data, message: null };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return {
        success: false,
        message: "Identifiants incorrects",
      };
    }

    if (axios.isAxiosError(err) && err.response?.status === 400) {
      return {
        success: false,
        message: "Email ou mot de passe manquant",
      };
    }

    return {
      success: false,
      message: "Erreur serveur, reessayez plus tard",
    };
  }
};
