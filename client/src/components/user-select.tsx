import { User } from "@/types/user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Props = {
  activeUserId: string;
  setActiveUserId: (id: string) => void;
  demoUsers: User[];
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export const UserSelect = ({
  activeUserId,
  setActiveUserId,
  demoUsers,
}: Props) => {
  const activeUser = demoUsers.find((u) => u.id === activeUserId)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 gap-2 px-2">
          <Avatar size="sm">
            <AvatarFallback>{initials(activeUser.name)}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{activeUser.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Demo user</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={activeUserId}
          onValueChange={(val) => setActiveUserId(val)}
        >
          {demoUsers.map((user) => (
            <DropdownMenuRadioItem key={user.id} value={String(user.id)}>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </span>
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
