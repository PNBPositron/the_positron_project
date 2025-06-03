"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import type { VideoElement, AudioElement } from "@/types/editor"

interface MediaControlsProps {
  element: VideoElement | AudioElement
  onUpdateElement: (id: string, updates: Record<string, any>) => void
}

export function MediaControls({ element, onUpdateElement }: MediaControlsProps) {
  const isVideo = element.type === "video"

  const updateControl = (key: string, value: boolean | number) => {
    onUpdateElement(element.id, { [key]: value })
  }

  const resetControls = () => {
    const defaults = {
      autoplay: false,
      controls: true,
      loop: false,
      muted: isVideo ? false : undefined,
    }
    onUpdateElement(element.id, defaults)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">Media Settings</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetControls}
          className="h-7 text-xs text-gray-400 hover:text-gray-100"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="autoplay" className="text-sm text-gray-300">
            Autoplay
          </Label>
          <Switch
            id="autoplay"
            checked={element.autoplay}
            onCheckedChange={(checked) => updateControl("autoplay", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="controls" className="text-sm text-gray-300">
            Show Controls
          </Label>
          <Switch
            id="controls"
            checked={element.controls}
            onCheckedChange={(checked) => updateControl("controls", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="loop" className="text-sm text-gray-300">
            Loop
          </Label>
          <Switch id="loop" checked={element.loop} onCheckedChange={(checked) => updateControl("loop", checked)} />
        </div>

        {isVideo && (
          <div className="flex items-center justify-between">
            <Label htmlFor="muted" className="text-sm text-gray-300">
              Muted
            </Label>
            <Switch
              id="muted"
              checked={(element as VideoElement).muted}
              onCheckedChange={(checked) => updateControl("muted", checked)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
