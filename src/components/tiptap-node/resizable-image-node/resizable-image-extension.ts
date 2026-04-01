import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { ResizableImageComponent } from './resizable-image-component'

export interface ResizableImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, unknown>
  /**
   * Called when the user pastes an image file from the clipboard.
   * Should upload the file and return the resulting URL.
   * If not provided, clipboard image paste is not handled by this extension.
   */
  onPasteImage?: (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal
  ) => Promise<string>
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
      onPasteImage: undefined,
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
          return width ? parseInt(width) : null
        },
        renderHTML: attributes => {
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
        tag: 'figure[data-resizable-image]',
        getAttrs: element => {
          const fig = element as HTMLElement
          const img = fig.querySelector('img')
          if (!img) return false
          const width = img.getAttribute('width')
          const imageId = img.getAttribute('data-image-id')
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: width ? parseInt(width) : 300,
            imageId: imageId || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        }
      },
      {
        // 向下相容：舊版本直接是 <img>
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
        getAttrs: element => {
          const img = element as HTMLImageElement
          const width = img.getAttribute('width')
          const imageId = img.getAttribute('data-image-id')
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: width ? parseInt(width) : 300,
            imageId: imageId || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        }
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, width, imageId, style, ...rest } = HTMLAttributes

    // TextAlign extension 注入 style="text-align: ..."
    // 保留 text-align 讓 parseHTML 能還原，同時加上 flexbox 做視覺對齊
    const textAlign = (style as string | undefined)?.match(/text-align:\s*(\w+)/)?.[1] ?? 'left'
    const justifyContent =
      textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start'

    const figAttrs: Record<string, string> = {
      'data-resizable-image': '',
      style: `display: flex; justify-content: ${justifyContent}; text-align: ${textAlign};`,
    }
    const imgAttrs: Record<string, string> = mergeAttributes(
      this.options.HTMLAttributes,
      { src, alt, title },
      width ? { width, height: 'auto' } : {},
      imageId ? { 'data-image-id': imageId } : {},
      rest
    )
    return ['figure', figAttrs, ['img', imgAttrs]]
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

  addProseMirrorPlugins() {
    const onPasteImage = this.options.onPasteImage

    return [
      new Plugin({
        key: new PluginKey('resizableImagePaste'),
        props: {
          handlePaste(view, event) {
            if (!onPasteImage) return false

            const items = event.clipboardData?.items
            if (!items) return false

            const imageItems = Array.from(items).filter(item =>
              item.type.startsWith('image/')
            )
            if (imageItems.length === 0) return false

            event.preventDefault()

            imageItems.forEach(item => {
              const file = item.getAsFile()
              if (!file) return

              // Remember insert position before async work
              const insertPos = view.state.selection.from

              // Insert imageUpload placeholder node so the progress bar UI is shown
              const imageUploadType = view.state.schema.nodes['imageUpload']
              if (imageUploadType) {
                const placeholderNode = imageUploadType.create({
                  accept: 'image/*',
                  limit: 1,
                  maxSize: 0,
                })
                const tr = view.state.tr.replaceSelectionWith(placeholderNode)
                view.dispatch(tr)
              }

              // Track placeholder position after insertion
              const placeholderFrom = insertPos
              const placeholderTo = insertPos + (imageUploadType ? 1 : 0)

              const abortController = new AbortController()

              onPasteImage(file, undefined, abortController.signal)
                .then(url => {
                  if (!url || abortController.signal.aborted) return

                  const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                  const resizableImageType = view.state.schema.nodes['resizableImage']
                  if (!resizableImageType) return

                  // Find the placeholder node and replace it
                  let foundFrom = -1
                  let foundTo = -1
                  view.state.doc.nodesBetween(
                    Math.max(0, placeholderFrom - 2),
                    Math.min(view.state.doc.content.size, placeholderTo + 10),
                    (node, pos) => {
                      if (node.type.name === 'imageUpload') {
                        foundFrom = pos
                        foundTo = pos + node.nodeSize
                        return false
                      }
                      return true
                    }
                  )

                  if (foundFrom === -1) {
                    // Fallback: search entire doc
                    view.state.doc.descendants((node, pos) => {
                      if (node.type.name === 'imageUpload' && foundFrom === -1) {
                        foundFrom = pos
                        foundTo = pos + node.nodeSize
                        return false
                      }
                      return true
                    })
                  }

                  if (foundFrom === -1) return

                  const filename = file.name.replace(/\.[^/.]+$/, '') || 'image'
                  const newNode = resizableImageType.create({
                    src: url,
                    alt: filename,
                    title: filename,
                    width: 300,
                    imageId,
                  })

                  const replaceTr = view.state.tr.replaceWith(foundFrom, foundTo, newNode)
                  view.dispatch(replaceTr)
                })
                .catch(() => {
                  // On error, remove the placeholder if still present
                  let foundFrom = -1
                  let foundTo = -1
                  view.state.doc.descendants((node, pos) => {
                    if (node.type.name === 'imageUpload' && foundFrom === -1) {
                      foundFrom = pos
                      foundTo = pos + node.nodeSize
                      return false
                    }
                    return true
                  })
                  if (foundFrom !== -1) {
                    view.dispatch(view.state.tr.delete(foundFrom, foundTo))
                  }
                })
            })

            return true
          },
        },
      }),
    ]
  },
})
