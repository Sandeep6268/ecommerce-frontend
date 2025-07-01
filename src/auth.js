export const isAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  return !!token;
};
