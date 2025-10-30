import React, { useState, useRef, useCallback, useEffect } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'

export const ResizableImageComponent: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  selected
}) => {
  const [isResizing, setIsResizing] = useState(false)
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 300,
    height: node.attrs.height || 'auto'
  })

  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const finalWidthRef = useRef<number>(node.attrs.width || 300)
  const imageId = node.attrs.imageId || `img-${Date.now()}`

  // 同步 node 屬性變化
  useEffect(() => {
    setDimensions({
      width: node.attrs.width || 300,
      height: node.attrs.height || 'auto'
    })
  }, [node.attrs.width, node.attrs.height])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsResizing(true)

      const startX = e.clientX
      const startWidth =
        typeof dimensions.width === 'number' ? dimensions.width : 300

      // 取得圖片的原始比例
      const img = imgRef.current
      let aspectRatio = 1
      if (img && img.naturalWidth && img.naturalHeight) {
        aspectRatio = img.naturalWidth / img.naturalHeight
      }

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX
        const newWidth = Math.max(50, startWidth + deltaX)

        // 記錄最新寬度到 ref
        finalWidthRef.current = newWidth

        // 保持比例調整高度
        const newHeight =
          dimensions.height === 'auto'
            ? 'auto'
            : Math.max(30, newWidth / aspectRatio)

        setDimensions({
          width: newWidth,
          height: newHeight
        })

        // 即時更新樣式，使用唯一 ID
        if (containerRef.current) {
          containerRef.current.style.width = `${newWidth}px`
          if (newHeight !== 'auto') {
            containerRef.current.style.height = `${newHeight}px`
          }
        }
      }

      const handleMouseUp = () => {
        setIsResizing(false)

        // 從 ref 取得最新寬度並更新 Tiptap 節點屬性
        const finalWidth = Math.round(finalWidthRef.current)
        updateAttributes({
          width: finalWidth
        })

        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [dimensions, updateAttributes]
  )

  const handleImageLoad = useCallback(() => {
    // 圖片載入完成後，如果高度是 auto，保持 auto 讓 CSS 處理
    if (dimensions.height === 'auto' && imgRef.current) {
      setDimensions((prev) => ({
        ...prev,
        height: 'auto' // 保持 auto，讓 CSS 處理
      }))
    }
  }, [dimensions.width, dimensions.height])

  // 使用 ID 來產生唯一的樣式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: dimensions.width,
    height: dimensions.height === 'auto' ? 'auto' : dimensions.height,
    maxWidth: '100%',
    userSelect: isResizing ? 'none' : 'auto',
    outline: selected ? '2px solid #007bff' : 'none',
    outlineOffset: '2px'
  }

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: dimensions.height === 'auto' ? 'auto' : '100%',
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
    <NodeViewWrapper className='resizable-image-wrapper' data-drag-handle=''>
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
          draggable={false}
        />

        {/* 調整大小手柄 */}
        <div
          className='resize-handle'
          style={handleStyle}
          onMouseDown={handleMouseDown}
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
            {typeof dimensions.width === 'number'
              ? Math.round(dimensions.width)
              : dimensions.width}{' '}
            ×{' '}
            {dimensions.height === 'auto'
              ? 'auto'
              : typeof dimensions.height === 'number'
              ? Math.round(dimensions.height)
              : dimensions.height}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
