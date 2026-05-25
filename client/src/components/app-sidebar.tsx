"use client";

import * as React from "react";
import { NavLink } from "react-router-dom";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Aperture, KeyRound, ShoppingCart, Users } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useUser } from "@/context/user-context";

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { title: "Lock Systems", url: "/lock-systems", icon: KeyRound },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Users", url: "/users", icon: Users, adminOnly: true },
];

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const { user } = useUser();

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || user.role === "admin",
  );

  const navUser = {
    name: user.name,
    subtitle: user.role.charAt(0).toUpperCase() + user.role.slice(1),
    avatar: "",
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <NavLink to="/lock-systems">
                <Aperture strokeWidth={1.5} className="size-5!" />
                <span className="text-base">Keymaster</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
    </Sidebar>
  );
};
