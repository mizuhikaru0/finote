import { setupTabs } from './navigation.js';
import { openDB, clearObjectStore } from './db.js';
import { updateUI } from './ui.js';
import { setupIncomeHandler, setupBudgetHandler, setupExpenseHandler, setupDarkModeToggle } from './handlers.js';
import { income, budgets, transactions } from './state.js';
import { saveData, loadData } from './db-actions.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker terdaftar dengan scope:', registration.scope);
      })
      .catch(error => {
        console.log('Pendaftaran ServiceWorker gagal:', error);
      });
  });
}

// Inisialisasi aplikasi
setupTabs();
openDB().then(async () => {
  await loadData(); // Muat data yang tersimpan di IndexedDB
  updateUI();
});

// Setup event handlers
setupIncomeHandler();
setupBudgetHandler();
setupExpenseHandler();
setupDarkModeToggle();

// Fungsi Ekspor Data (JSON) manual melalui tombol
document.getElementById("export-data").addEventListener("click", function() {
  autoExportData();
});

// Memicu input file ketika tombol Impor diklik
document.getElementById("import-data").addEventListener("click", function() {
  document.getElementById("import-file").click();
});

// Fungsi Impor Data (JSON)
document.getElementById("import-file").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData.income !== undefined) {
        income.value = importedData.income;
      }
      if (Array.isArray(importedData.budgets)) {
        budgets.value = importedData.budgets;
      }
      if (Array.isArray(importedData.transactions)) {
        transactions.value = importedData.transactions;
      }
      updateUI();
      saveData();
      alert("Data berhasil diimpor!");
    } catch (err) {
      alert("Terjadi kesalahan saat mengimpor data: " + err.message);
    }
  };
  reader.readAsText(file);
});

// Fungsi Export ke PDF
document.getElementById("export-pdf").addEventListener("click", function() {
  // Pastikan jsPDF sudah dimuat, misalnya melalui CDN di HTML
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  doc.text("Data Keuangan", 10, y);
  y += 10;
  
  if (income.value) {
    doc.text(
      "Pemasukan: Rp " + parseFloat(income.value.amount).toLocaleString('id-ID') +
      " (Tanggal: " + income.value.date + ")",
      10, y
    );
    y += 10;
  }
  
  doc.text("Anggaran:", 10, y);
  y += 10;
  budgets.value.forEach((b, i) => {
    const line = `${i + 1}. ${b.category} - Anggaran: Rp ${b.allocated.toLocaleString('id-ID')}, Terpakai: Rp ${b.spent.toLocaleString('id-ID')}, Periode: ${b.start} s/d ${b.end}`;
    doc.text(line, 10, y);
    y += 10;
    if (y > 280) { // Tambahkan halaman baru jika perlu
      doc.addPage();
      y = 10;
    }
  });
  
  doc.text("Transaksi:", 10, y);
  y += 10;
  transactions.value.forEach((tx, i) => {
    const line = `${i + 1}. ${tx.date} - ${tx.category} - Rp ${tx.amount.toLocaleString('id-ID')}${tx.note ? " (" + tx.note + ")" : ""}`;
    doc.text(line, 10, y);
    y += 10;
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });
  
  const now = new Date();
  const fileName = `data-keuangan-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}.pdf`;
  doc.save(fileName);
});

// Fungsi Export ke Excel (menghasilkan file CSV)
document.getElementById("export-excel").addEventListener("click", function() {
  let csvContent = "";
  
  // Export data Pemasukan
  csvContent += "Pemasukan\n";
  if (income.value) {
    csvContent += "Amount,Tanggal\n";
    csvContent += `${income.value.amount},${income.value.date}\n`;
  } else {
    csvContent += "Tidak ada data\n";
  }
  csvContent += "\n";
  
  // Export data Anggaran
  csvContent += "Anggaran\n";
  csvContent += "Kategori,Anggaran,Terpakai,Sisa,Periode\n";
  budgets.value.forEach(b => {
    const remaining = b.allocated - b.spent;
    csvContent += `${b.category},${b.allocated},${b.spent},${remaining},${b.start} s/d ${b.end}\n`;
  });
  csvContent += "\n";
  
  // Export data Transaksi
  csvContent += "Transaksi\n";
  csvContent += "Tanggal,Kategori,Amount,Note\n";
  transactions.value.forEach(tx => {
    csvContent += `${tx.date},${tx.category},${tx.amount},${tx.note || ""}\n`;
  });
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const now = new Date();
  const fileName = `data-keuangan-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}.csv`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Fungsi Reset Semua Data
document.getElementById("reset-data").addEventListener("click", async function() {
  if (!confirm("Apakah Anda yakin ingin mereset semua data? Tindakan ini tidak dapat dibatalkan.")) {
    return;
  }
  // Reset state di aplikasi
  income.value = null;
  budgets.value = [];
  transactions.value = [];
  // Hapus data di IndexedDB untuk masing-masing store
  try {
    await clearObjectStore("income");
    await clearObjectStore("budgets");
    await clearObjectStore("transactions");
    updateUI();
    alert("Semua data telah direset.");
  } catch (error) {
    alert("Terjadi kesalahan saat mereset data: " + error);
  }
});

// Fungsi auto export data secara otomatis (export ke JSON)
function autoExportData() {
  const data = {
    income: income.value,
    budgets: budgets.value,
    transactions: transactions.value
  };
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const now = new Date();
  const fileName = `data-keuangan-${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}.json`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Ekspos autoExportData ke global agar bisa dipanggil dari handlers.js
window.autoExportData = autoExportData;
