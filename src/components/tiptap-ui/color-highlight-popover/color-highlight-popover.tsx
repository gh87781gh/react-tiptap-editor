import * as React from "react"
import { type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/hooks/use-menu-navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/components/tiptap-icons/ban-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button, ButtonGroup } from "@/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/tiptap-ui-primitive/popover"
import { Separator } from "@/components/tiptap-ui-primitive/separator"
import {
  Card,
  CardBody,
  CardItemGroup,
} from "@/components/tiptap-ui-primitive/card"

// --- Tiptap UI ---
import type {
  HighlightColor,
  UseColorHighlightConfig,
} from "@/components/tiptap-ui/color-highlight-button"
import {
  ColorHighlightButton,
  pickHighlightColorsByValue,
  useColorHighlight,
} from "@/components/tiptap-ui/color-highlight-button"

import type { TextColor } from "@/components/tiptap-ui/text-color-button"
import {
  TextColorButton,
  pickTextColorsByValue,
  useTextColor,
} from "@/components/tiptap-ui/text-color-button"

export interface ColorHighlightPopoverContentProps {
  editor?: Editor | null
  colors?: HighlightColor[]
  textColors?: TextColor[]
}

export interface ColorHighlightPopoverProps
  extends Omit<ButtonProps, "type">,
    Pick<
      UseColorHighlightConfig,
      "editor" | "hideWhenUnavailable" | "onApplied"
    > {
  colors?: HighlightColor[]
  textColors?: TextColor[]
}

export const ColorHighlightPopoverButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    type="button"
    className={className}
    data-style="ghost"
    data-appearance="default"
    role="button"
    tabIndex={-1}
    aria-label="Highlight text"
    tooltip="Highlight"
    ref={ref}
    {...props}
  >
    {children ?? <HighlighterIcon className="tiptap-button-icon" />}
  </Button>
))

ColorHighlightPopoverButton.displayName = "ColorHighlightPopoverButton"

const DEFAULT_TEXT_COLORS = pickTextColorsByValue([
  "var(--tt-color-text-gray)",
  "var(--tt-color-text-brown)",
  "var(--tt-color-text-orange)",
  "var(--tt-color-text-yellow)",
  "var(--tt-color-text-green)",
  "var(--tt-color-text-blue)",
  "var(--tt-color-text-purple)",
  "var(--tt-color-text-pink)",
  "var(--tt-color-text-red)",
])

const DEFAULT_HIGHLIGHT_COLORS = pickHighlightColorsByValue([
  "var(--tt-color-highlight-green)",
  "var(--tt-color-highlight-blue)",
  "var(--tt-color-highlight-red)",
  "var(--tt-color-highlight-purple)",
  "var(--tt-color-highlight-yellow)",
])

export function ColorHighlightPopoverContent({
  editor,
  colors = DEFAULT_HIGHLIGHT_COLORS,
  textColors = DEFAULT_TEXT_COLORS,
}: ColorHighlightPopoverContentProps) {
  const { handleRemoveHighlight } = useColorHighlight({ editor })
  const { handleRemoveColor } = useTextColor({ editor })
  const isMobile = useIsMobile()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const menuItems = React.useMemo(
    () => [
      ...textColors.map((c) => ({ ...c, group: "text" })),
      { label: "Remove color", value: "none-text", group: "text" },
      ...colors.map((c) => ({ ...c, group: "highlight" })),
      { label: "Remove highlight", value: "none-highlight", group: "highlight" },
    ],
    [textColors, colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlightedElement) highlightedElement.click()
      if (item.value === "none-text") handleRemoveColor()
      if (item.value === "none-highlight") handleRemoveHighlight()
    },
    autoSelectFirstItem: false,
  })

  const textColorOffset = 0
  const textRemoveIndex = textColors.length
  const highlightOffset = textColors.length + 1
  const highlightRemoveIndex = highlightOffset + colors.length

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: "none", border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation="horizontal">
          <ButtonGroup orientation="horizontal">
            {textColors.map((tc, index) => (
              <TextColorButton
                key={tc.value}
                editor={editor}
                color={tc.value}
                tooltip={tc.label}
                aria-label={`${tc.label} text color`}
                tabIndex={textColorOffset + index === selectedIndex ? 0 : -1}
                data-highlighted={selectedIndex === textColorOffset + index}
              />
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <Button
              onClick={handleRemoveColor}
              aria-label="Remove text color"
              tooltip="Remove text color"
              tabIndex={selectedIndex === textRemoveIndex ? 0 : -1}
              type="button"
              role="menuitem"
              data-style="ghost"
              data-highlighted={selectedIndex === textRemoveIndex}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>

        <Separator />

        <CardItemGroup orientation="horizontal">
          <ButtonGroup orientation="horizontal">
            {colors.map((color, index) => (
              <ColorHighlightButton
                key={color.value}
                editor={editor}
                highlightColor={color.value}
                tooltip={color.label}
                aria-label={`${color.label} highlight color`}
                tabIndex={highlightOffset + index === selectedIndex ? 0 : -1}
                data-highlighted={selectedIndex === highlightOffset + index}
              />
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation="horizontal">
            <Button
              onClick={handleRemoveHighlight}
              aria-label="Remove highlight"
              tooltip="Remove highlight"
              tabIndex={selectedIndex === highlightRemoveIndex ? 0 : -1}
              type="button"
              role="menuitem"
              data-style="ghost"
              data-highlighted={selectedIndex === highlightRemoveIndex}
            >
              <BanIcon className="tiptap-button-icon" />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function ColorHighlightPopover({
  editor: providedEditor,
  colors = DEFAULT_HIGHLIGHT_COLORS,
  textColors = DEFAULT_TEXT_COLORS,
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: ColorHighlightPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)
  const { isVisible, canColorHighlight, isActive, label, Icon } =
    useColorHighlight({
      editor,
      hideWhenUnavailable,
      onApplied,
    })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorHighlightPopoverButton
          disabled={!canColorHighlight}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={!canColorHighlight}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className="tiptap-button-icon" />
        </ColorHighlightPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Text colors and highlights">
        <ColorHighlightPopoverContent
          editor={editor}
          colors={colors}
          textColors={textColors}
        />
      </PopoverContent>
    </Popover>
  )
}

export default ColorHighlightPopover
