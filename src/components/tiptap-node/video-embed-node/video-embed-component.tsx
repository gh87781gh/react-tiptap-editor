import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

const MIN_WIDTH = 200
const DEFAULT_FLUID_WIDTH = '100%'

export const VideoEmbedComponent: React.FC<NodeViewProps> = ({
  node,
  selected,
  updateAttributes,
}) => {
  const { src, provider, width: widthAttr, textAlign: textAlignAttr } =
    node.attrs as {
      src: string
      provider: string
      width: number | null
      textAlign?: string | null
    }

  const textAlign = textAlignAttr || 'left'
  const justifyContent =
    textAlign === 'center'
      ? 'center'
      : textAlign === 'right'
        ? 'flex-end'
        : textAlign === 'justify'
          ? 'flex-start'
          : 'flex-start'

  const [isResizing, setIsResizing] = useState(false)
  const [displayWidth, setDisplayWidth] = useState<number | null>(widthAttr)
  const containerRef = useRef<HTMLDivElement>(null)
  const isResizingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const updateAttributesRef = useRef(updateAttributes)
  updateAttributesRef.current = updateAttributes

  useEffect(() => {
    if (!isResizingRef.current) {
      setDisplayWidth(widthAttr)
    }
  }, [widthAttr])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return
      const deltaX = e.clientX - startXRef.current
      const next = Math.max(
        MIN_WIDTH,
        Math.round(startWidthRef.current + deltaX)
      )
      setDisplayWidth(next)
      if (containerRef.current) {
        containerRef.current.style.width = `${next}px`
      }
    }

    const onMouseUp = () => {
      if (!isResizingRef.current) return
      isResizingRef.current = false
      setIsResizing(false)

      setDisplayWidth((current) => {
        if (current == null) return current
        updateAttributesRef.current({ width: current })
        return current
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    isResizingRef.current = true
    setIsResizing(true)
    startXRef.current = e.clientX
    const rect = containerRef.current?.getBoundingClientRect()
    const current =
      widthAttr != null
        ? widthAttr
        : rect?.width
          ? Math.round(rect.width)
          : 560
    startWidthRef.current = current
    if (displayWidth == null && containerRef.current) {
      setDisplayWidth(current)
      containerRef.current.style.width = `${current}px`
    }
  }, [widthAttr, displayWidth])

  const effectiveWidth = displayWidth ?? widthAttr
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width:
      effectiveWidth != null ? `${effectiveWidth}px` : DEFAULT_FLUID_WIDTH,
    maxWidth: '100%',
  }

  const handleStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 12,
    height: 12,
    background: '#007bff',
    border: '2px solid white',
    borderRadius: '50%',
    cursor: 'nw-resize',
    opacity: selected || isResizing ? 1 : 0,
    transition: 'opacity 0.2s ease',
    zIndex: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  }

  return (
    <NodeViewWrapper
      className="video-embed-wrapper"
      data-provider={provider}
      data-drag-handle=""
      style={{ display: 'flex', justifyContent, width: '100%' }}
    >
      <div
        ref={containerRef}
        className={`video-embed-container${selected ? ' selected' : ''}`}
        style={{ ...containerStyle, display: 'inline-block' }}
        onMouseEnter={() => {
          const handle = containerRef.current?.querySelector(
            '.video-embed-resize-handle'
          ) as HTMLElement | null
          if (handle) handle.style.opacity = '1'
        }}
        onMouseLeave={() => {
          if (!isResizing && !selected && containerRef.current) {
            const handle = containerRef.current.querySelector(
              '.video-embed-resize-handle'
            ) as HTMLElement | null
            if (handle) handle.style.opacity = '0'
          }
        }}
      >
        <iframe
          src={src}
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Embedded video"
          style={
            isResizing ? { pointerEvents: 'none' as const } : undefined
          }
        />
        <div
          className="video-embed-resize-handle"
          style={handleStyle}
          onMouseDown={handleResizeStart}
          title="拖拽調整寬度"
          contentEditable={false}
        />
        {(selected || isResizing) && effectiveWidth != null && (
          <div
            style={{
              position: 'absolute',
              top: -25,
              left: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              zIndex: 11,
            }}
          >
            {Math.round(effectiveWidth)}px 寬
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
