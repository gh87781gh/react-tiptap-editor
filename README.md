# React Tiptap Base Editor

一個基於 Tiptap 的現代化富文本編輯器 React 組件庫，提供完整的編輯功能和可自定義的 UI 組件。

## ✨ 特色功能

### 📝 豐富的編輯功能

- **文字格式化**: 粗體、斜體、底線、刪除線、行內程式碼
- **標題**: 支援 H1-H6 標題層級
- **清單**: 無序清單、有序清單、任務清單（支援巢狀結構）
- **文字對齊**: 左對齊、置中、右對齊、兩端對齊
- **引用區塊**: 美觀的引用樣式
- **程式碼區塊**: 語法高亮的程式碼區塊
- **上標/下標**: 數學公式和化學符號支援
- **文字高亮**: 多色彩高亮標記
- **連結管理**: 智能連結插入和編輯
- **圖片上傳**: 拖拽上傳，支援進度顯示
- **水平分隔線**: 內容區塊分隔
- **復原/重做**: 完整的編輯歷史管理

### 📱 響應式設計

- **桌面優化**: 完整工具列和快捷鍵支援
- **行動裝置友善**: 適應性工具列和觸控操作
- **動態工具列**: 根據游標位置智能顯示

### 🎨 可自定義 UI

- **模組化組件**: 每個功能都是獨立的 React 組件
- **主題支援**: 內建深色/淺色主題切換
- **SCSS 樣式**: 完全可自定義的樣式系統
- **無障礙設計**: 完整的 ARIA 標籤和鍵盤導航

## 🚀 快速開始

### 安裝

```bash
npm install react-tiptap-base-editor
```

### 基本使用

```tsx
import { TiptapEditor } from 'react-tiptap-base-editor'
import 'react-tiptap-base-editor/dist/styles/index.css'

function App() {
  return (
    <div className='App'>
      <TiptapEditor />
    </div>
  )
}
```

### 進階自定義

```tsx
import {
  TiptapEditor,
  MarkButton,
  HeadingDropdownMenu,
  ListDropdownMenu,
  Toolbar,
  ToolbarGroup
} from 'react-tiptap-base-editor'

function CustomEditor() {
  return (
    <div className='custom-editor'>
      {/* 自定義工具列 */}
      <Toolbar>
        <ToolbarGroup>
          <MarkButton type='bold' />
          <MarkButton type='italic' />
          <HeadingDropdownMenu levels={[1, 2, 3]} />
          <ListDropdownMenu types={['bulletList', 'orderedList']} />
        </ToolbarGroup>
      </Toolbar>

      {/* 編輯器內容區 */}
      <TiptapEditor />
    </div>
  )
}
```

## 📦 組件 API

### 主要組件

#### `TiptapEditor`

主要的編輯器組件，包含完整的編輯功能和工具列。

```tsx
<TiptapEditor />
```

#### `MarkButton`

文字格式化按鈕組件。

```tsx
<MarkButton
  type="bold" | "italic" | "strike" | "code" | "underline" | "superscript" | "subscript"
  editor={editor}
  hideWhenUnavailable={false}
  onToggled={() => console.log('格式已切換')}
/>
```

#### `HeadingDropdownMenu`

標題選擇下拉選單。

```tsx
<HeadingDropdownMenu
  levels={[1, 2, 3, 4, 5, 6]}
  editor={editor}
  portal={false}
/>
```

#### `ListDropdownMenu`

清單類型選擇下拉選單。

```tsx
<ListDropdownMenu
  types={['bulletList', 'orderedList', 'taskList']}
  editor={editor}
  portal={false}
/>
```

#### `TextAlignButton`

文字對齊按鈕。

```tsx
<TextAlignButton
  align="left" | "center" | "right" | "justify"
  editor={editor}
/>
```

#### `ImageUploadButton`

圖片上傳按鈕。

```tsx
<ImageUploadButton text='上傳圖片' editor={editor} />
```

### UI 基礎組件

#### `Toolbar` / `ToolbarGroup` / `ToolbarSeparator`

工具列佈局組件。

```tsx
<Toolbar>
  <ToolbarGroup>
    <MarkButton type='bold' />
    <MarkButton type='italic' />
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup>
    <HeadingDropdownMenu />
  </ToolbarGroup>
</Toolbar>
```

#### `Button`

基礎按鈕組件。

```tsx
<Button
  data-style="ghost" | "outline" | "solid"
  data-active-state="on" | "off"
  tooltip="提示文字"
>
  按鈕內容
</Button>
```

