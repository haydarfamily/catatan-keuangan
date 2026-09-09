// ===== STATE =====
let saldoAwal = 300000;
let pengeluaran = []; // array of { nama, jumlah }
 
// ===== AMBIL ELEMEN DARI HTML =====
const inputSaldoAwal = document.getElementById("saldoAwal");
const btnSetSaldo = document.getElementById("btnSetSaldo");
 
const inputNama = document.getElementById("namaPengeluaran");
const inputJumlah = document.getElementById("jumlahPengeluaran");
const btnTambah = document.getElementById("btnTambah");
 
const daftarPengeluaranEl = document.getElementById("daftarPengeluaran");
const totalPengeluaranEl = document.getElementById("totalPengeluaran");
const sisaSaldoEl = document.getElementById("sisaSaldo");
 
// ===== FUNGSI FORMAT RUPIAH =====
function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}
 
// ===== FUNGSI UTAMA: RENDER ULANG TAMPILAN =====
function render() {
  // Kosongkan daftar dulu
  daftarPengeluaranEl.innerHTML = "";
 
  // Tampilkan setiap item pengeluaran
  pengeluaran.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="info">
        <span class="nama">${item.nama}</span>
        <span class="jumlah">- ${formatRupiah(item.jumlah)}</span>
      </div>
      <button class="hapus" data-index="${index}">✕</button>
    `;
    daftarPengeluaranEl.appendChild(li);
  });
 
  // Hitung total pengeluaran
  const total = pengeluaran.reduce((acc, item) => acc + item.jumlah, 0);
 
  // Hitung sisa saldo
  const sisa = saldoAwal - total;
 
  // Tampilkan ke halaman
  totalPengeluaranEl.textContent = formatRupiah(total);
  sisaSaldoEl.textContent = formatRupiah(sisa);
 
  // Pasang event listener untuk semua tombol hapus
  document.querySelectorAll(".hapus").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = Number(e.target.getAttribute("data-index"));
      hapusPengeluaran(idx);
    });
  });
}
 
// ===== FUNGSI: SET SALDO AWAL =====
function setSaldoAwal() {
  const nilai = Number(inputSaldoAwal.value);
  if (isNaN(nilai) || nilai < 0) {
    alert("Saldo tidak valid!");
    return;
  }
  saldoAwal = nilai;
  render();
}
 
// ===== FUNGSI: TAMBAH PENGELUARAN =====
function tambahPengeluaran() {
  const nama = inputNama.value.trim();
  const jumlah = Number(inputJumlah.value);
 
  if (nama === "" || isNaN(jumlah) || jumlah <= 0) {
    alert("Isi nama dan jumlah pengeluaran dengan benar!");
    return;
  }
 
  pengeluaran.push({ nama, jumlah });
 
  // Kosongkan input setelah ditambahkan
  inputNama.value = "";
  inputJumlah.value = "";
  inputNama.focus();
 
  render();
}
 
// ===== FUNGSI: HAPUS PENGELUARAN =====
function hapusPengeluaran(index) {
  pengeluaran.splice(index, 1);
  render();
}
 
// ===== EVENT LISTENER =====
btnSetSaldo.addEventListener("click", setSaldoAwal);
btnTambah.addEventListener("click", tambahPengeluaran);
 
// Bonus: bisa tekan Enter di input jumlah untuk menambah
inputJumlah.addEventListener("keydown", (e) => {
  if (e.key === "Enter") tambahPengeluaran();
});
 
// ===== RENDER PERTAMA KALI =====
render();