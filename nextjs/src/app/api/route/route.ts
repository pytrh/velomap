// GET /api/route: the JSON endpoint. In Next.js the folder path under src/app
// is the URL, and a file named route.ts exporting a GET function handles GET
// requests to it (the equivalent of a Spring @GetMapping method).
// It runs on the server only, so it can safely use the GraphHopper API key.
import { parseRouteRequest, graphHopperRejected } from "@/lib/route-params";
import { computeRoute } from "@/lib/route-service";

export async function GET(request: Request): Promise<Response> {
  const parsed = parseRouteRequest(new URL(request.url).searchParams);
  if (parsed instanceof Response) return parsed;
  try {
    return Response.json(await computeRoute(parsed));
  } catch (error) {
    return graphHopperRejected(error);
  }
}
