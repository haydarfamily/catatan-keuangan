// ===== STATE =====
let saldoAwal = 300000;
let pengeluaran = [];
let pemasukan = [];
let modeAktif = "pengeluaran";
const STORAGE_KEY = "catatan-keuangan-v2";
const TAMPILAN_KEY = "catatan-keuangan-tampilan-v1";
const PROFIL_KEY = "catatan-keuangan-profil-v1";

const inputSaldoAwal = document.getElementById("saldoAwal");
const btnSetSaldo = document.getElementById("btnSetSaldo");
const inputBulan = document.getElementById("pilihBulan");
const inputTanggal = document.getElementById("tanggalPengeluaran");
const inputNama = document.getElementById("namaPengeluaran");
const inputJumlah = document.getElementById("jumlahPengeluaran");
const inputFoto = document.getElementById("fotoStruk");
const btnTambah = document.getElementById("btnTambah");
const daftarPengeluaranEl = document.getElementById("daftarPengeluaran");
const totalPengeluaranEl = document.getElementById("totalPengeluaran");
const totalPemasukanEl = document.getElementById("totalPemasukan");
const sisaSaldoEl = document.getElementById("sisaSaldo");
const modePengeluaran = document.getElementById("modePengeluaran");
const modePemasukan = document.getElementById("modePemasukan");
const warnaLatar = document.getElementById("warnaLatar");
const fotoLatar = document.getElementById("fotoLatar");
const opasitasLatar = document.getElementById("opasitasLatar");
const btnResetTampilan = document.getElementById("btnResetTampilan");
const btnMenu = document.getElementById("btnMenu");
const menuPanel = document.getElementById("menuPanel");
const menuTitle = document.getElementById("menuTitle");
const namaPengguna = document.getElementById("namaPengguna");
const btnSimpanProfil = document.getElementById("btnSimpanProfil");
const menuTotalPemasukan = document.getElementById("menuTotalPemasukan");
const menuTotalPengeluaran = document.getElementById("menuTotalPengeluaran");
const menuSisaSaldo = document.getElementById("menuSisaSaldo");

let tampilan = {
  warna: "#dfe7e2",
  foto: "",
  opasitas: 0.65
};
let profil = { nama: "" };

function tanggalHariIni() {
  const sekarang = new Date();
  const offset = sekarang.getTimezoneOffset() * 60000;
  return new Date(sekarang.getTime() - offset).toISOString().slice(0, 10);
}

function bulanDariTanggal(tanggal) {
  return tanggal.slice(0, 7);
}

function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

function formatTanggal(tanggal) {
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function simpanData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ saldoAwal, pengeluaran, pemasukan }));
  } catch (error) {
    alert("Data belum tersimpan. Foto mungkin terlalu besar untuk penyimpanan browser.");
  }
}

function muatData() {
  try {
    const dataTersimpan = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!dataTersimpan) return;

    saldoAwal = Number(dataTersimpan.saldoAwal) || 0;
    pengeluaran = Array.isArray(dataTersimpan.pengeluaran)
      ? dataTersimpan.pengeluaran
      : [];
    pemasukan = Array.isArray(dataTersimpan.pemasukan)
      ? dataTersimpan.pemasukan
      : [];
  } catch (error) {
    saldoAwal = 300000;
    pengeluaran = [];
    pemasukan = [];
  }
}

function muatProfil() {
  try {
    const dataTersimpan = JSON.parse(localStorage.getItem(PROFIL_KEY));
    if (dataTersimpan && typeof dataTersimpan.nama === "string") {
      profil.nama = dataTersimpan.nama;
    }
  } catch (error) {
    profil = { nama: "" };
  }
  namaPengguna.value = profil.nama;
  menuTitle.textContent = profil.nama ? `Hai, ${profil.nama}` : "Pengaturan akun";
}

