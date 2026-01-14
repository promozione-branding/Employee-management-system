import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET
);

export async function getAuthUser(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      _id: payload.id, // IMPORTANT: must exist in token
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
}
