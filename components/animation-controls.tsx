"use client"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, Play } from "lucide-react"
import type { ElementAnimation, SlideTransition } from "@/types/editor"

interface AnimationControlsProps {
  animation?: ElementAnimation
  onUpdateAnimation: (animation: ElementAnimation) => void
  onPreviewAnimation: () => void
}

export function AnimationControls({ animation, onUpdateAnimation, onPreviewAnimation }: AnimationControlsProps) {
  const defaultAnimation: ElementAnimation = {
    type: "fade",
    delay: 0,
    duration: 1,
    trigger: "onLoad",
    easing: "ease",
  }

  const currentAnimation = animation || defaultAnimation

  const updateAnimation = (updates: Partial<ElementAnimation>) => {
    onUpdateAnimation({ ...currentAnimation, ...updates })
  }

  const resetAnimation = () => {
    onUpdateAnimation({
      type: "none",
      delay: 0,
      duration: 1,
      trigger: "onLoad",
      easing: "ease",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">Element Animation</h4>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAnimation}
            className="h-7 text-xs text-gray-400 hover:text-gray-100"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewAnimation}
            className="h-7 text-xs bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-100"
          >
            <Play className="h-3 w-3 mr-1 text-sky-400" />
            Preview
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Animation Type</Label>
          <Select
            value={currentAnimation.type}
            onValueChange={(value) => updateAnimation({ type: value as ElementAnimation["type"] })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectValue placeholder="Select animation type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
              <SelectItem value="flip">Flip</SelectItem>
              <SelectItem value="rotate">Rotate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(currentAnimation.type === "slide" || currentAnimation.type === "flip") && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Direction</Label>
            <RadioGroup
              value={currentAnimation.direction || "left"}
              onValueChange={(value) => updateAnimation({ direction: value as ElementAnimation["direction"] })}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="left" className="text-sky-400" />
                <Label htmlFor="left" className="text-gray-300">
                  Left
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="right" className="text-sky-400" />
                <Label htmlFor="right" className="text-gray-300">
                  Right
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top" id="top" className="text-sky-400" />
                <Label htmlFor="top" className="text-gray-300">
                  Top
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom" id="bottom" className="text-sky-400" />
                <Label htmlFor="bottom" className="text-gray-300">
                  Bottom
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-gray-300">Delay (seconds)</Label>
            <span className="text-xs text-gray-400">{currentAnimation.delay.toFixed(1)}s</span>
          </div>
          <Slider
            min={0}
            max={5}
            step={0.1}
            value={[currentAnimation.delay]}
            onValueChange={([value]) => updateAnimation({ delay: value })}
            className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-gray-300">Duration (seconds)</Label>
            <span className="text-xs text-gray-400">{currentAnimation.duration.toFixed(1)}s</span>
          </div>
          <Slider
            min={0.1}
            max={3}
            step={0.1}
            value={[currentAnimation.duration]}
            onValueChange={([value]) => updateAnimation({ duration: value })}
            className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Trigger</Label>
          <RadioGroup
            value={currentAnimation.trigger}
            onValueChange={(value) => updateAnimation({ trigger: value as ElementAnimation["trigger"] })}
            className="flex gap-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onLoad" id="onLoad" className="text-sky-400" />
              <Label htmlFor="onLoad" className="text-gray-300">
                On Slide Load
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onClick" id="onClick" className="text-sky-400" />
              <Label htmlFor="onClick" className="text-gray-300">
                On Click
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Easing</Label>
          <Select
            value={currentAnimation.easing}
            onValueChange={(value) => updateAnimation({ easing: value as ElementAnimation["easing"] })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectValue placeholder="Select easing" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="ease">Ease</SelectItem>
              <SelectItem value="ease-in">Ease In</SelectItem>
              <SelectItem value="ease-out">Ease Out</SelectItem>
              <SelectItem value="ease-in-out">Ease In Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

interface TransitionControlsProps {
  transition?: SlideTransition
  onUpdateTransition: (transition: SlideTransition) => void
  onPreviewTransition: () => void
}

export function TransitionControls({ transition, onUpdateTransition, onPreviewTransition }: TransitionControlsProps) {
  const defaultTransition: SlideTransition = {
    type: "fade",
    duration: 0.5,
    easing: "ease",
  }

  const currentTransition = transition || defaultTransition

  const updateTransition = (updates: Partial<SlideTransition>) => {
    onUpdateTransition({ ...currentTransition, ...updates })
  }

  const resetTransition = () => {
    onUpdateTransition({
      type: "none",
      duration: 0.5,
      easing: "ease",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">Slide Transition</h4>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTransition}
            className="h-7 text-xs text-gray-400 hover:text-gray-100"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviewTransition}
            className="h-7 text-xs bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-100"
          >
            <Play className="h-3 w-3 mr-1 text-sky-400" />
            Preview
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Transition Type</Label>
          <Select
            value={currentTransition.type}
            onValueChange={(value) => updateTransition({ type: value as SlideTransition["type"] })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectValue placeholder="Select transition type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="fade">Fade</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>

              {/* 3D Transitions */}
              <SelectItem value="flip">3D Flip</SelectItem>
              <SelectItem value="cube">3D Cube</SelectItem>
              <SelectItem value="carousel">3D Carousel</SelectItem>
              <SelectItem value="fold">3D Fold</SelectItem>
              <SelectItem value="reveal">3D Reveal</SelectItem>
              <SelectItem value="room">3D Room</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(currentTransition.type === "slide" ||
          currentTransition.type === "flip" ||
          currentTransition.type === "cube") && (
          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Direction</Label>
            <RadioGroup
              value={currentTransition.direction || "left"}
              onValueChange={(value) => updateTransition({ direction: value as SlideTransition["direction"] })}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="t-left" className="text-sky-400" />
                <Label htmlFor="t-left" className="text-gray-300">
                  Left
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="t-right" className="text-sky-400" />
                <Label htmlFor="t-right" className="text-gray-300">
                  Right
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top" id="t-top" className="text-sky-400" />
                <Label htmlFor="t-top" className="text-gray-300">
                  Top
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottom" id="t-bottom" className="text-sky-400" />
                <Label htmlFor="t-bottom" className="text-gray-300">
                  Bottom
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {(currentTransition.type === "flip" ||
          currentTransition.type === "cube" ||
          currentTransition.type === "carousel" ||
          currentTransition.type === "fold" ||
          currentTransition.type === "reveal" ||
          currentTransition.type === "room") && (
          <div className="space-y-4 mt-4 p-3 bg-gray-800/50 rounded-md">
            <h5 className="text-sm font-medium text-gray-300">3D Settings</h5>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm text-gray-300">Perspective</Label>
                <span className="text-xs text-gray-400">{currentTransition.perspective || 1000}px</span>
              </div>
              <Slider
                min={500}
                max={2000}
                step={100}
                value={[currentTransition.perspective || 1000]}
                onValueChange={([value]) => updateTransition({ perspective: value })}
                className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm text-gray-300">Depth</Label>
                <span className="text-xs text-gray-400">{currentTransition.depth || 100}px</span>
              </div>
              <Slider
                min={50}
                max={500}
                step={10}
                value={[currentTransition.depth || 100]}
                onValueChange={([value]) => updateTransition({ depth: value })}
                className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
              />
            </div>

            {(currentTransition.type === "carousel" || currentTransition.type === "room") && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Rotation</Label>
                  <span className="text-xs text-gray-400">{currentTransition.rotate || 90}°</span>
                </div>
                <Slider
                  min={45}
                  max={180}
                  step={5}
                  value={[currentTransition.rotate || 90]}
                  onValueChange={([value]) => updateTransition({ rotate: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
                />
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm text-gray-300">Duration (seconds)</Label>
            <span className="text-xs text-gray-400">{currentTransition.duration.toFixed(1)}s</span>
          </div>
          <Slider
            min={0.1}
            max={2}
            step={0.1}
            value={[currentTransition.duration]}
            onValueChange={([value]) => updateTransition({ duration: value })}
            className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Easing</Label>
          <Select
            value={currentTransition.easing}
            onValueChange={(value) => updateTransition({ easing: value as SlideTransition["easing"] })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectValue placeholder="Select easing" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="ease">Ease</SelectItem>
              <SelectItem value="ease-in">Ease In</SelectItem>
              <SelectItem value="ease-out">Ease Out</SelectItem>
              <SelectItem value="ease-in-out">Ease In Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
