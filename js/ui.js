import { budgets, income, transactions } from './state.js';
import { updateExpenseChart, updateTransactionChart } from './charts.js';
import { saveData } from './db-actions.js';
import { getBudgetRecommendations, getOverallRecommendation, getSmartBudgetAdvice } from './analytics.js';

export function updateIncomeDisplay() {
  if (income.value) {
    document.getElementById("income-display").innerHTML =
      "Pemasukan Bulanan: Rp " + parseFloat(income.value.amount).toLocaleString('id-ID') +
      " (Tanggal: " + income.value.date + ")";
    document.getElementById("income-input").disabled = true;
    document.getElementById("income-date").disabled = true;
    document.getElementById("income-form").querySelector("button").disabled = true;
    document.getElementById("edit-income").style.display = "inline-block";
  } else {
    document.getElementById("income-display").innerHTML = "";
    document.getElementById("income-input").disabled = false;
    document.getElementById("income-date").disabled = false;
    document.getElementById("income-form").querySelector("button").disabled = false;
    document.getElementById("edit-income").style.display = "none";
  }
}

export function updateBudgetList() {
  const budgetListDiv = document.getElementById("budget-list");
  if (budgets.value.length === 0) {
    budgetListDiv.innerHTML = "<p>Belum ada anggaran yang ditambahkan.</p>";
    return;
  }
  let html = "<table style='width:100%; border-collapse: collapse;'><thead><tr>" +
             "<th>Kategori</th><th>Anggaran</th><th>Terpakai</th><th>Sisa</th><th>Periode</th><th>Aksi</th>" +
             "</tr></thead><tbody>";
  budgets.value.forEach((b, i) => {
    const remaining = b.allocated - b.spent;
    html += `<tr>
               <td>${b.category}</td>
               <td>Rp ${b.allocated.toLocaleString('id-ID')}</td>
               <td>Rp ${b.spent.toLocaleString('id-ID')}</td>
               <td>Rp ${remaining.toLocaleString('id-ID')}</td>
               <td>${b.start} s/d ${b.end}</td>
               <td>
                 <button class="action-btn" onclick="editBudget(${i})">Edit</button>
                 <button class="action-btn" onclick="deleteBudget(${i})">Hapus</button>
               </td>
             </tr>`;
  });
  html += "</tbody></table>";
  budgetListDiv.innerHTML = html;
}

export function updateOverallOverview() {
  const overallIncomeP = document.getElementById("overall-income");
  const overallExpenseP = document.getElementById("overall-expense");
  const overallBalanceP = document.getElementById("overall-balance");
  overallIncomeP.innerHTML = "Pemasukan Bulanan: " +
    (income.value ? "Rp " + parseFloat(income.value.amount).toLocaleString('id-ID') + " (Tanggal: " + income.value.date + ")" : "-");
  const totalExpense = transactions.value.reduce((acc, curr) => acc + curr.amount, 0);
  overallExpenseP.innerHTML = "Total Pengeluaran: Rp " + totalExpense.toLocaleString('id-ID');
  const balance = (income.value ? income.value.amount : 0) - totalExpense;
  overallBalanceP.innerHTML = "Sisa Saldo: Rp " + balance.toLocaleString('id-ID');
}

export function updateExpenseCategoryOptions() {
  const select = document.getElementById("expense-category");
  select.innerHTML = '<option value="">-- Pilih Kategori --</option>';
  budgets.value.forEach(b => {
    const option = document.createElement("option");
    option.value = b.category;
    option.textContent = b.category;
    select.appendChild(option);
  });
}

export function updateTransactionTable() {
  const tbody = document.querySelector("#transaction-table tbody");
  tbody.innerHTML = "";
  transactions.value.forEach((tx, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${tx.date}</td>
      <td>${tx.category}</td>
      <td>Rp ${tx.amount.toLocaleString('id-ID')}</td>
      <td>${tx.note || ""}</td>
      <td>
        <button class="action-btn" onclick="deleteTransaction(${index})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Fungsi global untuk edit dan hapus anggaran
export function editBudget(index) {
  const budget = budgets.value[index];
  const newAllocated = prompt("Masukkan jumlah anggaran baru:", budget.allocated);
  if (newAllocated !== null) {
    budget.allocated = parseFloat(newAllocated);
    updateUI();
    saveData();
  }
}

export function deleteBudget(index) {
  if (confirm("Apakah Anda yakin ingin menghapus anggaran ini?")) {
    budgets.value.splice(index, 1);
    updateUI();
    saveData();
  }
}

// Fungsi global untuk menghapus transaksi
export function deleteTransaction(index) {
  if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
    transactions.value.splice(index, 1);
    updateUI();
    saveData();
  }
}

export function updateRecommendations() {
  const recDiv = document.getElementById("recommendations");
  let recommendations = getBudgetRecommendations();
  let overallRec = getOverallRecommendation();
  let smartAdvice = getSmartBudgetAdvice(); // Dapatkan saran cerdas
  let html = `<h3>Rekomendasi Keuangan</h3>`;
  html += `<p>${overallRec}</p>`;
  
  if (recommendations.length > 0) {
    html += `<ul>`;
    recommendations.forEach(rec => {
      html += `<li>${rec}</li>`;
    });
    html += `</ul>`;
  } else {
    html += `<p>Tidak ada rekomendasi khusus saat ini.</p>`;
  }
  
  // Tambahkan bagian saran cerdas
  html += `<h3>Saran Cerdas untuk Pengelolaan Anggaran</h3>`;
  if (smartAdvice.length > 0) {
    html += `<ul>`;
    smartAdvice.forEach(advice => {
      html += `<li>${advice}</li>`;
    });
    html += `</ul>`;
  } else {
    html += `<p>Tidak ada saran tambahan.</p>`;
  }
  
  recDiv.innerHTML = html;
}

export function updateUI() {
  updateIncomeDisplay();
  updateBudgetList();
  updateOverallOverview();
  updateExpenseCategoryOptions();
  updateExpenseChart();
  updateTransactionChart();
  updateTransactionTable();
  updateRecommendations();
}

// Ekspor fungsi yang perlu diakses secara global agar dapat dipanggil dari HTML
window.editBudget = editBudget;
window.deleteBudget = deleteBudget;
window.deleteTransaction = deleteTransaction;
