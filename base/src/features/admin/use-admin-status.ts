import * as Effect from "effect/Effect";
import { useState } from "react";

import { AdminService } from "../../../services/admin/service";
import { useServiceRequest } from "../../services/application/use-service-request";

import type { Principal } from "../../../services/auth/access";

export function useAdminStatus() {
	const [principal, setPrincipal] = useState<Principal | null>(null);
	const request = useServiceRequest();
	const load = () => {
		setPrincipal(null);
		request.run(AdminService.pipe(Effect.flatMap(admin => admin.overview)), value => { setPrincipal(value); });
	};
	return { principal, load, ...request };
}
