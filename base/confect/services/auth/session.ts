import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { toPrincipal } from "./principal";
import { SessionSource, AccessServiceLive } from "../../../services/auth/access";
import { CurrentUser } from "../../middleware/requireuser.spec";

const SessionSourceLive = Layer.effect(SessionSource, CurrentUser.pipe(Effect.map(
	({ user }) => ({ current: Effect.succeed(toPrincipal(user)) }))));

export const AccessLive = AccessServiceLive.pipe(Layer.provide(SessionSourceLive));
