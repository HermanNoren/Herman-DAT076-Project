import { createContext, useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User } from "@/types/user";

const demoUsers: User[] = [
  {
    id: "f1a2b3c4-0001-0001-0001-000000000001",
    name: "Alice Admin",
    email: "alice@example.com",
    role: "admin",
    assignedLockSystemIds: [],
  },
  {
    id: "f1a2b3c4-0001-0001-0001-000000000002",
    name: "Ulf User",
    email: "ulf@example.com",
    role: "user",
    assignedLockSystemIds: [],
  },
];

type UserContextValue = {
  user: User;
  setUserId: (id: string) => void;
  demoUsers: User[];
};

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserIdState] = useState(demoUsers[0].id);
  const navigate = useNavigate();
  const location = useLocation();

  const user = demoUsers.find((u) => u.id === userId)!;

  const setUserId = (id: string) => {
    const newUser = demoUsers.find((u) => u.id === id)!;
    if (newUser.role !== "admin" && location.pathname === "/users") {
      navigate("/lock-systems", { replace: true });
    }
    setUserIdState(id);
  };

  return (
    <UserContext.Provider value={{ user, setUserId, demoUsers }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};
