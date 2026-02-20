import Organization from "../model/organizationsModel.js";

export async function findOrgByEmailDomain(email) {
  const domain = getEmailDomain(email);
  console.log("Looking for organization with domain:", domain);
  if (!domain) return null;
  console.log(
    Organization.findOne({
      allowed_domains: domain,
    }),
  );
  return Organization.findOne({
    allowed_domains: domain,
  });
}

function getEmailDomain(email) {
  try {
    return email.split("@")[1].toLowerCase().trim();
  } catch {
    return "";
  }
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email || "");
}
