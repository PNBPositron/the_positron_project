"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface KeyboardShortcutsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl font-mono">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-100">Keyboard Shortcuts</DialogTitle>
          <DialogDescription className="text-gray-400">
            Use these keyboard shortcuts to work more efficiently in the Positron editor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-sky-400">Navigation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Next slide</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Previous slide</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Exit presentation mode</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd>
              </div>
            </div>

            <h3 className="text-sm font-medium text-sky-400">Element Manipulation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Move element 1px</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">↑</kbd>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">↓</kbd>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">←</kbd>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">→</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Move element 10px</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Shift</kbd>
                  <span className="text-gray-300">+</span>
                  <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Arrow Keys</kbd>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Delete element</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Delete</kbd>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-sky-400">Editing</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Toggle grid</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">G</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Snap to grid/guides</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Shift</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Constrain proportions</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Shift</kbd>
                <span className="text-gray-300">(while resizing)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Constrain rotation</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Shift</kbd>
                <span className="text-gray-300">(while rotating)</span>
              </div>
            </div>

            <h3 className="text-sm font-medium text-sky-400">General</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Show keyboard shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">?</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Start presentation</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">F5</kbd>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
