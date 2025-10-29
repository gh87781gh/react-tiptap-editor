// 匯入樣式檔案
import './index.css'

// 主要元件匯出
export { TiptapEditor } from './components/tiptap-templates/simple/simple-editor'

// 常用子元件匯出（供進階使用）
export { BlockquoteButton } from './components/tiptap-ui/blockquote-button'
export { CodeBlockButton } from './components/tiptap-ui/code-block-button'
export { HeadingDropdownMenu } from './components/tiptap-ui/heading-dropdown-menu'
export { ImageUploadButton } from './components/tiptap-ui/image-upload-button'
export { ListDropdownMenu } from './components/tiptap-ui/list-dropdown-menu'
export { MarkButton } from './components/tiptap-ui/mark-button'
export { TextAlignButton } from './components/tiptap-ui/text-align-button'
export { UndoRedoButton } from './components/tiptap-ui/undo-redo-button'

// UI 基礎元件
export { Button } from './components/tiptap-ui-primitive/button'
export { Toolbar, ToolbarGroup, ToolbarSeparator } from './components/tiptap-ui-primitive/toolbar'
export { Card } from './components/tiptap-ui-primitive/card'

// Hooks
export { useIsMobile } from './hooks/use-mobile'
export { useWindowSize } from './hooks/use-window-size'
export { useTiptapEditor } from './hooks/use-tiptap-editor'

// 工具函數
export { handleImageUpload, MAX_FILE_SIZE } from './lib/tiptap-utils'

// 預設匯出主要元件（移除以避免混合匯出警告）
// export { TiptapEditor as default } from './components/tiptap-templates/simple/simple-editor'