function buatFotoKecil(file, batas = 900, kualitas = 0.75) {
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

function simpanTampilan() {
  try {
    localStorage.setItem(TAMPILAN_KEY, JSON.stringify(tampilan));
  } catch (error) {
    alert("Tampilan belum tersimpan. Foto background mungkin terlalu besar.");
  }
}

function muatTampilan() {
  try {
    const dataTersimpan = JSON.parse(localStorage.getItem(TAMPILAN_KEY));
    if (dataTersimpan) {
      tampilan = {
        warna: /^#[0-9a-f]{6}$/i.test(dataTersimpan.warna) ? dataTersimpan.warna : "#dfe7e2",
        foto: typeof dataTersimpan.foto === "string" ? dataTersimpan.foto : "",
        opasitas: Number(dataTersimpan.opasitas) || 0.65
      };
    }
  } catch (error) {
    tampilan = { warna: "#dfe7e2", foto: "", opasitas: 0.65 };
  }
}

function terapkanTampilan() {
  warnaLatar.value = tampilan.warna;
  opasitasLatar.value = tampilan.opasitas;
  document.body.style.backgroundColor = tampilan.warna;
  document.body.classList.toggle("custom-background", Boolean(tampilan.foto));
  document.body.classList.toggle("custom-color", !tampilan.foto);

  if (tampilan.foto) {
    const transparansi = Math.round((1 - tampilan.opasitas) * 255)
      .toString(16)
      .padStart(2, "0");
    document.body.style.backgroundImage =
      `linear-gradient(${tampilan.warna}${transparansi}, ${tampilan.warna}${transparansi}), url("${tampilan.foto}")`;
  } else {
    document.body.style.backgroundImage = "";
  }
}

async function gantiFotoLatar() {
  const file = fotoLatar.files[0];
  if (!file) return;

  try {
    tampilan.foto = await buatFotoKecil(file, 1600, 0.8);
    simpanTampilan();
    terapkanTampilan();
    fotoLatar.value = "";
  } catch (error) {
    alert("Foto background tidak bisa dibaca. Silakan pilih foto lain.");
  }
}

function resetTampilan() {
  tampilan = { warna: "#dfe7e2", foto: "", opasitas: 0.65 };
  localStorage.removeItem(TAMPILAN_KEY);
  fotoLatar.value = "";
  terapkanTampilan();
}

function buatTransaksi(item) {
  const li = document.createElement("li");
  const info = document.createElement("div");
  const nama = document.createElement("span");
  const jumlah = document.createElement("span");
  const hapus = document.createElement("button");

  info.className = "info";
  nama.className = "nama";
  nama.textContent = item.nama;
  jumlah.className = "jumlah";
  const jenis = item.jenis || modeAktif;
  li.className = jenis;
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
    foto.alt = `Foto struk ${item.nama}`;
    foto.dataset.foto = item.foto;
    li.appendChild(foto);
  }

  li.appendChild(hapus);
  return li;
}

function render() {
  const bulanDipilih = inputBulan.value;
  const daftarAktif = modeAktif === "pemasukan" ? pemasukan : pengeluaran;
  const transaksiBulanIni = daftarAktif
    .filter((item) => item.tanggal && bulanDariTanggal(item.tanggal) === bulanDipilih)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const pemasukanBulanIni = pemasukan.filter(
    (item) => item.tanggal && bulanDariTanggal(item.tanggal) === bulanDipilih
  );
  const pengeluaranBulanIni = pengeluaran.filter(
    (item) => item.tanggal && bulanDariTanggal(item.tanggal) === bulanDipilih
  );

  daftarPengeluaranEl.innerHTML = "";
  const kelompok = new Map();

  transaksiBulanIni.forEach((item) => {
    if (!kelompok.has(item.tanggal)) kelompok.set(item.tanggal, []);
    kelompok.get(item.tanggal).push(item);
  });

  kelompok.forEach((transaksi, tanggal) => {
    const bagian = document.createElement("section");
    const judul = document.createElement("span");
    const daftar = document.createElement("ul");

    bagian.className = "kelompok-tanggal";
    judul.className = "judul-tanggal";
    judul.textContent = formatTanggal(tanggal);
    daftar.className = "daftar-hari";
    transaksi.forEach((item) => daftar.appendChild(buatTransaksi(item)));
    bagian.append(judul, daftar);
    daftarPengeluaranEl.appendChild(bagian);
  });

  if (transaksiBulanIni.length === 0) {
    const kosong = document.createElement("p");
    kosong.className = "kosong";
    kosong.textContent = modeAktif === "pemasukan"
      ? "Belum ada pemasukan pada bulan ini."
      : "Belum ada pengeluaran pada bulan ini.";
    daftarPengeluaranEl.appendChild(kosong);
  }

  const totalPemasukan = pemasukanBulanIni.reduce((acc, item) => acc + Number(item.jumlah), 0);
  const totalPengeluaran = pengeluaranBulanIni.reduce((acc, item) => acc + Number(item.jumlah), 0);
  const sisaSaldo = saldoAwal + totalPemasukan - totalPengeluaran;
  totalPemasukanEl.textContent = formatRupiah(totalPemasukan);
  totalPengeluaranEl.textContent = formatRupiah(totalPengeluaran);
  sisaSaldoEl.textContent = formatRupiah(sisaSaldo);
  menuTotalPemasukan.textContent = formatRupiah(totalPemasukan);
  menuTotalPengeluaran.textContent = formatRupiah(totalPengeluaran);
  menuSisaSaldo.textContent = formatRupiah(sisaSaldo);
  inputSaldoAwal.value = saldoAwal;
}

function setSaldoAwal() {
  const nilai = Number(inputSaldoAwal.value);
  if (isNaN(nilai) || nilai < 0) {
    alert("Saldo tidak valid!");
    return;
  }
  saldoAwal = nilai;
  simpanData();
  render();
}

