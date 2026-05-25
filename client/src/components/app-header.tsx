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
import { useUser } from "@/context/user-context";
import { UserSelect } from "./user-select";

const routeLabels: Record<string, string> = {
  "lock-systems": "Lock Systems",
  orders: "Orders",
  users: "Users",
};

function segmentLabel(segment: string): string {
  return routeLabels[segment] ?? segment;
}

export const AppHeader = () => {
  const { pathname } = useLocation();
  const { user, setUserId, demoUsers } = useUser();

  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
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

      <div className="ml-auto flex items-center gap-3">
        <UserSelect
          activeUserId={user.id}
          setActiveUserId={setUserId}
          demoUsers={demoUsers}
        />
      </div>
    </header>
  );
};
