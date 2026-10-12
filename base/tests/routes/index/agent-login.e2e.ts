import { test } from "@e2e-dev/web";
import { expect } from "e2e";

import { authenticateAgent } from "../../support/auth/agent-login";

/**
Why: API login alone does not prove that the browser receives a usable session.
What: The guarded development agent login reaches its authenticated workspace.
How: Import the real agent session, open the root route, and check identity and Sign out.
*/
test("the development agent reaches its authenticated workspace", async ({ app, browser, screen }) => {
	await authenticateAgent(browser);
	await app.open("/");
	await expect(screen.getByText("cloud-agent@localhost")).toBeVisible();
	await expect(screen.getByRole("button", "Sign out")).toBeVisible();
});
