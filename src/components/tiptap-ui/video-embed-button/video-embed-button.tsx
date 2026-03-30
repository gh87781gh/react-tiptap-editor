"use client"

import * as React from "react"

import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

import type { UseVideoEmbedConfig } from "./use-video-embed"
import { useVideoEmbed } from "./use-video-embed"
import { parseVideoUrl } from "@/components/tiptap-node/video-embed-node/video-embed-extension"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"
import { Input, InputGroup } from "@/components/tiptap-ui-primitive/input"

import { CornerDownLeftIcon } from "@/components/tiptap-icons/corner-down-left-icon"

export interface VideoEmbedButtonProps
  extends Omit<ButtonProps, "type">,
    UseVideoEmbedConfig {
  text?: string
}

export const VideoEmbedButton = React.forwardRef<
  HTMLButtonElement,
  VideoEmbedButtonProps
>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onInserted,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isOpen, setIsOpen] = React.useState(false)
    const [url, setUrl] = React.useState("")
    const [error, setError] = React.useState("")

    const { isVisible, canInsert, insertVideo, label, Icon } = useVideoEmbed({
      editor,
      hideWhenUnavailable,
      onInserted,
    })

    const handleSubmit = React.useCallback(() => {
      if (!url.trim()) return

      const parsed = parseVideoUrl(url.trim())
      if (!parsed) {
        setError("Please enter a valid YouTube or Vimeo URL")
        return
      }

      setError("")
      const success = insertVideo(url.trim())
      if (success) {
        setUrl("")
        setIsOpen(false)
      }
    }, [url, insertVideo])

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault()
          handleSubmit()
        }
      },
      [handleSubmit]
    )

    const handleOpenChange = React.useCallback((open: boolean) => {
      setIsOpen(open)
      if (!open) {
        setUrl("")
        setError("")
      }
    }, [])

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        setIsOpen(!isOpen)
      },
      [onClick, isOpen]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            disabled={!canInsert}
            data-style="ghost"
            data-disabled={!canInsert}
            aria-label={label}
            tooltip={label}
            onClick={handleClick}
            {...buttonProps}
            ref={ref}
          >
            {children ?? (
              <>
                <Icon className="tiptap-button-icon" />
                {text && <span className="tiptap-button-text">{text}</span>}
              </>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <Card>
            <CardBody>
              <CardItemGroup orientation="horizontal">
                <InputGroup>
                  <Input
                    type="url"
                    placeholder="Paste YouTube or Vimeo URL..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setError("")
                    }}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                </InputGroup>

                <ButtonGroup orientation="horizontal">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    title="Embed video"
                    disabled={!url.trim()}
                    data-style="ghost"
                  >
                    <CornerDownLeftIcon className="tiptap-button-icon" />
                  </Button>
                </ButtonGroup>
              </CardItemGroup>

              {error && (
                <div
                  style={{
                    color: "var(--tt-color-red-base, #e53e3e)",
                    fontSize: "12px",
                    padding: "4px 8px 0",
                  }}
                >
                  {error}
                </div>
              )}
            </CardBody>
          </Card>
        </PopoverContent>
      </Popover>
    )
  }
)

VideoEmbedButton.displayName = "VideoEmbedButton"
