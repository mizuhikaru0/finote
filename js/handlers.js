import { income, budgets, transactions } from './state.js';
import { saveData } from './db-actions.js';
import { updateUI } from './ui.js';

/**
 * Fungsi helper untuk mengubah string input uang yang mungkin mengandung
 * titik atau koma sebagai pemisah ribuan/desimal menjadi nilai numerik.
 *
 * Logika:
 * - Jika terdapat titik dan koma, simbol yang muncul terakhir dianggap sebagai
 *   pemisah desimal dan yang lainnya dihapus.
 * - Jika hanya ada satu jenis (titik atau koma) dan terdapat tepat dua digit di belakangnya,
 *   dianggap sebagai pemisah desimal; jika tidak, dihapus sebagai pemisah ribuan.
 */
function parseCurrency(value) {
  value = value.trim();
  if (!value) return NaN;
  
  const hasComma = value.indexOf(',') !== -1;
  const hasDot = value.indexOf('.') !== -1;
  
  if (hasComma && hasDot) {
    // Jika keduanya ada, simbol yang muncul terakhir diasumsikan sebagai desimal separator
    if (value.lastIndexOf(',') > value.lastIndexOf('.')) {
      // Contoh: "1.000,50" => hapus titik, ganti koma dengan titik
      value = value.replace(/\./g, '');
      value = value.replace(/,/g, '.');
    } else {
      // Contoh: "1,000.50" => hapus koma
      value = value.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Hanya ada koma
    const parts = value.split(',');
    if (parts.length === 2 && parts[1].length === 2) {
      // Contoh: "100,50" dianggap 100.50
      value = parts.join('.');
    } else {
      // Misal: "100,000" dianggap sebagai 100000
      value = value.replace(/,/g, '');
    }
  } else if (hasDot) {
    // Hanya ada titik
    const parts = value.split('.');
    if (parts.length === 2 && parts[1].length === 2) {
      // Contoh: "100.50" dianggap 100.50
      // Tidak perlu mengubah
    } else {
      // Misal: "100.000" dianggap sebagai 100000
      value = value.replace(/\./g, '');
    }
  }
  
  return parseFloat(value);
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
    saveData();
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
    saveData();
    this.reset();
  });
}

export function setupDarkModeToggle() {
  document.getElementById("toggleMode").addEventListener("click", function() {
    document.body.classList.toggle("dark");
  });
}
