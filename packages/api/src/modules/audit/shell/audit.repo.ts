import type { Database } from "@avuny/db"
import { auditEvents } from "@avuny/db"
import type { WriteAuditEventInput } from "../core/audit.types.js"

/**
 * Writes a single audit event row.
 *
 * Rules (D13):
 * - Call this inside the same transaction as the state change it records.
 *   For failures, call it standalone.
 * - Never pass passwords, codes, tokens or raw identifiers of unknown users.
 * - audit_events has no foreign keys: rows outlive users, sessions and identifiers.
 *
 * @param db - The database connection or transaction. Pass the transaction instance when
 *   recording an event inside a transaction so it is atomic with the state change.
 */
export async function writeAuditEvent(
  db: Database,
  input: WriteAuditEventInput
): Promise<void> {
  await db.insert(auditEvents).values({
    eventType: input.eventType,
    outcome: input.outcome,
    actorUserId: input.actorUserId,
    subjectUserId: input.subjectUserId,
    sessionId: input.sessionId,
    identifierHmac: input.identifierHmac,
    // inet columns in drizzle accept string; cast via unknown for the TS type
    ipAddress: input.ipAddress as unknown as undefined,
    userAgent: input.userAgent,
    requestId: input.requestId,
    metadata: input.metadata ?? {},
  })
}
