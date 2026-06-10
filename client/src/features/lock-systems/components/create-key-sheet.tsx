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
import { useCreateKey } from "../hooks/use-lock-systems";

const ACCESS_LEVELS = ["Master", "Individual", "Common"] as const;

const schema = z.object({
  label: z.string().min(1, "Label is required"),
  description: z.string().min(1, "Description is required"),
  accessLevel: z.enum(ACCESS_LEVELS),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  /** UUID of the lock system the new key is created in. */
  lockSystemId: string;
  /** Called after a successful creation so the parent can refetch its keys. */
  onCreated: () => void;
};

/**
 * "Add Key" button that opens a slide-over form for creating a key inside
 * the given lock system. Rendered for admins only.
 */
export const CreateKeySheet = ({ lockSystemId, onCreated }: Props) => {
  const [open, setOpen] = useState(false);
  const { create, isLoading, error } = useCreateKey();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", description: "", accessLevel: "Individual" },
  });

  async function onSubmit(values: FormValues) {
    const ok = await create(values.label, values.description, values.accessLevel, lockSystemId);
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
          Add Key
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Key</SheetTitle>
        </SheetHeader>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="px-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.label}>
              <FieldLabel htmlFor="label">Label</FieldLabel>
              <Controller
                control={form.control}
                name="label"
                render={({ field }) => (
                  <Input id="label" placeholder="e.g. A101" {...field} />
                )}
              />
              <FieldError errors={[form.formState.errors.label]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.description}>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Controller
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Input id="description" placeholder="e.g. Main Entrance" {...field} />
                )}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.accessLevel}>
              <FieldLabel>Access Level</FieldLabel>
              <Controller
                control={form.control}
                name="accessLevel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCESS_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.accessLevel]} />
            </Field>
          </FieldGroup>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <SheetFooter className="mt-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create Key"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
