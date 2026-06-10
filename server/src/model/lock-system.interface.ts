/**
 * A master key system installed at a property (e.g. an apartment building).
 * Groups the keys that belong to that installation.
 */
export interface LockSystem {
  /** Unique identifier (UUID). */
  id: string;
  /** Human-friendly code used in URLs, e.g. "SYS-001". Unique. */
  referenceCode: string;
  /** Display name, typically the property address, e.g. "Storgatan 12". */
  name: string;
  /** Free-text description of the installation. */
  description: string;
}
