// js/analytics.js
import { budgets, transactions, income } from './state.js';

export function getBudgetRecommendations() {
  let recommendations = [];
  budgets.value.forEach(budget => {
    let percentageUsed = budget.allocated ? (budget.spent / budget.allocated) * 100 : 0;
    if (percentageUsed > 90) {
      recommendations.push(`Anda telah menggunakan ${percentageUsed.toFixed(0)}% dari anggaran untuk ${budget.category}. Pertimbangkan mengurangi pengeluaran di kategori ini.`);
    } else if (percentageUsed < 50) {
      recommendations.push(`Penggunaan anggaran untuk ${budget.category} masih rendah (${percentageUsed.toFixed(0)}%). Evaluasi apakah anggaran sudah sesuai dengan kebutuhan.`);
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
