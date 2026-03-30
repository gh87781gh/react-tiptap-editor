import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { VideoEmbedComponent } from './video-embed-component'

export type VideoProvider = 'youtube' | 'vimeo' | 'other'

export interface VideoEmbedOptions {
  HTMLAttributes: Record<string, any>
  allowFullscreen: boolean
}

export interface ParsedVideo {
  embedUrl: string
  provider: VideoProvider
}

export function parseVideoUrl(url: string): ParsedVideo | null {
  if (!url) return null

  const trimmed = url.trim()

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const ytPatterns = [
    /(?:youtube\.com\/watch\?.*v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ]

  for (const pattern of ytPatterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) {
      return {
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        provider: 'youtube',
      }
    }
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/)(\d+)/)
  if (vimeoMatch?.[1]) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      provider: 'vimeo',
    }
  }

  return null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (options: { src: string }) => ReturnType
    }
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'videoEmbed',

  addOptions() {
    return {
      HTMLAttributes: {},
      allowFullscreen: true,
    }
  },

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      provider: {
        default: 'other' as VideoProvider,
      },
      width: {
        default: null as number | null,
        parseHTML: (element) => {
          const el = element as HTMLElement
          const w = el.getAttribute('data-width')
          if (w == null || w === '') return null
          const n = parseInt(w, 10)
          return Number.isFinite(n) ? n : null
        },
        renderHTML: (attributes) => {
          if (attributes.width == null) return {}
          return { 'data-width': String(attributes.width) }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]',
        getAttrs: (element) => {
          const el = element as HTMLElement
          const iframe = el.querySelector('iframe')
          const w = el.getAttribute('data-width')
          const widthParsed =
            w != null && w !== '' ? parseInt(w, 10) : null
          return {
            src: iframe?.getAttribute('src') || el.getAttribute('data-src'),
            provider: el.getAttribute('data-provider') || 'other',
            width:
              widthParsed != null && Number.isFinite(widthParsed)
                ? widthParsed
                : null,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const width = HTMLAttributes.width as number | null | undefined
    const widthStyle =
      width != null
        ? `max-width: 100%; width: ${width}px;`
        : 'max-width: 100%; width: 100%;'

    return [
      'div',
      mergeAttributes(
        {
          'data-video-embed': '',
          'data-provider': HTMLAttributes.provider,
          ...(width != null ? { 'data-width': String(width) } : {}),
          style: widthStyle,
        },
        HTMLAttributes,
        this.options.HTMLAttributes
      ),
      [
        'iframe',
        {
          src: HTMLAttributes.src,
          frameborder: '0',
          allowfullscreen: this.options.allowFullscreen ? 'true' : undefined,
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          style: 'width: 100%; aspect-ratio: 16/9; border: 0; display: block;',
        },
      ],
    ]
  },

  addCommands() {
    return {
      setVideoEmbed:
        (options) =>
        ({ commands }) => {
          const parsed = parseVideoUrl(options.src)
          if (!parsed) return false

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: parsed.embedUrl,
              provider: parsed.provider,
            },
          })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedComponent)
  },
})
