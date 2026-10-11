import { createServerFn } from "@tanstack/react-start";

import { loadCatalog } from "../load-catalog.server";

export const getHomeMessages = createServerFn({ method: "GET" }).handler(() => loadCatalog("index"));
