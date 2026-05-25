import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Aperture } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/context/auth-context";

const schema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    const error = await login(values.email, values.password);
    if (error) {
      form.setError("root", { message: error });
    } else {
      navigate("/lock-systems", { replace: true });
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <Aperture strokeWidth={1.5} className="size-6" />
          <span className="text-lg font-semibold">Keymaster</span>
        </div>

        <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Enter your credentials to continue
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Controller
                control={form.control}
                name="password"
                render={({ field }) => (
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
          </FieldGroup>

          {form.formState.errors.root && (
            <p className="mt-4 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
};
