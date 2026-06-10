/**
 * A master key system installed at a property (e.g. an apartment building).
 * Mirrors the server model.
 */
export interface LockSystem {
  /** Unique identifier (UUID). */
  id: string;
  /** Human-friendly code used in URLs, e.g. "SYS-001". */
  referenceCode: string;
  /** Display name, typically the property address, e.g. "Storgatan 12". */
  name: string;
  /** Free-text description of the installation. */
  description: string;
}
