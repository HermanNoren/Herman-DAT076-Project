import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateLockSystem } from "../hooks/use-lock-systems";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  /** Called after a successful creation so the parent can refetch its list. */
  onCreated: () => void;
};

/**
 * "Add Lock System" button that opens a slide-over form for creating a
 * lock system. Rendered for admins only.
 */
export const CreateLockSystemSheet = ({ onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const { create, isLoading, error } = useCreateLockSystem();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(values: FormValues) {
    const ok = await create(values.name, values.description);
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
          Add Lock System
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Lock System</SheetTitle>
        </SheetHeader>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="px-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Input id="name" placeholder="e.g. Storgatan 12" {...field} />
                )}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Input id="description" placeholder="e.g. Master System" {...field} />
                )}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>
          </FieldGroup>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <SheetFooter className="mt-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Lock System"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
