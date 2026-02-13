import { cookies } from "next/headers";

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(
  idToken: string,
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();

  cookieStore.set("ll_id_token", idToken, {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: 60 * 60, // 1 hour
  });

  cookieStore.set("ll_access_token", accessToken, {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: 60 * 60, // 1 hour
  });

  cookieStore.set("ll_refresh_token", refreshToken, {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function getAuthCookies() {
  const cookieStore = await cookies();

  return {
    idToken: cookieStore.get("ll_id_token")?.value,
    accessToken: cookieStore.get("ll_access_token")?.value,
    refreshToken: cookieStore.get("ll_refresh_token")?.value,
  };
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.set("ll_id_token", "", {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: 0,
  });
  cookieStore.set("ll_access_token", "", {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: 0,
  });
  cookieStore.set("ll_refresh_token", "", {
    ...TOKEN_COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split(".")[1];
  const decoded = Buffer.from(payload, "base64url").toString("utf-8");
  return JSON.parse(decoded);
}
