import { budgets, transactions } from './state.js';

let expenseChart, transactionChart;

export function updateExpenseChart() {
  const ctx = document.getElementById("expenseChart").getContext('2d');
  const labels = budgets.value.map(b => b.category);
  const spentData = budgets.value.map(b => b.spent);
  const allocatedData = budgets.value.map(b => b.allocated);
  const data = {
    labels: labels,
    datasets: [{
      label: 'Terpakai',
      data: spentData,
      backgroundColor: 'rgba(255,99,132,0.6)'
    },
    {
      label: 'Anggaran',
      data: allocatedData,
      backgroundColor: 'rgba(54,162,235,0.6)'
    }]
  };
  if (expenseChart) {
    expenseChart.data = data;
    expenseChart.update();
  } else {
    expenseChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}

export function updateTransactionChart() {
  let dailyTotals = {};
  transactions.value.forEach(tx => {
    dailyTotals[tx.date] = (dailyTotals[tx.date] || 0) + tx.amount;
  });
  const dates = Object.keys(dailyTotals).sort();
  const totals = dates.map(date => dailyTotals[date]);
  
  const ctx = document.getElementById("transactionChart").getContext('2d');
  const data = {
    labels: dates,
    datasets: [{
      label: 'Pengeluaran Harian',
      data: totals,
      fill: false,
      borderColor: 'rgba(75,192,192,1)',
      tension: 0.1
    }]
  };
  if (transactionChart) {
    transactionChart.data = data;
    transactionChart.update();
  } else {
    transactionChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        scales: {
          x: {
            type: 'category',
            title: { display: true, text: 'Tanggal' }
          },
          y: { beginAtZero: true }
        }
      }
    });
  }
}
