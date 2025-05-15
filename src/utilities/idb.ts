const DB_NAME = "itemsStorage";
const OBJECT_STORES = "items";
const stores = [{ name: OBJECT_STORES, options: { keyPath: "id" } }];

async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject("Erroring opening IndexedDB");

    request.onupgradeneeded = (event) => {
      const target = event.target as IDBRequest;
      const db: IDBDatabase = target.result;
      for (const store of stores) {
        if (db.objectStoreNames.contains(store.name)) continue;

        db.createObjectStore(store.name, store.options || {});
      }
    };

    request.onsuccess = () => resolve(request.result);
  });
}

export const getAllFromStore = async <T = unknown>(): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OBJECT_STORES);
    const store = tx.objectStore(OBJECT_STORES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
};

export const addItem = async <T = unknown>(value: T): Promise<IDBValidKey> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OBJECT_STORES, "readwrite");
    const store = tx.objectStore(OBJECT_STORES);
    const request = store.add(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const putItem = async <T = unknown>(value: T): Promise<IDBValidKey> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OBJECT_STORES, "readwrite");
    const store = tx.objectStore(OBJECT_STORES);
    const request = store.put(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteItem = async (key: IDBValidKey): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OBJECT_STORES, "readwrite");
    const store = tx.objectStore(OBJECT_STORES);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};
