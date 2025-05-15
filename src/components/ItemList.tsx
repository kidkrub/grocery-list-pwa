import SwipeableItem from "./SwipeableItem";
import { type GroceryItem } from "../types/groceryItem";

interface ItemListProps {
  items: GroceryItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  emptyMessage?: string;
}

const ItemList = ({
  items,
  onEdit,
  onDelete,
  onToggleCompleted,
  emptyMessage = "No items",
}: ItemListProps) => {
  items = items.sort((a, b) =>
    a.completed === b.completed ? 0 : a.completed ? 1 : -1
  );
  const groupedItems = items.reduce(
    (acc: { [key: string]: GroceryItem[] }, item) => {
      if (item.completed) {
        acc.completed.push(item);
      } else {
        acc.incomplete.push(item);
      }
      return acc;
    },
    { completed: [], incomplete: [] }
  );

  return (
    <>
      {groupedItems.incomplete.length !== 0 ||
      groupedItems.completed.length !== 0 ? (
        <>
          {groupedItems.incomplete.length !== 0 && (
            <div className="bg-white">
              {groupedItems.incomplete.map((item) => (
                <SwipeableItem
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onToggleCompleted={onToggleCompleted}
                  item={item}
                  key={item.id}
                />
              ))}
            </div>
          )}
          {groupedItems.completed.length !== 0 && (
            <div className="bg-white">
              <div className="flex items-center">
                <div className="flex-grow h-px bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300"></div>
                <span className="px-4 text-gray-700 font-medium">★</span>
                <div className="flex-grow h-px bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300"></div>
              </div>

              {groupedItems.completed.map((item) => (
                <SwipeableItem
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onToggleCompleted={onToggleCompleted}
                  item={item}
                  key={item.id}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center">{emptyMessage}</div>
      )}
    </>
  );
};

export default ItemList;
