"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDocumentStore } from "@/stores/document";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Textarea } from "./ui/textarea";
import { renderToStaticMarkup } from "react-dom/server";
import { Format01 } from "@/templates/format01";
import { generatePDF } from "@/lib/pdf-generator";

const schema = z.object({
  vision: z.string().min(1, "Required"),
  mission: z.string().min(1, "Required"),
});

export function RightPanel() {
  const {
    vision,
    mission,
    setMission,
    institutionCode,
    institutionName,
    setVision,
  } = useDocumentStore((s) => s);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      mission,
      vision,
    },
    values: {
      mission,
      vision,
    },
  });

  async function onSubmit() {}

  // async function exportToPDF() {
  //   const html = renderToStaticMarkup(
  //     <Format01
  //       data={{ code: institutionCode, institutionName, mission, vision }}
  //     />,
  //   );
  //   const pdf = await generatePDF(html);
  //   const blob = new Blob([pdf], { type: "application/pdf" });

  //   const url = URL.createObjectURL(blob);

  //   window.open(url);
  // }

  return (
    <Form {...form}>
      <Sidebar side="right" className="w-sm">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem className="flex justify-between items-center">
                <h2 className="font-semibold">Edit panel</h2>

                <div className="space-x-2">
                  <Button
                    // onClick={() => exportToPDF()}
                    size={"xs"}
                    variant={"outline"}
                  >
                    Export as PDF
                  </Button>
                  <Button size={"xs"}>Save</Button>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarGroup className="px-3.5">
            <SidebarMenu className="space-y-3">
              <SidebarMenuItem>
                <FormField
                  {...form.control}
                  name="vision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vision</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          onChange={(e) => setVision(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SidebarMenuItem>

              <SidebarMenuItem>
                <FormField
                  {...form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          onChange={(e) => setMission(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </form>
      </Sidebar>
    </Form>
  );
}
