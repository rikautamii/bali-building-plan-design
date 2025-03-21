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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
  footLength: z.coerce.number().min(1),
  sideFootLength: z.coerce.number().min(1),
  landLength: z.coerce.number().min(1),
  landWidth: z.coerce.number().min(1),
  landDirection: z.enum(["Utara", "Selatan", "Timur", "Barat"]),
  landOrientation: z.enum(["Bali Utara", "Bali Selatan"]),
});

export default function DialogInput({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (footLength: number, sideFootLength: number, landLength: number, landWidth: number, landDirection: string, landOrientation: string) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      footLength: 25,
      sideFootLength: 10,
      landLength: 10,
      landWidth: 10,
      landDirection: "Utara",
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
              onSubmit(values.footLength, values.sideFootLength, values.landLength, values.landWidth, values.landDirection, values.landOrientation)
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
              render={({field}) => (
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
              render={({field}) => (
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
              render={({field}) => (
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
              name="landDirection"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Arah Lahan</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Arah Lahan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Utara">Utara</SelectItem>
                        <SelectItem value="Selatan">Selatan</SelectItem>
                        <SelectItem value="Timur">Timur</SelectItem>
                        <SelectItem value="Barat">Barat</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="landOrientation"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Orientasi Lahan</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Orientasi Lahan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bali Utara">Bali Utara</SelectItem>
                        <SelectItem value="Bali Selatan">Bali Selatan</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
