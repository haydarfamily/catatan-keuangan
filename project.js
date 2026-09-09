const DATA_KEY = "catatan-keuangan-akun-v1";
const THEME_KEY = "catatan-keuangan-tema-v1";

let akun = [];
let akunAktifId = "";
let modeAktif = "pengeluaran";
let temaAktif = "dark";

const inputBulan = document.getElementById("pilihBulan");
const inputTanggal = document.getElementById("tanggalPengeluaran");
const inputNama = document.getElementById("namaPengeluaran");
const inputJumlah = document.getElementById("jumlahPengeluaran");
const inputFoto = document.getElementById("fotoStruk");
const btnTambah = document.getElementById("btnTambah");
const daftarEl = document.getElementById("daftarPengeluaran");
const totalPengeluaranEl = document.getElementById("totalPengeluaran");
const totalPemasukanEl = document.getElementById("totalPemasukan");
const sisaSaldoEl = document.getElementById("sisaSaldo");
const modePengeluaran = document.getElementById("modePengeluaran");
const modePemasukan = document.getElementById("modePemasukan");
const btnMenu = document.getElementById("btnMenu");
const menuPanel = document.getElementById("menuPanel");
const menuTitle = document.getElementById("menuTitle");
const profilSubjudul = document.getElementById("profilSubjudul");
const namaProfilMini = document.getElementById("namaProfilMini");
const fotoProfilMini = document.getElementById("fotoProfilMini");
const fotoProfilMenu = document.getElementById("fotoProfilMenu");
const namaPengguna = document.getElementById("namaPengguna");
const tanggalLahir = document.getElementById("tanggalLahir");
const statusProfil = document.getElementById("statusProfil");
const pekerjaanProfil = document.getElementById("pekerjaanProfil");
const deskripsiProfil = document.getElementById("deskripsiProfil");
const fotoProfil = document.getElementById("fotoProfil");
const btnSimpanProfil = document.getElementById("btnSimpanProfil");
const pilihAkun = document.getElementById("pilihAkun");
const btnBeralihAkun = document.getElementById("btnBeralihAkun");
const btnTambahAkun = document.getElementById("btnTambahAkun");
const temaGelap = document.getElementById("temaGelap");
const temaTerang = document.getElementById("temaTerang");
const menuTotalPemasukan = document.getElementById("menuTotalPemasukan");
const menuTotalPengeluaran = document.getElementById("menuTotalPengeluaran");
const menuSisaSaldo = document.getElementById("menuSisaSaldo");

function tanggalHariIni() {
  const sekarang = new Date();
  const offset = sekarang.getTimezoneOffset() * 60000;
  return new Date(sekarang.getTime() - offset).toISOString().slice(0, 10);
}

function bulanDariTanggal(tanggal) {
  return tanggal.slice(0, 7);
}

function formatRupiah(angka) {
  return "Rp" + Number(angka).toLocaleString("id-ID");
}

function formatTanggal(tanggal) {
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function buatId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function akunKosong(nama = "Profil saya") {
  return {
    id: buatId(),
    nama,
    foto: "",
    tanggalLahir: "",
    status: "Pelajar / Mahasiswa",
    pekerjaan: "",
    deskripsi: "",
    pemasukan: [],
    pengeluaran: []
  };
}

function akunAktif() {
  return akun.find((item) => item.id === akunAktifId) || akun[0];
}

function simpanData() {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify({ akun, akunAktifId }));
    return true;
  } catch (error) {
    alert("Catatan belum tersimpan karena penyimpanan browser penuh. Hapus foto lama atau data yang tidak diperlukan.");
    return false;
  }
}

