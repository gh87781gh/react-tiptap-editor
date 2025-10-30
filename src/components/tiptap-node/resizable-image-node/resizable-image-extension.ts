import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImageComponent } from './resizable-image-component'

export interface ResizableImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      /**
       * Add a resizable image
       */
      setResizableImage: (options: {
        src: string
        alt?: string
        title?: string
        width?: number
      }) => ReturnType
      /**
       * Update image size
       */
      setImageSize: (options: { width?: number }) => ReturnType
    }
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'resizableImage',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: element => {
          const width = element.getAttribute('width')
          // 如果沒有 width 屬性，返回 null（會使用預設值 300）
          return width ? parseInt(width) : null
        },
        renderHTML: attributes => {
          // 只設置 width 和 height 屬性
          if (!attributes.width) return {}
          return {
            width: attributes.width,
            height: 'auto'
          }
        },
      },
      // 使用唯一 ID 來識別每張圖片
      imageId: {
        default: null,
        parseHTML: element => element.getAttribute('data-image-id'),
        renderHTML: attributes => {
          if (!attributes.imageId) return {}
          return { 'data-image-id': attributes.imageId }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
        getAttrs: element => {
          const img = element as HTMLImageElement
          const width = img.getAttribute('width')
          const imageId = img.getAttribute('data-image-id')

          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            // 如果沒有 width 屬性，給預設值 300
            width: width ? parseInt(width) : 300,
            imageId: imageId || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        }
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setResizableImage: options => ({ commands }) => {
        // 產生唯一 ID
        const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        return commands.insertContent({
          type: this.name,
          attrs: {
            ...options,
            imageId,
            width: options.width || 300
          },
        })
      },
      setImageSize: options => ({ commands }) => {
        return commands.updateAttributes(this.name, options)
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
})
