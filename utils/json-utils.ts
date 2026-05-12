import type { Slide } from "@/types/editor"

export interface PresentationData {
  title: string
  slides: Slide[]
  version: string
}

/**
 * Exports presentation data to a JSON file
 */
export function exportToJson(title: string, slides: Slide[]): void {
  // Create the presentation data object
  const presentationData: PresentationData = {
    title,
    slides,
    version: "1.0.0", // For future compatibility checks
  }

  // Convert to JSON string
  const jsonString = JSON.stringify(presentationData, null, 2)

  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: "application/json" })

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Create a link element to trigger the download
  const link = document.createElement("a")
  link.href = url
  link.download = `positron-${title.replace(/\s+/g, "-").toLowerCase()}.json`

  // Trigger the download
  document.body.appendChild(link)
  link.click()

  // Clean up
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Validates imported presentation data
 */
function validatePresentationData(data: any): data is PresentationData {
  return (
    data &&
    typeof data === "object" &&
    typeof data.title === "string" &&
    Array.isArray(data.slides) &&
    data.slides.length > 0 &&
    typeof data.version === "string"
  )
}

/**
 * Imports presentation data from a JSON file
 */
export async function importFromJson(file: File): Promise<PresentationData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          throw new Error("Failed to read file")
        }

        const jsonData = JSON.parse(event.target.result as string)

        if (!validatePresentationData(jsonData)) {
          throw new Error("Invalid presentation data format")
        }

        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}
