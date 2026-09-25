import { assertDemoModeAllowed } from "./src/lib/demoMode.ts";

// Fail the process at startup (next build / next start) rather than letting a
// production deployment come up with passwordless demo sign-in enabled.
assertDemoModeAllowed(process.env);

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * script-src carries 'unsafe-inline' because the pages here are statically
 * prerendered: Next emits inline bootstrap/RSC-payload scripts into HTML built
 * at compile time, so there is no per-request nonce to stamp onto them. The
 * policy still pins script/style/img/font/connect to this origin, blocks
 * plugins and framing, and locks base-uri and form-action.
 *
 * To upgrade to nonce + 'strict-dynamic' (which would also stop inline-script
 * injection), the page routes must opt into dynamic rendering
 * (`export const dynamic = "force-dynamic"`), then the nonce can be issued from
 * middleware. See SECURITY.md.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // Entra ID sign-in and Microsoft Graph.
  "connect-src 'self' https://login.microsoftonline.com https://graph.microsoft.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://login.microsoftonline.com",
  "base-uri 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** Headers applied to every response. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // HSTS: 2 years, including subdomains, preload-eligible.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Defence in depth for browsers that predate CSP frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()", "autoplay=()", "camera=()", "display-capture=()",
      "encrypted-media=()", "fullscreen=(self)", "geolocation=()", "gyroscope=()",
      "magnetometer=()", "microphone=()", "midi=()", "payment=()",
      "picture-in-picture=()", "usb=()", "xr-spatial-tracking=()",
    ].join(", "),
  },
  // This app renders no cross-origin isolated content and exposes no APIs to
  // other origins; keep browsing-context and resource sharing closed.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework version.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
