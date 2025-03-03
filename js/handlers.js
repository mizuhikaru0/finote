import { income, budgets, transactions } from './state.js';
import { saveData } from './db-actions.js';
import { updateUI } from './ui.js';

export function setupIncomeHandler() {
  document.getElementById("income-form").addEventListener("submit", function(e) {
    e.preventDefault();
    if (income.value !== null) {
      alert("Pemasukan sudah diinput. Gunakan tombol Edit untuk mengubah.");
      return;
    }
    const amount = parseFloat(document.getElementById("income-input").value);
    const date = document.getElementById("income-date").value;
    if (isNaN(amount) || !date) {
      alert("Mohon masukkan nilai pemasukan dan tanggal yang valid.");
      return;
    }
    // Tambahkan properti id agar sesuai dengan keyPath di IndexedDB
    income.value = { id: "income", amount: amount, date: date };
    updateUI();
    saveData();
  });

  document.getElementById("edit-income").addEventListener("click", function() {
    document.getElementById("income-input").disabled = false;
    document.getElementById("income-date").disabled = false;
    document.getElementById("income-form").querySelector("button").disabled = false;
    income.value = null;
    document.getElementById("income-display").innerHTML = "";
    this.style.display = "none";
    saveData();
  });
}

export function setupBudgetHandler() {
  document.getElementById("budget-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const category = document.getElementById("budget-category").value.trim();
    const allocated = parseFloat(document.getElementById("budget-amount").value);
    const start = document.getElementById("budget-start").value;
    const end = document.getElementById("budget-end").value;
    if (!category || isNaN(allocated) || !start || !end) {
      alert("Mohon lengkapi data anggaran dengan benar.");
      return;
    }
    const newBudget = {
      category: category,
      allocated: allocated,
      spent: 0,
      start: start,
      end: end
    };
    budgets.value.push(newBudget);
    updateUI();
    saveData();
    this.reset();
  });
}

export function setupExpenseHandler() {
  document.getElementById("expense-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const category = document.getElementById("expense-category").value;
    const amount = parseFloat(document.getElementById("expense-amount").value);
    const date = document.getElementById("expense-date").value;
    const note = document.getElementById("expense-note").value;
    if (!category || isNaN(amount) || !date) {
      alert("Mohon lengkapi data pengeluaran dengan benar.");
      return;
    }
    // Perbarui nilai pengeluaran pada anggaran yang sesuai
    const budget = budgets.value.find(b => b.category === category);
    if (budget) {
      budget.spent += amount;
    }
    const newTransaction = {
      category: category,
      amount: amount,
      date: date,
      note: note
    };
    transactions.value.push(newTransaction);
    updateUI();
    saveData();
    this.reset();
  });
}

export function setupDarkModeToggle() {
  document.getElementById("toggleMode").addEventListener("click", function() {
    document.body.classList.toggle("dark");
  });
}
