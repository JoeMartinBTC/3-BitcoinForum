import { z } from "zod";

export const eventTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number(),
  color: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export type EventTemplate = z.infer<typeof eventTemplateSchema>;

export const exportEventTemplates = (eventTypes: EventTemplate[]) => {
  const blob = new Blob(
    [
      JSON.stringify(
        eventTypes.map((e) => {
          const { key, ...values } = e;
          return values;
        }),
      ),
    ],
    {
      type: "application/json",
    },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "event-templates.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importEventTemplates = async (file: File) => {
  try {
    const text = await file.text();
    const templates = JSON.parse(text);

    // Validate the imported data structure
    if (!Array.isArray(templates)) {
      throw new Error("Invalid template format: must be an array");
    }

    for (const template of templates) {
      if (!eventTemplateSchema.safeParse(template).success) {
        throw new Error("Invalid template data structure");
      }
    }

    return templates;
  } catch (error) {
    console.error("Failed to import templates:", error);
    return false;
  }
};
