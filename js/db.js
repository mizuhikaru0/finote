export let db = null;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("financeManagerDB", 1);
    request.onupgradeneeded = function(e) {
      db = e.target.result;
      if (!db.objectStoreNames.contains("income")) {
        // Untuk income, gunakan key "income"
        db.createObjectStore("income", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("budgets")) {
        db.createObjectStore("budgets", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("transactions")) {
        db.createObjectStore("transactions", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = function(e) {
      db = e.target.result;
      resolve(db);
    };
    request.onerror = function(e) {
      reject(e);
    };
  });
}

export function clearObjectStore(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e);
  });
}
