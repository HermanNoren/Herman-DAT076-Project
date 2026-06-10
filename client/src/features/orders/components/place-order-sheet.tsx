import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShoppingCart } from "lucide-react";
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
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Key } from "@/types/key";
import { LockSystem } from "@/types/lock-system";
import { OrderReason } from "@/types/order";
import { usePlaceOrder } from "../hooks/use-orders";

const ORDER_REASONS: { value: OrderReason; label: string }[] = [
  { value: "lost", label: "Lost" },
  { value: "damaged", label: "Damaged" },
  { value: "additional_copy", label: "Additional copy" },
  { value: "stolen", label: "Stolen" },
  { value: "other", label: "Other" },
];

const schema = z
  .object({
    quantity: z.number().int().min(1, "At least 1"),
    reason: z.enum(["lost", "damaged", "additional_copy", "stolen", "other"] as const),
    reasonDetail: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.reason === "other" && !data.reasonDetail?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify the reason",
        path: ["reasonDetail"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  /** The key being ordered. */
  keyItem: Key;
  /** The system the key belongs to (shown in the sheet header). */
  lockSystem: LockSystem;
};

/**
 * "Order" button that opens a slide-over form for ordering copies of a
 * key. The "Please specify" field only appears when the reason is "Other".
 */
export const PlaceOrderSheet = ({ keyItem, lockSystem }: Props) => {
  const [open, setOpen] = useState(false);
  const { place, isLoading, error } = usePlaceOrder();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, reason: "lost", reasonDetail: "" },
  });

  const watchedReason = form.watch("reason");

  async function onSubmit(values: FormValues) {
    const ok = await place(
      keyItem.id,
      values.quantity,
      values.reason,
      values.reason === "other" ? values.reasonDetail : undefined,
    );
    if (ok) {
      setOpen(false);
      form.reset();
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ShoppingCart className="h-3.5 w-3.5" />
          Order
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Order Key</SheetTitle>
          <SheetDescription>
            {keyItem.label} · {lockSystem.name}
          </SheetDescription>
        </SheetHeader>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="px-4">
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.quantity}>
              <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
              <Controller
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError errors={[form.formState.errors.quantity]} />
            </Field>

            <Field data-invalid={!!form.formState.errors.reason}>
              <FieldLabel>Reason</FieldLabel>
              <Controller
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_REASONS.map(({ value, label }) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[form.formState.errors.reason]} />
            </Field>

            {watchedReason === "other" && (
              <Field data-invalid={!!form.formState.errors.reasonDetail}>
                <FieldLabel htmlFor="reasonDetail">Please specify</FieldLabel>
                <Controller
                  control={form.control}
                  name="reasonDetail"
                  render={({ field }) => (
                    <Input id="reasonDetail" placeholder="Describe the reason…" {...field} />
                  )}
                />
                <FieldError errors={[form.formState.errors.reasonDetail]} />
              </Field>
            )}
          </FieldGroup>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <SheetFooter className="mt-6">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Placing order…" : "Place Order"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
