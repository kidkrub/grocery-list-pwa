import { useState, useRef, useEffect } from "react";
import { type GroceryItem } from "../types/groceryItem";

interface SwipeableItemProps {
  item: GroceryItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

const SwipeableItem = ({
  item,
  onEdit,
  onDelete,
  onToggleCompleted,
}: SwipeableItemProps) => {
  const [translation, setTranslation] = useState(0);
  const [showLeftAction, setShowLeftAction] = useState(false);
  const [showRightAction, setShowRightAction] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const swipingRef = useRef(false);

  const RIGHT_THRESHOLD = 70;
  const LEFT_THRESHOLD = -70;
  const MAX_RIGHT_REVEAL = 100;
  const MAX_LEFT_REVEAL = -100;

  const resetPosition = () => {
    setTranslation(0);
    setShowLeftAction(false);
    setShowRightAction(false);
  };

  const handleDragStart = (clientX: number) => {
    swipingRef.current = true;
    startXRef.current = clientX;
    currentXRef.current = clientX;
  };

  const handleDragMove = (clientX: number) => {
    if (!swipingRef.current) return;

    currentXRef.current = clientX;
    const diff = currentXRef.current - startXRef.current;

    let newTranslation = diff;
    if (diff > MAX_RIGHT_REVEAL) newTranslation = MAX_RIGHT_REVEAL;
    if (diff < MAX_LEFT_REVEAL) newTranslation = MAX_LEFT_REVEAL;

    setTranslation(newTranslation);

    if (newTranslation > RIGHT_THRESHOLD) {
      setShowRightAction(true);
      setShowLeftAction(false);
    } else if (newTranslation < LEFT_THRESHOLD) {
      setShowLeftAction(true);
      setShowRightAction(false);
    } else {
      setShowLeftAction(false);
      setShowRightAction(false);
    }
  };

  const handleDragEnd = () => {
    swipingRef.current = false;

    if (translation > RIGHT_THRESHOLD) {
      setTranslation(MAX_RIGHT_REVEAL);
      setShowRightAction(true);
    } else if (translation < LEFT_THRESHOLD) {
      setTranslation(MAX_LEFT_REVEAL);
      setShowLeftAction(true);
    } else {
      resetPosition();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (swipingRef.current) {
      handleDragMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  const handleMouseLeave = () => {
    if (swipingRef.current) {
      handleDragEnd();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  const handleDelete = () => {
    onDelete(item.id);
    resetPosition();
  };

  const handleEdit = () => {
    onEdit(item.id);
    resetPosition();
  };

  const handleClick = () => {
    if (translation === 0) {
      onToggleCompleted(item.id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        resetPosition();
      }
    };

    if (showLeftAction || showRightAction) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showLeftAction, showRightAction]);

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute right-0 top-0 h-full flex items-center"
        style={{ width: Math.abs(MAX_LEFT_REVEAL) }}
      >
        <button
          className="h-full w-full bg-red-500 flex items-center justify-center"
          onClick={handleDelete}
        >
          <span className="ml-2 text-white">Delete</span>
        </button>
      </div>

      <div
        className="absolute left-0 top-0 h-full flex items-center"
        style={{ width: MAX_RIGHT_REVEAL }}
      >
        <button
          className="h-full w-full bg-blue-500 flex items-center justify-center"
          onClick={handleEdit}
        >
          <span className="ml-2 text-white">Edit</span>
        </button>
      </div>

      <div
        ref={itemRef}
        className={`relative bg-white border-b border-gray-200 p-4 touch-manipulation select-none transform transition-transform ${
          !swipingRef.current ? "duration-300" : "duration-0"
        }`}
        style={{ transform: `translateX(${translation}px)` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-center w-full">
          <div
            className={`w-6 h-6 rounded-full border mr-3 flex-shrink-0 flex items-center justify-center ${
              item.completed
                ? "bg-green-500 border-green-500"
                : "border-gray-300"
            }`}
          >
            {item.completed && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center">
              <h3
                className={`text-base font-medium ${
                  item.completed
                    ? "text-gray-400 line-through"
                    : "text-gray-800"
                }`}
              >
                {item.name}
              </h3>
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {item.category}
              </span>
            </div>

            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500 mr-3">
                Qty: {item.quantity}
              </span>
              {item.notes && (
                <p className="text-sm text-gray-500 truncate">{item.notes}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeableItem;
