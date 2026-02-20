import jwt from "jsonwebtoken";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "cpgradar";
const JWT_EXPIRATION_HOURS = parseInt(process.env.JWT_EXPIRATION_HOURS) || 24;

export function generateJwt(member) {
  const payload = {
    sub: member.email,
    member_id: member._id.toString(),
    organization_id: member.organization_id?.toString() || null,
    email: member.email,
    role: member.role || "member",
    exp: Math.floor(Date.now() / 1000) + JWT_EXPIRATION_HOURS * 60 * 60,
  };

  return jwt.sign(payload, JWT_SECRET_KEY, { algorithm: "HS256" });
}
