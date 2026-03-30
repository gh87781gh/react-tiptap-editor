import React, { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export const ResizableImageComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const [displayWidth, setDisplayWidth] = useState<number>(node.attrs.width || 300)
  const [altText, setAltText] = useState<string>(node.attrs.alt || '')
  const altInputRef = useRef<HTMLInputElement>(null)

  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isResizingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const updateAttributesRef = useRef(updateAttributes)
  updateAttributesRef.current = updateAttributes

  const imageId = node.attrs.imageId || `img-${Date.now()}`

  useEffect(() => {
    if (!isResizingRef.current) {
      setDisplayWidth(node.attrs.width || 300)
    }
  }, [node.attrs.width])

  useEffect(() => {
    setAltText(node.attrs.alt || '')
  }, [node.attrs.alt])

  const handleAltChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAltText(e.target.value)
  }, [])

  const handleAltBlur = useCallback(() => {
    updateAttributes({ alt: altText })
  }, [altText, updateAttributes])

  const handleAltKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      altInputRef.current?.blur()
    }
    e.stopPropagation()
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return
      const deltaX = e.clientX - startXRef.current
      const newWidth = Math.max(50, startWidthRef.current + deltaX)
      setDisplayWidth(newWidth)
      if (containerRef.current) {
        containerRef.current.style.width = `${newWidth}px`
      }
    }

    const onMouseUp = () => {
      if (!isResizingRef.current) return
      isResizingRef.current = false
      setIsResizing(false)

      setDisplayWidth((current) => {
        const finalWidth = Math.round(current)
        updateAttributesRef.current({ width: finalWidth })
        return finalWidth
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
    startWidthRef.current =
      containerRef.current?.getBoundingClientRect().width ?? 300
  }, [])

  const handleImageLoad = useCallback(() => {}, [])

  const textAlign = node.attrs.textAlign || 'left'
  const justifyContent =
    textAlign === 'center'
      ? 'center'
      : textAlign === 'right'
      ? 'flex-end'
      : textAlign === 'justify'
      ? 'flex-start'
      : 'flex-start'

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: displayWidth,
    maxWidth: '100%',
    userSelect: isResizing ? 'none' : 'auto',
    outline: selected ? '2px solid #007bff' : 'none',
    outlineOffset: '2px'
  }

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
    objectFit: 'contain'
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }

  return (
    <NodeViewWrapper
      className='resizable-image-wrapper'
      style={{ display: 'flex', justifyContent }}
    >
      <div
        ref={containerRef}
        id={`resizable-image-${imageId}`}
        style={containerStyle}
        onMouseEnter={() => {
          // 滑鼠懸停時顯示調整手柄
          if (containerRef.current) {
            const handle = containerRef.current.querySelector(
              '.resize-handle'
            ) as HTMLElement
            if (handle) {
              handle.style.opacity = '1'
            }
          }
        }}
        onMouseLeave={() => {
          // 滑鼠離開時隱藏調整手柄（除非正在調整大小或被選中）
          if (!isResizing && !selected && containerRef.current) {
            const handle = containerRef.current.querySelector(
              '.resize-handle'
            ) as HTMLElement
            if (handle) {
              handle.style.opacity = '0'
            }
          }
        }}
      >
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          style={imageStyle}
          onLoad={handleImageLoad}
          data-drag-handle=''
          draggable={false}
        />

        {/* 調整大小手柄 */}
        <div
          className='resize-handle'
          style={handleStyle}
          onMouseDown={handleResizeStart}
          title='拖拽調整圖片大小'
        />

        {/* 顯示當前尺寸 */}
        {(selected || isResizing) && (
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
              zIndex: 11
            }}
          >
            {Math.round(displayWidth)} × auto
          </div>
        )}

        {selected && (
          <div className='resizable-image-alt-input'>
            <input
              ref={altInputRef}
              type='text'
              value={altText}
              onChange={handleAltChange}
              onBlur={handleAltBlur}
              onKeyDown={handleAltKeyDown}
              placeholder='Add alt text…'
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
