import User from "../models/user";
import { ParsedResumeData } from "./resumeParser.service";

export const syncResumeWithUserProfile = async (
  userId: string,
  parsedData: ParsedResumeData
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Update skills only when the resume actually contains skills.
  if (parsedData.skills.length > 0) {
    user.profile.skills = parsedData.skills;
  }

  // Update roles only when the resume contains detected roles.
  if (parsedData.experience.roles.length > 0) {
    user.profile.experience.roles = parsedData.experience.roles;
  }

  // Do NOT overwrite existing experience with 0 when
  // the resume does not provide an explicit experience duration.
  if (parsedData.experience.years > 0) {
    user.profile.experience.years = parsedData.experience.years;
  }

  // Update education only when the parser found actual values.
  if (parsedData.education.degree) {
    user.profile.education.degree = parsedData.education.degree;
  }

  if (parsedData.education.field) {
    user.profile.education.field = parsedData.education.field;
  }

  // Location and preferences intentionally remain unchanged.
  // They are not reliably available from the current resume parser.

  await user.save();

  return user.profile;
};