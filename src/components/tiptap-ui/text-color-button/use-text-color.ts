"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { isMarkInSchema, isNodeTypeSelected } from "@/lib/tiptap-utils"
import { TextColorIcon } from "@/components/tiptap-icons/text-color-icon"

export const TEXT_COLORS = [
  {
    label: "Gray",
    value: "var(--tt-color-text-gray)",
    border: "var(--tt-color-text-gray-contrast)",
  },
  {
    label: "Brown",
    value: "var(--tt-color-text-brown)",
    border: "var(--tt-color-text-brown-contrast)",
  },
  {
    label: "Orange",
    value: "var(--tt-color-text-orange)",
    border: "var(--tt-color-text-orange-contrast)",
  },
  {
    label: "Yellow",
    value: "var(--tt-color-text-yellow)",
    border: "var(--tt-color-text-yellow-contrast)",
  },
  {
    label: "Green",
    value: "var(--tt-color-text-green)",
    border: "var(--tt-color-text-green-contrast)",
  },
  {
    label: "Blue",
    value: "var(--tt-color-text-blue)",
    border: "var(--tt-color-text-blue-contrast)",
  },
  {
    label: "Purple",
    value: "var(--tt-color-text-purple)",
    border: "var(--tt-color-text-purple-contrast)",
  },
  {
    label: "Pink",
    value: "var(--tt-color-text-pink)",
    border: "var(--tt-color-text-pink-contrast)",
  },
  {
    label: "Red",
    value: "var(--tt-color-text-red)",
    border: "var(--tt-color-text-red-contrast)",
  },
]
export type TextColor = (typeof TEXT_COLORS)[number]

export interface UseTextColorConfig {
  editor?: Editor | null
  color?: string
  label?: string
  hideWhenUnavailable?: boolean
  onApplied?: ({ color, label }: { color: string; label: string }) => void
}

export function pickTextColorsByValue(values: string[]) {
  const colorMap = new Map(TEXT_COLORS.map((c) => [c.value, c]))
  return values
    .map((v) => colorMap.get(v))
    .filter((c): c is TextColor => !!c)
}

export function canSetTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (
    !isMarkInSchema("textStyle", editor) ||
    isNodeTypeSelected(editor, ["image"])
  )
    return false

  return editor.can().setMark("textStyle")
}

export function isTextColorActive(
  editor: Editor | null,
  color?: string
): boolean {
  if (!editor || !editor.isEditable) return false
  return color
    ? editor.isActive("textStyle", { color })
    : editor.isActive("textStyle")
}

export function removeTextColor(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.chain().focus().unsetColor().run()
}

export function useTextColor(config: UseTextColorConfig) {
  const {
    editor: providedEditor,
    label,
    color,
    hideWhenUnavailable = false,
    onApplied,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const canSetColor = canSetTextColor(editor)
  const isActive = isTextColorActive(editor, color)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      if (!editor.isEditable) {
        setIsVisible(false)
        return
      }
      if (!isMarkInSchema("textStyle", editor)) {
        setIsVisible(false)
        return
      }
      if (hideWhenUnavailable) {
        setIsVisible(canSetTextColor(editor))
        return
      }
      setIsVisible(true)
    }

    handleSelectionUpdate()
    editor.on("selectionUpdate", handleSelectionUpdate)
    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleSetColor = React.useCallback(() => {
    if (!editor || !canSetColor || !color || !label) return false

    setTimeout(() => {
      const success = editor.chain().focus().setColor(color).run()
      if (success) {
        onApplied?.({ color, label })
      }
      return success
    }, 0)
  }, [canSetColor, color, editor, label, onApplied])

  const handleRemoveColor = React.useCallback(() => {
    if (!editor) return false
    const success = removeTextColor(editor)
    if (success) {
      onApplied?.({ color: "", label: "Remove color" })
    }
    return success
  }, [editor, onApplied])

  return {
    isVisible,
    isActive,
    handleSetColor,
    handleRemoveColor,
    canSetColor,
    label: label || "Text color",
    Icon: TextColorIcon,
  }
}
