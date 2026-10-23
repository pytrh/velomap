// GET /api/route/gpx: same parameters as /api/route, but answers with a .gpx
// file. Content-Disposition: attachment makes the browser save it instead of
// displaying it.
import { parseRouteRequest, graphHopperRejected } from "@/lib/route-params";
import { computeGpx } from "@/lib/route-service";

export async function GET(request: Request): Promise<Response> {
  const parsed = parseRouteRequest(new URL(request.url).searchParams);
  if (parsed instanceof Response) return parsed;
  try {
    return new Response(await computeGpx(parsed), {
      headers: {
        "Content-Type": "application/gpx+xml",
        "Content-Disposition": 'attachment; filename="velomap-route.gpx"',
      },
    });
  } catch (error) {
    return graphHopperRejected(error);
  }
}