function muatData() {
  try {
    localStorage.removeItem("catatan-keuangan-tampilan-v1");
    const data = JSON.parse(localStorage.getItem(DATA_KEY));
    if (data && Array.isArray(data.akun) && data.akun.length) {
      akun = data.akun.map((item) => ({
        ...akunKosong(item.nama || "Profil saya"),
        ...item,
        pemasukan: Array.isArray(item.pemasukan) ? item.pemasukan : [],
        pengeluaran: Array.isArray(item.pengeluaran) ? item.pengeluaran : []
      }));
      akunAktifId = data.akunAktifId || akun[0].id;
      return;
    }

    const lama = JSON.parse(localStorage.getItem("catatan-keuangan-v2"));
    const profilPertama = akunKosong("Profil saya");
    profilPertama.pemasukan = Array.isArray(lama?.pemasukan) ? lama.pemasukan : [];
    profilPertama.pengeluaran = Array.isArray(lama?.pengeluaran) ? lama.pengeluaran : [];
    akun = [profilPertama];
    akunAktifId = profilPertama.id;
    simpanData();
  } catch (error) {
    const profilPertama = akunKosong();
    akun = [profilPertama];
    akunAktifId = profilPertama.id;
  }
}

function simpanTema() {
  localStorage.setItem(THEME_KEY, temaAktif);
}

function terapkanTema() {
  document.body.classList.toggle("tema-dark", temaAktif === "dark");
  document.body.classList.toggle("tema-terang", temaAktif === "light");
  temaGelap.classList.toggle("aktif", temaAktif === "dark");
  temaTerang.classList.toggle("aktif", temaAktif === "light");
}

function muatTema() {
  temaAktif = localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  terapkanTema();
}

function fotoKecil(file, batas = 700, kualitas = 0.75) {
  return new Promise((resolve, reject) => {
    const pembaca = new FileReader();
    pembaca.onload = () => {
      const gambar = new Image();
      gambar.onload = () => {
        const skala = Math.min(1, batas / Math.max(gambar.width, gambar.height));
        const kanvas = document.createElement("canvas");
        kanvas.width = Math.round(gambar.width * skala);
        kanvas.height = Math.round(gambar.height * skala);
        kanvas.getContext("2d").drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
        resolve(kanvas.toDataURL("image/jpeg", kualitas));
      };
      gambar.onerror = reject;
      gambar.src = pembaca.result;
    };
    pembaca.onerror = reject;
    pembaca.readAsDataURL(file);
  });
}

function tampilkanProfil() {
  const profil = akunAktif();
  if (!profil) return;
  const foto = profil.foto || "";
  namaProfilMini.textContent = profil.nama || "Profil";
  menuTitle.textContent = profil.nama || "Profil";
  profilSubjudul.textContent = profil.status || "Kelola akun dan preferensi";
  namaPengguna.value = profil.nama;
  tanggalLahir.value = profil.tanggalLahir;
  statusProfil.value = profil.status;
  pekerjaanProfil.value = profil.pekerjaan;
  deskripsiProfil.value = profil.deskripsi;
  [fotoProfilMini, fotoProfilMenu].forEach((gambar) => {
    gambar.src = foto || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' rx='40' fill='%233d7667'/%3E%3Ctext x='40' y='48' text-anchor='middle' fill='white' font-size='28'%3EP%3C/text%3E%3C/svg%3E";
  });
}

function tampilkanPilihanAkun() {
  pilihAkun.innerHTML = "";
  akun.forEach((profil) => {
    const pilihan = document.createElement("option");
    pilihan.value = profil.id;
    pilihan.textContent = profil.nama || "Profil tanpa nama";
    pilihan.selected = profil.id === akunAktifId;
    pilihAkun.appendChild(pilihan);
  });
}

function totalBulan(daftar, bulan) {
  return daftar
    .filter((item) => item.tanggal && bulanDariTanggal(item.tanggal) === bulan)
    .reduce((total, item) => total + Number(item.jumlah), 0);
}

