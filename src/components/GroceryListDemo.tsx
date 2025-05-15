import { useEffect, useState } from "react";
import ItemList from "./ItemList";
import { type GroceryItem } from "../types/groceryItem";
import { ItemModal } from "./ItemModal";
import { nanoid } from "nanoid";
import {
  addItem,
  deleteItem,
  getAllFromStore,
  putItem,
} from "../utilities/idb";

const GroceryListDemo = () => {
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<GroceryItem | null>(null);

  useEffect(() => {
    (async () => {
      const allItems = await getAllFromStore<GroceryItem>();
      setGroceries(allItems);
    })();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    setGroceries(groceries.filter((item) => item.id !== id));
    setStatusMessage(`Item removed from list`);
    setTimeout(() => setStatusMessage(null), 2000);
  };

  const handleToggleCompleted = async (id: string) => {
    const item = groceries.find((i) => i.id === id);
    if (!item) return;
    const updated: GroceryItem = { ...item, completed: !item.completed };
    await putItem(updated);
    setGroceries((prev) => prev.map((i) => (i.id === id ? updated : i)));
  };

  const handleEdit = (id: string) => {
    const item = groceries.find((item) => item.id === id);
    if (item) {
      setEditItem(item);
      setIsModalOpen(true);
    }
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const handleSaveItem = async (
    item: Omit<GroceryItem, "id"> | GroceryItem
  ) => {
    if ("id" in item) {
      await putItem(item);
      setGroceries((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      setStatusMessage("Item edtied");
    } else {
      const newItem: GroceryItem = { ...item, id: nanoid() };
      await addItem(newItem);
      setGroceries((prev) => [...prev, newItem]);
      setStatusMessage("Item added");
    }
    setIsModalOpen(false);
    setEditItem(null);
    setTimeout(() => setStatusMessage(null), 2000);
  };

  return (
    <div className="max-w mx-auto bg-gray-100 h-full">
      <div className="bg-sky-400 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Grocery List</h1>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditItem(null);
                setIsModalOpen(true);
              }}
              className="fixed bottom-5 right-5 bg-sky-400 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg hover:bg-blue-600 hover:translate-y-1 transition-all"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <>
        <ItemList
          items={groceries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleCompleted={handleToggleCompleted}
          emptyMessage="Your grocery list is empty"
        />

        {groceries.length > 0 && (
          <div className="p-3 bg-white border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {groceries.filter((item) => item.completed).length} of{" "}
              {groceries.length} item{groceries.length > 1 && "s"} bought
            </p>
          </div>
        )}
      </>
      {statusMessage && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-md">
            {statusMessage}
          </div>
        </div>
      )}
      <div className="p-4 bg-gray-100 text-center text-gray-600 text-sm">
        <p>Swipe right to edit item</p>
        <p>Swipe left to delete item</p>
        <p>Tap on an item to mark as bought</p>
      </div>
      {isModalOpen && (
        <ItemModal
          item={editItem}
          onClose={handleCancelEdit}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};

export default GroceryListDemo;
