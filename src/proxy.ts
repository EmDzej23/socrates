import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

async function verifySession(session: string | undefined): Promise<boolean> {
  if (!session || !secretKey) return false;

  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return !!(payload as { isAdmin?: boolean })?.isAdmin;
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path === "/archive/login") {
    return NextResponse.next();
  }

  if (path.startsWith("/archive")) {
    const session = req.cookies.get("admin_session")?.value;
    const isAdmin = await verifySession(session);

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/archive/login", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/archive/:path*"],
};
