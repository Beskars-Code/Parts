import { useContext } from "react";

import { ApplicationContext } from "./application-context";

export function useApplication() {
	return useContext(ApplicationContext);
}
