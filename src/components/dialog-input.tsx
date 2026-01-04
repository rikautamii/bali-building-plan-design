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
  sideFootLength: z.coerce.number().min(1),
  landLength: z.coerce.number().min(1), 
  landWidth: z.coerce.number().min(1),
  gateDirection: z.enum(["Utara", "Timur", "Selatan", "Barat"]),
  landOrientation: z.enum(["Bali Utara", "Bali Selatan"]),
});

export default function DialogInput({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (footLength: number, sideFootLength: number, landLength: number, landWidth: number, gateDirection: "Utara" | "Timur" | "Selatan" | "Barat", landOrientation: "Bali Utara" | "Bali Selatan") => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      footLength: 26,
      sideFootLength: 10,
      landLength: 10,
      landWidth: 11,
      gateDirection: "Utara",
      landOrientation: "Bali Utara",
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
              onSubmit(values.footLength, values.sideFootLength, values.landLength, values.landWidth, values.gateDirection, values.landOrientation)
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

            <FormField
              control={form.control}
              name="sideFootLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lebar Telapak Kaki (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="landLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Panjang Lahan (m)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="landWidth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lebar Lahan (m)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gateDirection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gate Direction</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border rounded p-2 w-full"
                    >
                      <option value="Utara">Utara</option>
                      <option value="Timur">Timur</option>
                      <option value="Selatan">Selatan</option>
                      <option value="Barat">Barat</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="landOrientation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Direction</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border rounded p-2 w-full"
                    >
                      <option value="Bali Utara">Bali Utara</option>
                      <option value="Bali Selatan">Bali Selatan</option>
                    </select>
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