function buatTransaksi(item) {
  const li = document.createElement("li");
  const info = document.createElement("div");
  const nama = document.createElement("span");
  const jumlah = document.createElement("span");
  const hapus = document.createElement("button");
  const jenis = item.jenis || modeAktif;

  li.className = jenis;
  info.className = "info";
  nama.className = "nama";
  nama.textContent = item.nama;
  jumlah.className = "jumlah";
  jumlah.textContent = `${jenis === "pemasukan" ? "+" : "-"} ${formatRupiah(item.jumlah)}`;
  hapus.className = "hapus";
  hapus.dataset.id = item.id;
  hapus.type = "button";
  hapus.textContent = "✕";
  info.append(nama, jumlah);
  li.appendChild(info);

  if (item.foto) {
    const foto = document.createElement("img");
    foto.className = "struk";
    foto.src = item.foto;
    foto.alt = `Foto bukti ${item.nama}`;
    foto.dataset.foto = item.foto;
    li.appendChild(foto);
  }
  li.appendChild(hapus);
  return li;
}

function render() {
  const profil = akunAktif();
  const bulan = inputBulan.value;
  const daftarAktif = modeAktif === "pemasukan" ? profil.pemasukan : profil.pengeluaran;
  const transaksi = daftarAktif
    .filter((item) => item.tanggal && bulanDariTanggal(item.tanggal) === bulan)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const totalPemasukan = totalBulan(profil.pemasukan, bulan);
  const totalPengeluaran = totalBulan(profil.pengeluaran, bulan);
  const sisa = totalPemasukan - totalPengeluaran;
  const kelompok = new Map();

  daftarEl.innerHTML = "";
  transaksi.forEach((item) => {
    if (!kelompok.has(item.tanggal)) kelompok.set(item.tanggal, []);
    kelompok.get(item.tanggal).push(item);
  });
  kelompok.forEach((items, tanggal) => {
    const bagian = document.createElement("section");
    const judul = document.createElement("span");
    const daftar = document.createElement("ul");
    bagian.className = "kelompok-tanggal";
    judul.className = "judul-tanggal";
    judul.textContent = formatTanggal(tanggal);
    daftar.className = "daftar-hari";
    items.forEach((item) => daftar.appendChild(buatTransaksi(item)));
    bagian.append(judul, daftar);
    daftarEl.appendChild(bagian);
  });
  if (!transaksi.length) {
    const kosong = document.createElement("p");
    kosong.className = "kosong";
    kosong.textContent = modeAktif === "pemasukan" ? "Belum ada pemasukan bulan ini." : "Belum ada pengeluaran bulan ini.";
    daftarEl.appendChild(kosong);
  }

  totalPemasukanEl.textContent = formatRupiah(totalPemasukan);
  totalPengeluaranEl.textContent = formatRupiah(totalPengeluaran);
  sisaSaldoEl.textContent = formatRupiah(sisa);
  menuTotalPemasukan.textContent = formatRupiah(totalPemasukan);
  menuTotalPengeluaran.textContent = formatRupiah(totalPengeluaran);
  menuSisaSaldo.textContent = formatRupiah(sisa);
}

function ubahMode(jenis) {
  modeAktif = jenis;
  const pemasukanAktif = jenis === "pemasukan";
  modePemasukan.classList.toggle("aktif", pemasukanAktif);
  modePengeluaran.classList.toggle("aktif", !pemasukanAktif);
  inputNama.placeholder = pemasukanAktif ? "nama pemasukan" : "nama pengeluaran";
  inputTanggal.setAttribute("aria-label", pemasukanAktif ? "Tanggal pemasukan" : "Tanggal pengeluaran");
  btnTambah.textContent = pemasukanAktif ? "+ Tambah pemasukan" : "+ Tambah pengeluaran";
  render();
}

async function tambahTransaksi() {
  const nama = inputNama.value.trim();
  const jumlah = Number(inputJumlah.value);
  const tanggal = inputTanggal.value;
  if (!nama || !tanggal || !Number.isFinite(jumlah) || jumlah <= 0) {
    alert("Isi tanggal, nama, dan jumlah dengan benar!");
    return;
  }
  const profil = akunAktif();
  btnTambah.disabled = true;
  try {
    const item = { id: buatId(), tanggal, nama, jumlah, jenis: modeAktif, foto: inputFoto.files[0] ? await fotoKecil(inputFoto.files[0]) : "" };
    profil[modeAktif].push(item);
    inputBulan.value = bulanDariTanggal(tanggal);
    inputNama.value = "";
    inputJumlah.value = "";
    inputFoto.value = "";
    render();
    simpanData();
    inputNama.focus();
  } catch (error) {
    alert("Foto bukti tidak bisa dibaca. Silakan pilih foto lain.");
  } finally {
    btnTambah.disabled = false;
  }
}

