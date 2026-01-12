"use client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { RotateCcw, LinkIcon, Eye, Zap } from "lucide-react"
import type { ImageElement } from "@/types/editor"

interface ImageInteractionsProps {
  element: ImageElement
  onUpdateElement: (id: string, updates: Record<string, any>) => void
}

export function ImageInteractions({ element, onUpdateElement }: ImageInteractionsProps) {
  const interactions = element.interactions || {
    type: "none",
    clickAction: "none",
    hoverAction: "zoom",
    linkUrl: "",
    lightbox: false,
    tooltip: "",
    animationTrigger: "onLoad",
  }

  const updateInteraction = (updates: Partial<typeof interactions>) => {
    onUpdateElement(element.id, {
      interactions: {
        ...interactions,
        ...updates,
      },
    })
  }

  const resetInteractions = () => {
    onUpdateElement(element.id, {
      interactions: {
        type: "none",
        clickAction: "none",
        hoverAction: "zoom",
        linkUrl: "",
        lightbox: false,
        tooltip: "",
        animationTrigger: "onLoad",
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-muted-foreground">Image Interactions</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetInteractions}
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        {/* Hover Effects */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Hover Effect</Label>
          <Select value={interactions.hoverAction} onValueChange={(value) => updateInteraction({ hoverAction: value })}>
            <SelectTrigger className="bg-card/5 border-border/10 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover/80 backdrop-blur-xl border-border/10 text-foreground">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="zoom">Zoom In</SelectItem>
              <SelectItem value="brightness">Brighten</SelectItem>
              <SelectItem value="blur">Blur Background</SelectItem>
              <SelectItem value="grayscale">Remove Grayscale</SelectItem>
              <SelectItem value="scale">Scale Up</SelectItem>
              <SelectItem value="glow">Add Glow</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Click Actions */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Click Action</Label>
          <Select value={interactions.clickAction} onValueChange={(value) => updateInteraction({ clickAction: value })}>
            <SelectTrigger className="bg-card/5 border-border/10 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover/80 backdrop-blur-xl border-border/10 text-foreground">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="lightbox">Open Lightbox</SelectItem>
              <SelectItem value="link">Open Link</SelectItem>
              <SelectItem value="toggle">Toggle Effect</SelectItem>
              <SelectItem value="animate">Play Animation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Link URL */}
        {interactions.clickAction === "link" && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Link URL
            </Label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={interactions.linkUrl}
              onChange={(e) => updateInteraction({ linkUrl: e.target.value })}
              className="bg-card/5 border-border/10 text-foreground placeholder-muted-foreground"
            />
          </div>
        )}

        {/* Lightbox */}
        {interactions.clickAction === "lightbox" && (
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Enable Lightbox
            </Label>
            <Switch
              checked={interactions.lightbox}
              onCheckedChange={(checked) => updateInteraction({ lightbox: checked })}
            />
          </div>
        )}

        {/* Tooltip */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Tooltip Text (Optional)</Label>
          <Input
            type="text"
            placeholder="Enter tooltip text..."
            value={interactions.tooltip}
            onChange={(e) => updateInteraction({ tooltip: e.target.value })}
            className="bg-card/5 border-border/10 text-foreground placeholder-muted-foreground"
          />
        </div>

        {/* Animation Trigger */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Animation Trigger
          </Label>
          <Select
            value={interactions.animationTrigger}
            onValueChange={(value) => updateInteraction({ animationTrigger: value })}
          >
            <SelectTrigger className="bg-card/5 border-border/10 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover/80 backdrop-blur-xl border-border/10 text-foreground">
              <SelectItem value="onLoad">On Page Load</SelectItem>
              <SelectItem value="onHover">On Hover</SelectItem>
              <SelectItem value="onClick">On Click</SelectItem>
              <SelectItem value="onScroll">On Scroll</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-md text-xs text-cyber-cyan">
          <p className="font-medium mb-1">Interactive Features:</p>
          <ul className="space-y-1 text-cyber-cyan/80">
            <li>• Hover effects enhance visual feedback</li>
            <li>• Click actions enable user interaction</li>
            <li>• Tooltips provide helpful context</li>
            <li>• Lightbox showcases full-resolution images</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
