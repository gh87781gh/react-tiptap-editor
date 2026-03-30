import * as React from "react"
import { type Editor } from "@tiptap/react"

import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { VideoIcon } from "@/components/tiptap-icons/video-icon"

export interface UseVideoEmbedConfig {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  onInserted?: () => void
}

export function canInsertVideo(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.can().insertContent({ type: "videoEmbed", attrs: { src: "" } })
}

export function useVideoEmbed(config: UseVideoEmbedConfig = {}) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onInserted,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = React.useState(true)
  const canInsert = canInsertVideo(editor)

  React.useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      if (!editor.isEditable) {
        setIsVisible(false)
        return
      }

      const hasExtension = editor.extensionManager.extensions.some(
        (ext: { name: string }) => ext.name === "videoEmbed"
      )
      if (!hasExtension) {
        setIsVisible(false)
        return
      }

      if (hideWhenUnavailable) {
        setIsVisible(canInsertVideo(editor))
        return
      }

      setIsVisible(true)
    }

    handleUpdate()
    editor.on("selectionUpdate", handleUpdate)
    return () => {
      editor.off("selectionUpdate", handleUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const insertVideo = React.useCallback(
    (url: string) => {
      if (!editor || !url) return false

      const success = editor.chain().focus().setVideoEmbed({ src: url }).run()
      if (success) {
        onInserted?.()
      }
      return success
    },
    [editor, onInserted]
  )

  return {
    isVisible,
    canInsert,
    insertVideo,
    label: "Embed video",
    Icon: VideoIcon,
  }
}
