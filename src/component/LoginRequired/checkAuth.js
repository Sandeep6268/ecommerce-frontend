import api from "../../api";

export const checkAuth = async () => {
  try {
    const response = await api.get('check-auth/');
    return response.data.isAuthenticated;
  } catch (error) {
    console.error("Error checking auth:", error);
    return false;
  }
};
