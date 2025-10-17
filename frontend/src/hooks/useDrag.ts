/**
 * Custom hook for handling drag and drop functionality on DOM elements.
 * Provides mouse event handlers and position tracking for draggable components.
 * Used primarily for mind map node positioning and movement.
 *
 * @author Yuri Pedrosa
 */
import { useRef, useEffect } from 'react';

interface UseDragProps {
  initialX: number;
  initialY: number;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
}

export const useDrag = ({ initialX, initialY, onDrag, onDragEnd }: UseDragProps) => {
  const dragStart = useRef({ x: 0, y: 0 });
  const currentPosition = useRef({ x: initialX, y: initialY });
  const isDragging = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentPosition.current = { x: initialX, y: initialY };
    if (nodeRef.current) {
      nodeRef.current.style.left = `${initialX}px`;
      nodeRef.current.style.top = `${initialY}px`;
    }
  }, [initialX, initialY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = false;
    dragStart.current = {
      x: e.clientX - currentPosition.current.x,
      y: e.clientY - currentPosition.current.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      isDragging.current = true;
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      currentPosition.current = { x: newX, y: newY };
      if (nodeRef.current) {
        nodeRef.current.style.left = `${newX}px`;
        nodeRef.current.style.top = `${newY}px`;
      }
      if (onDrag) {
        onDrag(newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current && onDragEnd) {
        onDragEnd(currentPosition.current.x, currentPosition.current.y);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    nodeRef,
    handleMouseDown,
    isDragging: isDragging.current,
  };
};