function hapusTransaksi(id) {
  const profil = akunAktif();
  profil.pemasukan = profil.pemasukan.filter((item) => item.id !== id);
  profil.pengeluaran = profil.pengeluaran.filter((item) => item.id !== id);
  simpanData();
  render();
}

function simpanProfil() {
  const profil = akunAktif();
  profil.nama = namaPengguna.value.trim() || "Profil saya";
  profil.tanggalLahir = tanggalLahir.value;
  profil.status = statusProfil.value;
  profil.pekerjaan = pekerjaanProfil.value.trim();
  profil.deskripsi = deskripsiProfil.value.trim();
  simpanData();
  tampilkanProfil();
  tampilkanPilihanAkun();
}

async function unggahProfil() {
  if (!fotoProfil.files[0]) return;
  try {
    akunAktif().foto = await fotoKecil(fotoProfil.files[0], 500, 0.8);
    fotoProfil.value = "";
    simpanData();
    tampilkanProfil();
  } catch (error) {
    alert("Foto profil tidak bisa dibaca.");
  }
}

function bukaPanel(namaPanel) {
  document.querySelectorAll(".menu-detail").forEach((panel) => {
    panel.hidden = panel.id !== `panel${namaPanel[0].toUpperCase()}${namaPanel.slice(1)}`;
  });
}

function tambahAkun() {
  const nama = prompt("Nama profil baru:");
  if (!nama || !nama.trim()) return;
  const baru = akunKosong(nama.trim());
  akun.push(baru);
  akunAktifId = baru.id;
  simpanData();
  tampilkanProfil();
  tampilkanPilihanAkun();
  render();
}

function beralihAkun() {
  if (!pilihAkun.value || pilihAkun.value === akunAktifId) return;
  akunAktifId = pilihAkun.value;
  simpanData();
  tampilkanProfil();
  render();
}

muatData();
muatTema();
inputTanggal.value = tanggalHariIni();
inputBulan.value = bulanDariTanggal(inputTanggal.value);
tampilkanProfil();
tampilkanPilihanAkun();
ubahMode("pengeluaran");

btnMenu.addEventListener("click", () => {
  const terbuka = btnMenu.getAttribute("aria-expanded") === "true";
  btnMenu.setAttribute("aria-expanded", String(!terbuka));
  menuPanel.hidden = terbuka;
});
document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", () => bukaPanel(link.dataset.panel));
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".menu-wrap")) {
    menuPanel.hidden = true;
    btnMenu.setAttribute("aria-expanded", "false");
  }
});
btnSimpanProfil.addEventListener("click", simpanProfil);
fotoProfil.addEventListener("change", unggahProfil);
btnTambahAkun.addEventListener("click", tambahAkun);
btnBeralihAkun.addEventListener("click", beralihAkun);
temaGelap.addEventListener("click", () => { temaAktif = "dark"; simpanTema(); terapkanTema(); });
temaTerang.addEventListener("click", () => { temaAktif = "light"; simpanTema(); terapkanTema(); });
modePengeluaran.addEventListener("click", () => ubahMode("pengeluaran"));
modePemasukan.addEventListener("click", () => ubahMode("pemasukan"));
btnTambah.addEventListener("click", tambahTransaksi);
inputBulan.addEventListener("change", render);
inputTanggal.addEventListener("change", () => { inputBulan.value = bulanDariTanggal(inputTanggal.value); });
inputJumlah.addEventListener("keydown", (event) => { if (event.key === "Enter") tambahTransaksi(); });
daftarEl.addEventListener("click", (event) => {
  const tombol = event.target.closest(".hapus");
  if (tombol) hapusTransaksi(tombol.dataset.id);
  const foto = event.target.closest(".struk");
  if (foto) window.open(foto.dataset.foto, "_blank");
});

render();
