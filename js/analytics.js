import { budgets, transactions, income } from './state.js';

export function getBudgetRecommendations() {
  let recommendations = [];
  budgets.value.forEach(budget => {
    let percentageUsed = budget.allocated ? (budget.spent / budget.allocated) * 100 : 0;
    if (percentageUsed > 90) {
      recommendations.push(
        `Anda telah menggunakan ${percentageUsed.toFixed(0)}% dari anggaran untuk ${budget.category}. Pertimbangkan mengurangi pengeluaran di kategori ini.`
      );
    } else if (percentageUsed < 50) {
      recommendations.push(
        `Penggunaan anggaran untuk ${budget.category} masih rendah (${percentageUsed.toFixed(0)}%). Evaluasi apakah anggaran sudah sesuai dengan kebutuhan.`
      );
    }
  });
  return recommendations;
}

export function getOverallRecommendation() {
  let totalSpending = transactions.value.reduce((acc, curr) => acc + curr.amount, 0);
  let totalIncome = income.value ? income.value.amount : 0;
  let remaining = totalIncome - totalSpending;
  let rec = "";
  if (totalIncome === 0) {
    rec = "Belum ada data pemasukan, silakan input pemasukan terlebih dahulu.";
  } else if (remaining < totalIncome * 0.1) {
    rec = "Pengeluaran Anda sudah hampir mencapai batas pemasukan. Pertimbangkan mengurangi pengeluaran atau meningkatkan pemasukan.";
  } else if (remaining > totalIncome * 0.3) {
    rec = "Keuangan Anda dalam kondisi baik. Anda memiliki sisa yang cukup untuk ditabung atau diinvestasikan.";
  } else {
    rec = "Keuangan Anda stabil, namun tetap perhatikan pengeluaran agar tidak melebihi anggaran.";
  }
  return rec;
}

/**
 * Fungsi cerdas untuk memberikan saran pengelolaan anggaran secara efisien dan bijak.
 * Logika ini menganalisis:
 * 1. Persentase tabungan dari pemasukan.
 * 2. Penggunaan anggaran per kategori.
 * 3. Rata-rata pengeluaran per transaksi.
 */
export function getSmartBudgetAdvice() {
  const advice = [];
  
  // Cek apakah data pemasukan sudah ada
  if (!income.value || income.value.amount <= 0) {
    advice.push("Silakan masukkan data pemasukan terlebih dahulu untuk mendapatkan saran pengelolaan anggaran yang tepat.");
    return advice;
  }
  
  const totalIncome = income.value.amount;
  const totalSpent = transactions.value.reduce((acc, tx) => acc + tx.amount, 0);
  const savings = totalIncome - totalSpent;
  const savingsRate = (savings / totalIncome) * 100;
  
  // Saran terkait tabungan
  if (savingsRate < 20) {
    advice.push("Anda menyisakan kurang dari 20% dari pemasukan sebagai tabungan. Pertimbangkan untuk mengurangi pengeluaran atau meningkatkan pemasukan.");
  } else if (savingsRate < 30) {
    advice.push("Tabungan Anda cukup, namun masih bisa ditingkatkan untuk mencapai kestabilan keuangan yang lebih baik.");
  } else {
    advice.push("Tabungan Anda sudah memadai.");
  }
  
  // Saran per kategori anggaran
  budgets.value.forEach(budget => {
    const percentageUsed = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
    if (percentageUsed > 90) {
      advice.push(`Penggunaan anggaran untuk kategori ${budget.category} sudah sangat tinggi (${percentageUsed.toFixed(0)}%). Pertimbangkan pengurangan pengeluaran atau penyesuaian anggaran.`);
    } else if (percentageUsed >= 50 && percentageUsed <= 90) {
      advice.push(`Kategori ${budget.category} sudah mencapai penggunaan anggaran sebesar ${percentageUsed.toFixed(0)}%. Jaga agar pengeluaran tidak terus meningkat.`);
    } else if (percentageUsed < 50 && percentageUsed > 0) {
      advice.push(`Kategori ${budget.category} masih rendah dalam penggunaan anggaran (${percentageUsed.toFixed(0)}%). Evaluasi kembali apakah alokasi anggaran sudah sesuai dengan kebutuhan.`);
    }
  });
  
  // Saran tambahan berdasarkan pola transaksi
  if (transactions.value.length > 0) {
    const averageExpense = totalSpent / transactions.value.length;
    advice.push(`Rata-rata pengeluaran per transaksi: Rp ${averageExpense.toLocaleString('id-ID')}. Pertimbangkan untuk mencatat dan mengelompokkan transaksi agar pengelolaan anggaran lebih efisien.`);
  }
  
  return advice;
}
