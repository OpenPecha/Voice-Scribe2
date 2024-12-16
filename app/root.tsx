import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { Toaster } from "react-hot-toast";

import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Permissions-Policy" content="microphone=(self)"></meta>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Toaster position="top-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext
) {
  responseHeaders.set(
    "Permissions-Policy", 
    "microphone=(self 'https://voice-scribe.onrender.com')"
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  );
}
