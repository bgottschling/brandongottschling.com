import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

const handlers = makeRouteHandler({ config });

const guard = (handler: (req: Request) => Promise<Response> | Response) => {
  return (req: Request) => {
    // Local-mode Keystatic writes to the filesystem — dev only.
    if (process.env.NODE_ENV === "production") {
      return new Response("Not found", { status: 404 });
    }
    return handler(req);
  };
};

export const GET = guard(handlers.GET);
export const POST = guard(handlers.POST);
