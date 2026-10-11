import { createServerFn } from "@tanstack/react-start";

import { loadCatalog } from "../load-catalog.server";

export const getRootMessages = createServerFn({ method: "GET" }).handler(() => loadCatalog("__root"));
