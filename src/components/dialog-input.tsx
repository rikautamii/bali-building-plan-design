import React from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const formSchema = z.object({
  footLength: z.coerce.number().min(1),
});

export default function DialogInput({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (footLength: number) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      footLength: 26,
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
      }}
    >
      <DialogContent className="flex flex-col ">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values: z.infer<typeof formSchema>) =>
              onSubmit(values.footLength)
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="footLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panjang Telapak Kaki (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="flex ml-auto" type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
