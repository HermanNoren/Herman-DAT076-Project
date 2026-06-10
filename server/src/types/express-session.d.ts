import "express-session";

/** Module augmentation: declares the data this app stores on the session. */
declare module "express-session" {
  interface SessionData {
    /** UUID of the logged-in user. Absent when not logged in. */
    userId?: string;
  }
}
