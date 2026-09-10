import { NextRequest, NextResponse } from "next/server";
// NOTE: avoid using the Supabase service-role key on public requests.
// We'll construct a public URL from NEXT_PUBLIC_SUPABASE_URL when available.

const PROD_DOMAIN = "https://rushdapp.vercel.app";

function buildHtml({ title, heading, message, apkUrl }: { title: string; heading: string; message?: string; apkUrl?: string }) {
  const downloadButton = apkUrl
    ? `<a href="${apkUrl}" style="display:inline-block;padding:14px 20px;background:#f97316;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Download APK</a>`
    : `<div style="color:#444;padding:12px;background:#fff3e0;border-radius:8px">APK not available yet. Contact the app admin.</div>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    body{font-family:Inter,system-ui,Arial,Helvetica,sans-serif;background:#fafafa;color:#0f172a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
    .card{max-width:520px;width:92%;background:#fff;padding:28px;border-radius:12px;box-shadow:0 6px 24px rgba(15,23,42,0.06);text-align:center}
    .logo{height:72px;margin-bottom:18px}
    h1{font-size:20px;margin:8px 0 6px}
    p{color:#334155;margin:8px 0 18px}
  </style>
</head>
<body>
  <div class="card">
    <img src="/brand/rushd-icon.png" alt="RushD" class="logo" />
    <h1>${heading}</h1>
    ${message ? `<p>${message}</p>` : ""}
    <div style="margin-top:14px">${downloadButton}</div>
    <div style="margin-top:18px;font-size:13px;color:#64748b">If the button does not start the download, open this page in Chrome on your Android device.</div>
  </div>
</body>
</html>`;
}

export async function GET(request: NextRequest) {
  try {
    // Disallow external redirect/open-redirect query params explicitly
    const forbidden = ["url", "redirect", "next", "target"];
    const reqUrl = new URL(request.url);
    for (const p of forbidden) {
      if (reqUrl.searchParams.has(p)) {
        return NextResponse.json({ error: "External redirect parameters are not allowed." }, { status: 400 });
      }
    }

    const ua = (request.headers.get("user-agent") || "").toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    // iOS: redirect to main site (no direct APK serving for iOS)
    if (isIos) {
      return NextResponse.redirect(PROD_DOMAIN, 302);
    }

    // Resolve APK public URL from server-side configuration only.
    // Use RUSHD_ANDROID_APK_URL as the single authoritative APK destination.
    let apkPublicUrl: string | null = null;
    const configured = process.env.RUSHD_ANDROID_APK_URL;
    if (configured && configured.trim() !== "") {
      try {
        const parsed = new URL(configured);
        // Require HTTPS and disallow unsafe schemes
        if (parsed.protocol !== "https:") {
          console.error("RUSHD_ANDROID_APK_URL must use https:", configured);
          apkPublicUrl = null;
        } else {
          apkPublicUrl = parsed.toString();
        }
      } catch (err) {
        console.error("Invalid RUSHD_ANDROID_APK_URL:", err instanceof Error ? err.message : String(err));
        apkPublicUrl = null;
      }
    } else {
      apkPublicUrl = null;
    }

    // Android: show Android download experience with direct APK link when available
    if (isAndroid) {
      const html = buildHtml({
        title: "RushD — Android Download",
        heading: "Get RushD on Android",
        message: apkPublicUrl
          ? "Tap below to download the official RushD Android APK. Install from this file and follow Android prompts."
          : "The Android APK is not yet available. Please check back later or contact support.",
        apkUrl: apkPublicUrl || undefined,
      });

      return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // Desktop or unknown: show generic download page linking to the APK if available
    const html = buildHtml({
      title: "RushD — Download",
      heading: "Download RushD",
      message: apkPublicUrl
        ? "Use your Android device to scan the QR or open this page in Chrome on your Android device to download the APK. QR encodes https://rushdapp.vercel.app/download."
        : "RushD Android APK is not available yet. The QR points to this page: https://rushdapp.vercel.app/download",
      apkUrl: apkPublicUrl || undefined,
    });

    return new NextResponse(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (err) {
    // Failure fallback
    console.error("GET /download error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
