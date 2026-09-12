export const createJobDuplicateKey = (
  company: string,
  title: string,
  city: string | null
) => {
  return [
    company,
    title,
    city || "",
  ]
    .map((value) =>
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    )
    .filter(Boolean)
    .join("-");
};