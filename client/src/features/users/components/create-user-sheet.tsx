import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateUser } from "../hooks/use-users";

const USER_ROLES = ["admin", "user"] as const;

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").check(z.email("Invalid email address")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(USER_ROLES),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  /** Called after a successful creation so the parent can refetch its list. */
  onCreated: () => void;
};

/**
 * "Add User" button that opens a slide-over form for creating a user
 * account (name, email, password and role). Admins set all credentials —
 * there is no self-registration.
 */
export const CreateUserSheet = ({ onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const { create, isLoading, error } = useCreateUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "user" },
  });

  async function onSubmit(values: FormValues) {
    const ok = await create(values.name, values.email, values.password, values.role);
    if (ok) {
      onCreated();
      setOpen(false);
      form.reset();
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <PlusIcon className="size-4" />
          Add User
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add User</SheetTitle>
        </SheetHeader>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="px-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input id="name" placeholder="e.g. Erik Eriksson" {...field} />
                )}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <Input id="email" type="email" placeholder="e.g. erik@example.com" {...field} />
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
                  <Input id="password" type="password" placeholder="Min. 8 characters" {...field} />
                )}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.role}>
              <FieldLabel>Role</FieldLabel>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.role]} />
            </Field>
          </FieldGroup>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <SheetFooter className="mt-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
