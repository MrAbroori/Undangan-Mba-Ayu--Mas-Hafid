// --- 1. KONFIGURASI (Bagian yang harus kamu ganti) ---
// Ganti URL di dalam tanda kutip dengan URL Web App kamu
const scriptURL = 'https://script.google.com/macros/s/AKfycbzVWcnpNx-rnzJ2bGWrX1N9R8newsFioY-6QuCX-R11k3Qe9wIjBhRwmVNIlhEjmiAY6g/exec'; 

document.addEventListener("DOMContentLoaded", function() {
    // Ambil parameter '?to=' dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to'); 
    
    // Jika ada nama tamu di URL (misal: ?to=Budi+Santoso)
    if (namaTamu) {
        // A. Ganti tulisan "Tamu Undangan" di halaman depan
        const namaContainer = document.getElementById("nama-tamu");
        if (namaContainer) {
            namaContainer.innerText = namaTamu; 
        }

        // B. Otomatis isi kolom nama di form RSVP (biar tamu praktis)
        const inputNama = document.getElementById("nama");
        if (inputNama) {
            inputNama.value = namaTamu;
        }
    }
});

// --- 2. LOGIKA MUSIK & COVER ---
const audio = document.getElementById("song");
const hero = document.getElementById("hero");
const mainContent = document.getElementById("main-content");
const audioContainer = document.getElementById("audio-container");
const audioBtn = document.getElementById("audio-btn");
const audioIcon = document.querySelector(".fa-compact-disc");

// GANTI FUNGSI INI SAJA
function bukaUndangan() {
    const mainContent = document.getElementById("main-content");
    const page2 = document.getElementById("page-2");
    
    // 1. Munculkan konten halaman 2, 3, 4
    mainContent.style.display = "block";
    
    // 2. Putar Musik
    audio.play();
    document.getElementById("audio-container").style.display = "block";
    
    // 3. Scroll halus ke Halaman 2
    page2.scrollIntoView({ behavior: 'smooth' });
}

// Kontrol Tombol Musik (Pause/Play)
audioBtn.addEventListener("click", function() {
    if (audio.paused) {
        audio.play();
        audioIcon.classList.add("fa-spin"); // Icon muter
    } else {
        audio.pause();
        audioIcon.classList.remove("fa-spin"); // Icon stop
    }
});

// --- 3. AMBIL NAMA TAMU DARI URL ---
// Contoh link: undangan.com/?to=Budi+Santoso
const urlParams = new URLSearchParams(window.location.search);
const namaTamu = urlParams.get('to'); // Ambil parameter 'to'
const namaContainer = document.getElementById("nama-tamu");

if (namaTamu) {
    // Ganti teks "Tamu Undangan" dengan nama asli
    namaContainer.innerText = namaTamu; 
    
    // Otomatis isi kolom nama di form RSVP juga biar praktis
    document.getElementById("nama").value = namaTamu;
}

// --- 4. KIRIM DATA RSVP KE GOOGLE SHEETS ---
const form = document.forms['rsvpForm'];
const btnKirim = document.querySelector("button[type='submit']");

form.addEventListener('submit', e => {
    e.preventDefault(); // Cegah halaman reload
    
    // Ubah tombol jadi "Loading..."
    btnKirim.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    btnKirim.disabled = true;

    // Ambil data form
    const data = {
        nama: form.nama.value,
        jumlah: form.jumlah.value,
        status: form.status.value,
        pesan: form.pesan.value
    };

    // Kirim pakai Fetch API
    fetch(scriptURL, {
        method: 'POST',
        // Kita kirim sebagai text biasa tapi isinya JSON String
        // Ini trik agar tidak kena blokir CORS (Cross-Origin Resource Sharing)
        body: JSON.stringify(data),
    })
    .then(response => {
        // Jika sukses
        alert("Terima kasih! Konfirmasi Anda telah terkirim.");
        form.reset(); // Kosongkan form
        btnKirim.innerHTML = 'Kirim Konfirmasi';
        btnKirim.disabled = false;
    })
    .catch(error => {
        // Jika gagal
        console.error('Error!', error.message);
        alert("Maaf, terjadi kesalahan. Silakan coba lagi.");
        btnKirim.innerHTML = 'Kirim Konfirmasi';
        btnKirim.disabled = false;
    });
});

// --- 5. COUNTDOWN TIMER ---
// Tanggal target: Tahun, Bulan (0-11), Tanggal, Jam, Menit
// Ingat: Bulan di JS mulai dari 0 (Januari = 0, Oktober = 9)
const tanggalTujuan = new Date('Apr 04, 2026 08:00:00').getTime();

const hitungMundur = setInterval(function() {
    const sekarang = new Date().getTime();
    const selisih = tanggalTujuan - sekarang;

    // Hitung waktu
    const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
    const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
    const detik = Math.floor((selisih % (1000 * 60)) / 1000);

    // Masukkan ke dalam elemen HTML
    document.getElementById("days").innerText = formatWaktu(hari);
    document.getElementById("hours").innerText = formatWaktu(jam);
    document.getElementById("minutes").innerText = formatWaktu(menit);
    document.getElementById("seconds").innerText = formatWaktu(detik);

    // Jika waktu habis
    if (selisih < 0) {
        clearInterval(hitungMundur);
        document.getElementById("countdown").innerHTML = "<h3 class='text-cream'>Alhamdulillah, Acara Telah Selesai</h3>";
    }
}, 1000);

// Fungsi agar angka satuan jadi 01, 02, dst.
function formatWaktu(waktu) {
    return waktu < 10 ? "0" + waktu : waktu;
}

// --- 6. FUNGSI COPY TEXT ---
function copyText(elementId) {
    // Ambil teks dari elemen (innerHTML/innerText)
    var textToCopy = document.getElementById(elementId).innerText;
    
    // Gunakan Clipboard API modern
    navigator.clipboard.writeText(textToCopy).then(function() {
        // Tampilkan notifikasi sederhana (Alert)
        alert("Berhasil disalin: " + textToCopy);
    }, function(err) {
        console.error('Gagal menyalin: ', err);
    });
}