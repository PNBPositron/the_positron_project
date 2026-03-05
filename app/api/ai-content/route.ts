import { generateText, Output } from "ai"
import { z } from "zod"

export async function POST(req: Request) {
  const { prompt, type } = await req.json()

  if (type === "slide-content") {
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system:
        "You are a presentation design expert. Generate compelling, concise slide content. Return structured JSON for presentation slides. Keep text brief and impactful - bullet points should be 5-8 words max, titles 3-6 words.",
      prompt,
      output: Output.object({
        schema: z.object({
          title: z.string().describe("A short, impactful slide title"),
          subtitle: z.string().nullable().describe("Optional subtitle"),
          bullets: z
            .array(z.string())
            .describe("3-5 concise bullet points"),
          speakerNotes: z
            .string()
            .nullable()
            .describe("Brief speaker notes for the presenter"),
        }),
      }),
    })

    return Response.json({ content: result.output })
  }

  if (type === "rewrite") {
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system:
        "You are a writing expert. Rewrite the given text to be more professional, concise, and impactful. Return only the rewritten text, nothing else.",
      prompt: `Rewrite this text: "${prompt}"`,
    })

    return Response.json({ content: result.text })
  }

  if (type === "layout-suggest") {
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system:
        "You are a presentation layout expert. Suggest a layout for the given topic. Return structured JSON.",
      prompt,
      output: Output.object({
        schema: z.object({
          slideCount: z.number().describe("Recommended number of slides"),
          slides: z.array(
            z.object({
              title: z.string(),
              layout: z
                .string()
                .describe("Layout type: title-only, title-bullets, image-text, comparison, quote, stats"),
              description: z.string().describe("Brief description of what this slide should contain"),
            })
          ),
        }),
      }),
    })

    return Response.json({ content: result.output })
  }

  if (type === "expand-topic") {
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system:
        "You are a presentation content expert. Generate a full set of slide contents for a presentation topic. Keep text concise and presentation-ready. Return structured JSON.",
      prompt: `Create presentation content for: "${prompt}"`,
      output: Output.object({
        schema: z.object({
          presentationTitle: z.string(),
          slides: z.array(
            z.object({
              title: z.string(),
              elements: z.array(
                z.object({
                  type: z.enum(["text", "heading"]),
                  content: z.string(),
                })
              ),
            })
          ),
        }),
      }),
    })

    return Response.json({ content: result.output })
  }

  return Response.json({ error: "Unknown type" }, { status: 400 })
}
