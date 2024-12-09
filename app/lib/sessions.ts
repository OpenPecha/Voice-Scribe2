import { createCookieSessionStorage } from "@remix-run/node";

let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "my-session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // only set the cookie in https in production
  },
});

export function getSession(cookieHeader: string) {
  return sessionStorage.getSession(cookieHeader);
}

export function commitSession(session: any) {
  return sessionStorage.commitSession(session);
}

export function destroySession(session: any) {
  return sessionStorage.destroySession(session);
}
