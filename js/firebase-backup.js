// firebase-backup.js

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { income, budgets, transactions } from './state.js';
import { updateUI } from './ui.js';
import { saveData } from './db-actions.js';

const firebaseConfig = {
  apiKey: "AIzaSyBoVj76IqSSZDpiczzw_Vtt2DG5REn1ntg",
  authDomain: "finote-a85bc.firebaseapp.com",
  projectId: "finote-a85bc",
  storageBucket: "finote-a85bc.firebasestorage.app",
  messagingSenderId: "895347670953",
  appId: "1:895347670953:web:5538dd1aa22148fe284eb8",
  measurementId: "G-P3VZF1EJ0W"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const dbFirebase = getFirestore(app);

/**
 * Tampilkan atau sembunyikan loader
 * @param {boolean} show 
 */
function toggleLoader(show) {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = show ? "flex" : "none";
  }
}

/**
 * Fungsi untuk melakukan backup data ke Firebase Firestore.
 */
export async function backupDataToFirebase() {
  toggleLoader(true); // Tampilkan loader
  const data = {
    income: income.value,
    budgets: budgets.value,
    transactions: transactions.value
  };

  try {
    await setDoc(doc(dbFirebase, "backups", "userBackup"), data);
    alert("Backup data berhasil! Data keuanganmu sekarang aman di cloud.");
  } catch (error) {
    console.error("Backup error:", error);
    alert("Backup data gagal: " + error.message);
  } finally {
    toggleLoader(false); // Sembunyikan loader
  }
}

/**
 * Fungsi untuk me-restore data dari Firebase Firestore.
 */
export async function restoreDataFromFirebase() {
  toggleLoader(true); // Tampilkan loader
  try {
    const docRef = doc(dbFirebase, "backups", "userBackup");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      income.value = data.income;
      budgets.value = data.budgets;
      transactions.value = data.transactions;
      updateUI();
      saveData();
      alert("Restore data berhasil! Data keuanganmu telah diperbarui.");
    } else {
      alert("Tidak ada data backup yang ditemukan di cloud.");
    }
  } catch (error) {
    console.error("Restore error:", error);
    alert("Restore data gagal: " + error.message);
  } finally {
    toggleLoader(false); // Sembunyikan loader
  }
}
