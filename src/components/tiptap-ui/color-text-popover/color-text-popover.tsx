import * as React from 'react'
import { type Editor } from '@tiptap/react'

// --- Hooks ---
import { useMenuNavigation } from '@/hooks/use-menu-navigation'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTiptapEditor } from '@/hooks/use-tiptap-editor'

// --- Icons ---
import { BanIcon } from '@/components/tiptap-icons/ban-icon'
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon'

// --- UI Primitives ---
import type { ButtonProps } from '@/components/tiptap-ui-primitive/button'
import { Button, ButtonGroup } from '@/components/tiptap-ui-primitive/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/tiptap-ui-primitive/popover'
import { Separator } from '@/components/tiptap-ui-primitive/separator'
import {
  Card,
  CardBody,
  CardItemGroup
} from '@/components/tiptap-ui-primitive/card'

// --- Tiptap UI ---
import type {
  TextColor,
  UseColorTextConfig
} from '@/components/tiptap-ui/color-text-button'
import {
  ColorTextButton,
  pickTextColorsByValue,
  useColorText
} from '@/components/tiptap-ui/color-text-button'

export interface ColorTextPopoverContentProps {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[]
}

export interface ColorTextPopoverProps
  extends Omit<ButtonProps, 'type'>,
    Pick<UseColorTextConfig, 'editor' | 'hideWhenUnavailable' | 'onApplied'> {
  /**
   * Optional colors to use in the text color popover.
   * If not provided, defaults to a predefined set of colors.
   */
  colors?: TextColor[]
}

export const ColorTextPopoverButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    type='button'
    className={className}
    data-style='ghost'
    data-appearance='default'
    role='button'
    tabIndex={-1}
    aria-label='Text color'
    tooltip='Text color'
    ref={ref}
    {...props}
  >
    {children ?? <HighlighterIcon className='tiptap-button-icon' />}
  </Button>
))

ColorTextPopoverButton.displayName = 'ColorTextPopoverButton'

export function ColorTextPopoverContent({
  editor,
  colors = pickTextColorsByValue([
    'var(--tt-color-text-green)',
    'var(--tt-color-text-blue)',
    'var(--tt-color-text-red)',
    'var(--tt-color-text-purple)',
    'var(--tt-color-text-yellow)'
  ])
}: ColorTextPopoverContentProps) {
  const { handleRemoveTextColor } = useColorText({ editor })
  const isMobile = useIsMobile()
  const containerRef = React.useRef<HTMLDivElement>(null)

  const menuItems = React.useMemo(
    () => [...colors, { label: 'Remove text color', value: 'none' }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: 'both',
    onSelect: (item) => {
      if (!containerRef.current) return false
      const highlightedElement = containerRef.current.querySelector(
        '[data-highlighted="true"]'
      ) as HTMLElement
      if (highlightedElement) highlightedElement.click()
      if (item.value === 'none') handleRemoveTextColor()
    },
    autoSelectFirstItem: false
  })

  return (
    <Card
      ref={containerRef}
      tabIndex={0}
      style={isMobile ? { boxShadow: 'none', border: 0 } : {}}
    >
      <CardBody style={isMobile ? { padding: 0 } : {}}>
        <CardItemGroup orientation='horizontal'>
          <ButtonGroup orientation='horizontal'>
            {colors.map((color, index) => (
              <ColorTextButton
                key={color.value}
                editor={editor}
                textColor={color.value}
                tooltip={color.label}
                aria-label={`${color.label}`}
                tabIndex={index === selectedIndex ? 0 : -1}
                data-highlighted={selectedIndex === index}
              />
            ))}
          </ButtonGroup>
          <Separator />
          <ButtonGroup orientation='horizontal'>
            <Button
              onClick={handleRemoveTextColor}
              aria-label='Remove text color'
              tooltip='Remove text color'
              tabIndex={selectedIndex === colors.length ? 0 : -1}
              type='button'
              role='menuitem'
              data-style='ghost'
              data-highlighted={selectedIndex === colors.length}
            >
              <BanIcon className='tiptap-button-icon' />
            </Button>
          </ButtonGroup>
        </CardItemGroup>
      </CardBody>
    </Card>
  )
}

export function ColorTextPopover({
  editor: providedEditor,
  colors = pickTextColorsByValue([
    'var(--tt-color-text-green)',
    'var(--tt-color-text-blue)',
    'var(--tt-color-text-red)',
    'var(--tt-color-text-purple)',
    'var(--tt-color-text-yellow)'
  ]),
  hideWhenUnavailable = false,
  onApplied,
  ...props
}: ColorTextPopoverProps) {
  const { editor } = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)
  const { isVisible, canColorText, isActive, label, Icon } = useColorText({
    editor,
    hideWhenUnavailable,
    onApplied
  })

  if (!isVisible) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <ColorTextPopoverButton
          disabled={!canColorText}
          data-active-state={isActive ? 'on' : 'off'}
          data-disabled={!canColorText}
          aria-pressed={isActive}
          aria-label={label}
          tooltip={label}
          {...props}
        >
          <Icon className='tiptap-button-icon' />
        </ColorTextPopoverButton>
      </PopoverTrigger>
      <PopoverContent aria-label='Text colors'>
        <ColorTextPopoverContent editor={editor} colors={colors} />
      </PopoverContent>
    </Popover>
  )
}

export default ColorTextPopover
