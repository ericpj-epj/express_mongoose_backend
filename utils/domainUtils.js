import Organization from "../model/organizationsModel.js";

export async function findOrgByEmailDomain(email) {
  const domain = getEmailDomain(email);
  if (!domain) return null;

  const data = await Organization.findOne({
    allowed_domains: { $in: [domain] },
  });
  return data || null;
}

function getEmailDomain(email) {
  try {
    return email.split("@")[1].toLowerCase();
  } catch {
    return "";
  }
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email || "");
}
