import { db, clearObjectStore } from './db.js';
import { income, budgets, transactions } from './state.js';

export async function saveData() {
  if (!db) return;
  
  // Simpan data income
  const txIncome = db.transaction("income", "readwrite");
  const storeIncome = txIncome.objectStore("income");
  if (income.value) {
    const data = { ...income.value, id: "income" };
    storeIncome.put(data);
  }
  await new Promise((resolve, reject) => {
    txIncome.oncomplete = resolve;
    txIncome.onerror = reject;
  });

  // Simpan data budgets: bersihkan terlebih dahulu, kemudian tambahkan semua data
  await clearObjectStore("budgets");
  const txBudgets = db.transaction("budgets", "readwrite");
  const storeBudgets = txBudgets.objectStore("budgets");
  budgets.value.forEach(b => {
    storeBudgets.add(b);
  });
  await new Promise((resolve, reject) => {
    txBudgets.oncomplete = resolve;
    txBudgets.onerror = reject;
  });

  // Simpan data transactions: bersihkan terlebih dahulu, kemudian tambahkan semua data
  await clearObjectStore("transactions");
  const txTransactions = db.transaction("transactions", "readwrite");
  const storeTransactions = txTransactions.objectStore("transactions");
  transactions.value.forEach(t => {
    storeTransactions.add(t);
  });
  await new Promise((resolve, reject) => {
    txTransactions.oncomplete = resolve;
    txTransactions.onerror = reject;
  });
}

export async function loadData() {
  if (!db) return;

  // Muat data income
  const txIncome = db.transaction("income", "readonly");
  const storeIncome = txIncome.objectStore("income");
  const incomeData = await new Promise((resolve, reject) => {
    const req = storeIncome.get("income");
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
  if (incomeData) {
    income.value = incomeData;
  }

  // Muat data budgets
  const txBudgets = db.transaction("budgets", "readonly");
  const storeBudgets = txBudgets.objectStore("budgets");
  const budgetsData = await new Promise((resolve, reject) => {
    const req = storeBudgets.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
  budgets.value = budgetsData || [];

  // Muat data transactions
  const txTransactions = db.transaction("transactions", "readonly");
  const storeTransactions = txTransactions.objectStore("transactions");
  const transactionsData = await new Promise((resolve, reject) => {
    const req = storeTransactions.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
  transactions.value = transactionsData || [];
}
