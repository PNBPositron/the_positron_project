import { NextResponse } from "next/server"

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

interface UnsplashPhoto {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
    links: {
      html: string
    }
  }
  links: {
    html: string
    download_location: string
  }
  width: number
  height: number
  color: string
}

interface UnsplashSearchResponse {
  total: number
  total_pages: number
  results: UnsplashPhoto[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "20"
  const orientation = searchParams.get("orientation") || "landscape"

  if (!UNSPLASH_ACCESS_KEY) {
    return NextResponse.json(
      { error: "Unsplash API key not configured" },
      { status: 500 }
    )
  }

  if (!query) {
    // Return curated photos if no query
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos?page=${page}&per_page=${perPage}&order_by=popular`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`)
      }

      const photos: UnsplashPhoto[] = await response.json()

      return NextResponse.json({
        total: 1000,
        total_pages: 50,
        results: photos.map((photo) => ({
          id: photo.id,
          urls: photo.urls,
          alt: photo.alt_description || photo.description || "Unsplash image",
          photographer: photo.user.name,
          photographerUrl: photo.user.links.html,
          downloadUrl: photo.links.download_location,
          width: photo.width,
          height: photo.height,
          color: photo.color,
        })),
      })
    } catch (error) {
      console.error("Unsplash API error:", error)
      return NextResponse.json(
        { error: "Failed to fetch images from Unsplash" },
        { status: 500 }
      )
    }
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=${orientation}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data: UnsplashSearchResponse = await response.json()

    return NextResponse.json({
      total: data.total,
      total_pages: data.total_pages,
      results: data.results.map((photo) => ({
        id: photo.id,
        urls: photo.urls,
        alt: photo.alt_description || photo.description || "Unsplash image",
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        downloadUrl: photo.links.download_location,
        width: photo.width,
        height: photo.height,
        color: photo.color,
      })),
    })
  } catch (error) {
    console.error("Unsplash API error:", error)
    return NextResponse.json(
      { error: "Failed to search images on Unsplash" },
      { status: 500 }
    )
  }
}

// Track download for Unsplash attribution
export async function POST(request: Request) {
  const { downloadUrl } = await request.json()

  if (!UNSPLASH_ACCESS_KEY || !downloadUrl) {
    return NextResponse.json({ success: false })
  }

  try {
    await fetch(downloadUrl, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
