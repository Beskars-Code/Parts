import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./services/auth/component";

const http = httpRouter();
authComponent.registerRoutes(http, createAuth);
export default http;
