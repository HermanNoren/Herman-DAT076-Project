import { Link, useLocation } from "react-router-dom";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

/** Display labels for known URL segments; unknown segments (e.g. "SYS-001") are shown as-is. */
const routeLabels: Record<string, string> = {
  "lock-systems": "Lock Systems",
  orders: "Orders",
  users: "Users",
};

/**
 * Maps a URL segment to its breadcrumb label.
 *
 * @param segment - One path segment, e.g. "orders" or "SYS-001".
 * @returns The label to render in the breadcrumb.
 */
function segmentLabel(segment: string): string {
  return routeLabels[segment] ?? segment;
}

/** Top bar with the sidebar toggle and breadcrumbs derived from the current URL. */
export const AppHeader = () => {
  const { pathname } = useLocation();

  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 py-6">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink asChild>
              <Link to="/">Keymaster</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const href = "/" + segments.slice(0, index + 1).join("/");
            return (
              <span key={href} className="contents">
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{segmentLabel(segment)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="hidden md:block">
                      <Link to={href}>{segmentLabel(segment)}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
};