## 🎯 Hooks

### `useTiptapEditor`

獲取編輯器實例的 Hook。

```tsx
import { useTiptapEditor } from 'react-tiptap-base-editor'

function CustomComponent() {
  const { editor, editorState, canCommand } = useTiptapEditor()

  return (
    <button
      onClick={() => editor?.chain().focus().toggleBold().run()}
      disabled={!canCommand?.().toggleBold()}
    >
      粗體
    </button>
  )
}
```

### `useIsMobile`

檢測是否為行動裝置。

```tsx
import { useIsMobile } from 'react-tiptap-base-editor'

function ResponsiveComponent() {
  const isMobile = useIsMobile()

  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {/* 響應式內容 */}
    </div>
  )
}
```

### `useWindowSize`

獲取視窗尺寸。

```tsx
import { useWindowSize } from 'react-tiptap-base-editor'

function SizeAwareComponent() {
  const { width, height } = useWindowSize()

  return (
    <div>
      視窗尺寸: {width} x {height}
    </div>
  )
}
```

## 🛠 工具函數

### `onUploadImage`

圖片上傳處理函數。

```tsx
import { onUploadImage, MAX_FILE_SIZE } from 'react-tiptap-base-editor'

// 自定義上傳邏輯
const customUpload = async (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('檔案過大')
  }

  // 實作你的上傳邏輯
  const url = await uploadToServer(file)
  return url
}
```

## 🎨 樣式自定義

### CSS 變數

編輯器使用 CSS 變數來管理主題，你可以覆寫這些變數來自定義外觀：

```css
:root {
  /* 主要顏色 */
  --tiptap-color-primary: #3b82f6;
  --tiptap-color-secondary: #64748b;

  /* 背景顏色 */
  --tiptap-color-background: #ffffff;
  --tiptap-color-surface: #f8fafc;

  /* 文字顏色 */
  --tiptap-color-text: #1e293b;
  --tiptap-color-text-muted: #64748b;

  /* 邊框 */
  --tiptap-border-radius: 6px;
  --tiptap-border-width: 1px;
  --tiptap-border-color: #e2e8f0;
}
```

### SCSS 匯入

如果你使用 SCSS，可以匯入變數檔案進行更深度的自定義：

```scss
@import 'react-tiptap-base-editor/src/styles/variables';

// 覆寫變數
$primary-color: #your-color;

@import 'react-tiptap-base-editor/dist/styles/index.css';
```

## 📱 響應式支援

編輯器會自動檢測裝置類型並調整 UI：

- **桌面**: 顯示完整工具列，支援滑鼠懸停效果
- **平板**: 適中的按鈕尺寸，觸控友善
- **手機**: 簡化工具列，大按鈕設計，分層選單

## ⌨️ 快捷鍵

| 功能     | Windows/Linux | macOS |
| -------- | ------------- | ----- |
| 粗體     | Ctrl+B        | ⌘B    |
| 斜體     | Ctrl+I        | ⌘I    |
| 底線     | Ctrl+U        | ⌘U    |
| 刪除線   | Ctrl+Shift+S  | ⌘⇧S   |
| 程式碼   | Ctrl+E        | ⌘E    |
| 復原     | Ctrl+Z        | ⌘Z    |
| 重做     | Ctrl+Y        | ⌘Y    |
| 標題 1   | Ctrl+Alt+1    | ⌘⌥1   |
| 標題 2   | Ctrl+Alt+2    | ⌘⌥2   |
| 無序清單 | Ctrl+Shift+8  | ⌘⇧8   |
| 有序清單 | Ctrl+Shift+7  | ⌘⇧7   |

## 🔧 開發

### 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置組件庫
npm run build

# 代碼檢查
npm run lint
```

### 專案結構

```
src/
├── components/
│   ├── tiptap-icons/          # 圖示組件
│   ├── tiptap-node/           # 節點樣式
│   ├── tiptap-templates/      # 編輯器模板
│   ├── tiptap-ui/            # UI 功能組件
│   └── tiptap-ui-primitive/  # 基礎 UI 組件
├── hooks/                    # React Hooks
├── lib/                      # 工具函數
└── styles/                   # 樣式檔案
```

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📞 支援

如有問題或建議，請透過以下方式聯繫：

- GitHub Issues: [提交問題](https://github.com/your-repo/issues)
- 文件: [查看完整文件](https://your-docs-site.com)

---

**React Tiptap Base Editor** - 讓富文本編輯變得簡單而強大 ✨
