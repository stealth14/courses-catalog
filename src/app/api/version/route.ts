import { APP_VERSION } from "@/lib/app-version";

// Must reflect the deployment answering the request, never a cached payload.
export const dynamic = "force-dynamic";

/**
 * Version of the deployment currently serving requests. Browsers poll this
 * and reload when it differs from the version baked into their bundle.
 */
export function GET() {
  return Response.json(
    { version: APP_VERSION },
    { headers: { "cache-control": "no-store, max-age=0, must-revalidate" } }
  );
}
