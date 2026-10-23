// lib/withAudit.js
import { auditContext } from "./auditContext";
import { getAuthUser } from "./getAuthUser";

export function withAudit(handler) {
  return async (req, ...args) => {
    const user = await getAuthUser(req);
    // Wrap the route execution in the context
    return auditContext.run({ user, req }, () => handler(req, ...args));
  };
}
