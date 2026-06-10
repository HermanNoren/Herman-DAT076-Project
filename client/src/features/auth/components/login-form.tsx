import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useLogin } from "../hooks/use-login";

/** Client-side validation: both fields must be filled in before submitting. */
const schema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

/**
 * Email + password login form. Field-level errors come from zod validation;
 * server-side failures (wrong credentials) are rendered below the fields.
 * On success, {@link useLogin} redirects into the app.
 */
export const LoginForm = () => {
  const { login, isLoading, error } = useLogin();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    await login(values.email, values.password);
  }

  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter your credentials to continue
      </p>

      <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
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

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </>
  );
};