function ubahMode(jenis) {
  modeAktif = jenis;
  const sedangPemasukan = jenis === "pemasukan";
  modePengeluaran.classList.toggle("aktif", !sedangPemasukan);
  modePemasukan.classList.toggle("aktif", sedangPemasukan);
  inputNama.placeholder = sedangPemasukan ? "nama pemasukan" : "nama pengeluaran";
  inputTanggal.setAttribute(
    "aria-label",
    sedangPemasukan ? "Tanggal pemasukan" : "Tanggal pengeluaran"
  );
  btnTambah.textContent = sedangPemasukan ? "+ Tambah pemasukan" : "+ Tambah pengeluaran";
  render();
}

async function tambahPengeluaran() {
  const nama = inputNama.value.trim();
  const jumlah = Number(inputJumlah.value);
  const tanggal = inputTanggal.value;
  const fileFoto = inputFoto.files[0];

  if (nama === "" || isNaN(jumlah) || jumlah <= 0 || !tanggal) {
    alert("Isi tanggal, nama, dan jumlah pengeluaran dengan benar!");
    return;
  }

  btnTambah.disabled = true;
  try {
    const foto = fileFoto ? await buatFotoKecil(fileFoto) : "";
    const transaksiBaru = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      tanggal,
      nama,
      jumlah,
      foto,
      jenis: modeAktif
    };
    if (modeAktif === "pemasukan") {
      pemasukan.push(transaksiBaru);
    } else {
      pengeluaran.push(transaksiBaru);
    }
    inputBulan.value = bulanDariTanggal(tanggal);
    simpanData();
    inputNama.value = "";
    inputJumlah.value = "";
    inputFoto.value = "";
    inputNama.focus();
    render();
  } catch (error) {
    alert("Foto struk tidak bisa dibaca. Silakan pilih foto lain.");
  } finally {
    btnTambah.disabled = false;
  }
}

function hapusPengeluaran(id) {
  pengeluaran = pengeluaran.filter((item) => item.id !== id);
  pemasukan = pemasukan.filter((item) => item.id !== id);
  simpanData();
  render();
}

muatData();
muatTampilan();
muatProfil();
const tanggalAwal = tanggalHariIni();
inputTanggal.value = tanggalAwal;
inputBulan.value = bulanDariTanggal(tanggalAwal);
inputSaldoAwal.value = saldoAwal;
terapkanTampilan();

btnSetSaldo.addEventListener("click", setSaldoAwal);
btnTambah.addEventListener("click", tambahPengeluaran);
modePengeluaran.addEventListener("click", () => ubahMode("pengeluaran"));
modePemasukan.addEventListener("click", () => ubahMode("pemasukan"));
inputBulan.addEventListener("change", render);
inputTanggal.addEventListener("change", () => {
  inputBulan.value = bulanDariTanggal(inputTanggal.value);
});
inputJumlah.addEventListener("keydown", (event) => {
  if (event.key === "Enter") tambahPengeluaran();
});
warnaLatar.addEventListener("input", () => {
  tampilan.warna = warnaLatar.value;
  simpanTampilan();
  terapkanTampilan();
});
opasitasLatar.addEventListener("input", () => {
  tampilan.opasitas = Number(opasitasLatar.value);
  simpanTampilan();
  terapkanTampilan();
});
fotoLatar.addEventListener("change", gantiFotoLatar);
btnResetTampilan.addEventListener("click", resetTampilan);
btnMenu.addEventListener("click", () => {
  const terbuka = btnMenu.getAttribute("aria-expanded") === "true";
  btnMenu.setAttribute("aria-expanded", String(!terbuka));
  menuPanel.hidden = terbuka;
});
document.querySelectorAll(".menu-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".menu-detail").forEach((panel) => {
      panel.hidden = panel.id !== `panel${link.dataset.panel[0].toUpperCase()}${link.dataset.panel.slice(1)}`;
    });
  });
});
btnSimpanProfil.addEventListener("click", () => {
  profil.nama = namaPengguna.value.trim();
  localStorage.setItem(PROFIL_KEY, JSON.stringify(profil));
  menuTitle.textContent = profil.nama ? `Hai, ${profil.nama}` : "Pengaturan akun";
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".menu-wrap")) {
    menuPanel.hidden = true;
    btnMenu.setAttribute("aria-expanded", "false");
  }
});
daftarPengeluaranEl.addEventListener("click", (event) => {
  const tombolHapus = event.target.closest(".hapus");
  if (tombolHapus) hapusPengeluaran(tombolHapus.dataset.id);

  const foto = event.target.closest(".struk");
  if (foto) window.open(foto.dataset.foto, "_blank");
});

ubahMode("pengeluaran");
render();
