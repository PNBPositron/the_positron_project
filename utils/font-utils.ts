/**
 * Loads a custom font from a file and makes it available for use in the editor
 * @param file The font file (ttf, otf, woff, woff2)
 * @param fontName A name to identify the font
 * @returns The font family name that can be used in CSS
 */
export async function loadCustomFont(file: File, fontName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a unique font family name
      const fontFamily = `custom-font-${fontName}-${Date.now()}`

      // Create a FileReader to read the font file
      const reader = new FileReader()

      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error("Failed to read font file"))
          return
        }

        // Create a style element to inject the @font-face rule
        const style = document.createElement("style")
        style.textContent = `
          @font-face {
            font-family: "${fontFamily}";
            src: url("${event.target.result}") format("${getFontFormat(file.name)}");
            font-weight: normal;
            font-style: normal;
          }
        `

        // Add the style element to the document head
        document.head.appendChild(style)

        // Create a preload element to start loading the font
        const preloadLink = document.createElement("link")
        preloadLink.rel = "preload"
        preloadLink.href = event.target.result as string
        preloadLink.as = "font"
        preloadLink.type = `font/${getFontFormat(file.name)}`
        preloadLink.crossOrigin = "anonymous"

        document.head.appendChild(preloadLink)

        // Resolve with the font family name
        resolve(fontFamily)
      }

      reader.onerror = () => {
        reject(new Error("Error reading font file"))
      }

      // Read the file as a data URL
      reader.readAsDataURL(file)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Determines the font format based on the file extension
 */
function getFontFormat(filename: string): string {
  const extension = filename.split(".").pop()?.toLowerCase()

  switch (extension) {
    case "ttf":
      return "truetype"
    case "otf":
      return "opentype"
    case "woff":
      return "woff"
    case "woff2":
      return "woff2"
    default:
      return "truetype" // Default to truetype
  }
}
