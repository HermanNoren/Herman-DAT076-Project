import { Aperture } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

export const LoginPage = () => {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Aperture strokeWidth={1.5} className="size-6" />
          <span className="text-lg font-semibold">Keymaster</span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};
