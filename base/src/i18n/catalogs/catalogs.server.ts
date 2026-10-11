import english from "./en.server";

import type { Locale } from "../config";

const catalogs: Record<Locale, typeof english> = { en: english };

export default catalogs;
