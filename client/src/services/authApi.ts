import api from "./api";

const API_URL = "/auth";

export const signupUser = async (
  name: string,
  email: string,
  password: string
) => {
  const response = await api.post(`${API_URL}/signup`, {
    name,
    email,
    password,
  });

  return response.data;
};

export const loginUser = async (
  email: string,
  password: string
) => {
  const response = await api.post(`${API_URL}/login`, {
    email,
    password,
  });

  return response.data;
};