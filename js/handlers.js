import { income, budgets, transactions } from './state.js';
import { saveData } from './db-actions.js';
import { updateUI } from './ui.js';

/**
 * Fungsi helper untuk mengubah string input uang ke angka.
 * Mendukung format dengan titik atau koma, misalnya "100.000" dan "100,000".
 */
function parseCurrency(value) {
  value = value.trim();
  if (!value) return NaN;
  
  const hasComma = value.indexOf(',') !== -1;
  const hasDot = value.indexOf('.') !== -1;
  
  if (hasComma && hasDot) {
    // Jika keduanya ada, simbol yang muncul terakhir diasumsikan sebagai desimal separator
    if (value.lastIndexOf(',') > value.lastIndexOf('.')) {
      value = value.replace(/\./g, '');
      value = value.replace(/,/g, '.');
    } else {
      value = value.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = value.split(',');
    if (parts.length === 2 && parts[1].length === 2) {
      value = parts.join('.');
    } else {
      value = value.replace(/,/g, '');
    }
  } else if (hasDot) {
    const parts = value.split('.');
    if (!(parts.length === 2 && parts[1].length === 2)) {
      value = value.replace(/\./g, '');
    }
  }
  return parseFloat(value);
}

// Fungsi untuk auto-export data melalui window.autoExportData, jika tersedia, dengan konfirmasi modal
function autoExport() {
  if (window.autoExportData) {
    if (confirm("Apakah Anda ingin mengekspor data secara otomatis?")) {
      window.autoExportData();
    }
  }
}

export function setupIncomeHandler() {
  document.getElementById("income-form").addEventListener("submit", function(e) {
    e.preventDefault();
    if (income.value !== null) {
      alert("Pemasukan sudah diinput. Gunakan tombol Edit untuk mengubah.");
      return;
    }
    const amountInput = document.getElementById("income-input").value;
    const amount = parseCurrency(amountInput);
    const date = document.getElementById("income-date").value;
    if (isNaN(amount) || !date) {
      alert("Mohon masukkan nilai pemasukan dan tanggal yang valid.");
      return;
    }
    // Tambahkan properti id agar sesuai dengan keyPath di IndexedDB
    income.value = { id: "income", amount: amount, date: date };
    updateUI();
    saveData().then(() => {
      autoExport();
    });
  });

  document.getElementById("edit-income").addEventListener("click", function() {
    document.getElementById("income-input").disabled = false;
    document.getElementById("income-date").disabled = false;
    document.getElementById("income-form").querySelector("button").disabled = false;
    income.value = null;
    document.getElementById("income-display").innerHTML = "";
    this.style.display = "none";
    saveData().then(() => {
      autoExport();
    });
  });
}

export function setupBudgetHandler() {
  document.getElementById("budget-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const category = document.getElementById("budget-category").value.trim();
    const allocatedInput = document.getElementById("budget-amount").value;
    const allocated = parseCurrency(allocatedInput);
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
    saveData().then(() => {
      autoExport();
    });
    this.reset();
  });
}

export function setupExpenseHandler() {
  document.getElementById("expense-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const category = document.getElementById("expense-category").value;
    const amountInput = document.getElementById("expense-amount").value;
    const amount = parseCurrency(amountInput);
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
    saveData().then(() => {
      autoExport();
    });
    this.reset();
  });
}

export function setupDarkModeToggle() {
  document.getElementById("toggleMode").addEventListener("click", function() {
    document.body.classList.toggle("dark");
  });
}
