import api from "./api";

export interface UserProfile {
  name: string;
  email: string;

  skills: string[];

  experience: {
    years: number;
    roles: string[];
  };

  education: {
    degree: string;
    field: string;
  };

  location: {
    city: string;
    country: string;
  };

  preferences: {
    jobTypes: string[];
    workModes: string[];
    remoteScope: string;
  };
}

// =========================
// GET PROFILE
// =========================
export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/profile");

  return response.data.profile;
};

// =========================
// UPDATE PROFILE
// =========================
export const updateProfile = async (
  profile: Omit<UserProfile, "name" | "email">
): Promise<UserProfile> => {
  const response = await api.put("/profile", profile);

  return response.data.profile;
};