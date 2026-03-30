import * as React from "react"

import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

import type { UseTextColorConfig } from "./use-text-color"
import { useTextColor } from "./use-text-color"

import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

import "@/components/tiptap-ui/text-color-button/text-color-button.scss"

export interface TextColorButtonProps
  extends Omit<ButtonProps, "type">,
    UseTextColorConfig {
  text?: string
}

export const TextColorButton = React.forwardRef<
  HTMLButtonElement,
  TextColorButtonProps
>(
  (
    {
      editor: providedEditor,
      color,
      text,
      hideWhenUnavailable = false,
      onApplied,
      onClick,
      children,
      style,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const { isVisible, canSetColor, isActive, handleSetColor, label } =
      useTextColor({
        editor,
        color,
        label: text || `Text ${color}`,
        hideWhenUnavailable,
        onApplied,
      })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleSetColor()
      },
      [handleSetColor, onClick]
    )

    const buttonStyle = React.useMemo(
      () =>
        ({
          ...style,
          "--text-color": color,
        }) as React.CSSProperties,
      [color, style]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        role="button"
        tabIndex={-1}
        disabled={!canSetColor}
        data-disabled={!canSetColor}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        style={buttonStyle}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <span
              className="tiptap-button-text-color"
              style={
                { "--text-color": color } as React.CSSProperties
              }
            />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

TextColorButton.displayName = "TextColorButton"
