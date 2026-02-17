// =============================================================================
// 1. KONFIGURASI UTAMA
// =============================================================================
// URL Google Apps Script (Jangan diubah jika sudah benar)
const scriptURL = 'https://script.google.com/macros/s/AKfycby1PBsKvOYagze-tXkzNPLSLC3AxGVtJyXxNAe3e1wT2Q60z8oUqnrX7RpWiL5fnP4Ehw/exec'; 

// Tanggal Acara: Tahun, Bulan (Jan=0, Apr=3), Tanggal, Jam, Menit, Detik
// Target: 04 April 2026, Jam 08:00
const tanggalTujuan = new Date(2026, 3, 4, 8, 0, 0).getTime();


// =============================================================================
// 2. FUNGSI UTAMA (Jalan saat website dimuat)
// =============================================================================
document.addEventListener("DOMContentLoaded", function() {
    
    // A. SETUP NAMA TAMU (DARI URL)
    // -------------------------------------------------------------------------
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to'); 
    
    if (namaTamu) {
        // Ganti nama di cover depan
        const namaContainer = document.getElementById("nama-tamu");
        if (namaContainer) {
            namaContainer.innerText = namaTamu; 
        }

        // Isi otomatis nama di form RSVP
        const inputNama = document.getElementById("nama");
        if (inputNama) {
            inputNama.value = namaTamu;
        }
    }

    // B. LOAD UCAPAN (Dari Google Sheet)
    // -------------------------------------------------------------------------
    loadUcapan();

    // C. SETUP TOMBOL MUSIK
    // -------------------------------------------------------------------------
    const audioBtn = document.getElementById("audio-btn");
    const audio = document.getElementById("song");
    const audioIcon = document.querySelector(".fa-compact-disc");

    if (audioBtn && audio) {
        audioBtn.addEventListener("click", function() {
            if (audio.paused) {
                audio.play();
                audioIcon.classList.add("fa-spin"); // Icon muter
            } else {
                audio.pause();
                audioIcon.classList.remove("fa-spin"); // Icon berhenti
            }
        });
    }

    // D. SETUP FORM SUBMIT (RSVP)
    // -------------------------------------------------------------------------
    const form = document.getElementById('rsvpForm');
    const btnKirim = document.querySelector("button[type='submit']");

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault(); 
            
            // Ubah tombol jadi loading
            const textAwal = btnKirim.innerHTML;
            btnKirim.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            btnKirim.disabled = true;

            const data = {
                nama: form.nama.value,
                jumlah: form.jumlah.value,
                status: form.status.value,
                pesan: form.pesan.value
            };

            if(data.nama.trim().length <3) {
                alert("Mohon Masukkan Nama Lengkap.");
            }

            if(data.jumlah<1) {
                alert("Jumlah Tamu Minimal adalah 1 Orang.");
            }

            btnKirim.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            btnKirim.disabled = true;

            fetch(scriptURL, {
                method: 'POST',
                body: JSON.stringify(data),
            })
            .then(response => {
                alert("Terima kasih! Konfirmasi & Ucapan Anda telah terkirim.");
                form.reset(); // Kosongkan form
                
                // Kembalikan tombol
                btnKirim.innerHTML = textAwal;
                btnKirim.disabled = false;
                
                // Reload ucapan biar yang baru langsung muncul
                loadUcapan(); 
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert("Maaf, terjadi kesalahan koneksi. Silakan coba lagi.");
                btnKirim.innerHTML = textAwal;
                btnKirim.disabled = false;
            });
        });
    }
});


// =============================================================================
// 3. FUNGSI GLOBAL (Dipanggil lewat onclick di HTML)
// =============================================================================

// A. BUKA UNDANGAN
function bukaUndangan() {
    const hero = document.getElementById("hero");
    const mainContent = document.getElementById("main-content");
    const audio = document.getElementById("song");
    const audioContainer = document.getElementById("audio-container");
    const page1 = document.getElementById("page-1"); // Target scroll setelah dibuka

    // Geser Cover ke Atas
    if (hero) {
        hero.style.transform = "translateY(-100vh)";
        hero.style.transition = "transform 1s ease-in-out";
    }
    
    // Munculkan Isi Undangan
    if (mainContent) {
        mainContent.style.display = "block";
        
        // Scroll halus ke Page 1 (Intro)
        setTimeout(() => {
            if(page1) page1.scrollIntoView({ behavior: 'smooth' });
        }, 500);
    }
    
    // Putar Musik
    if (audio) {
        audio.play().catch(error => console.log("Autoplay blocked:", error));
    }
    if (audioContainer) {
        audioContainer.style.display = "block";
    }
}

// B. COPY TEXT (ALAMAT/REKENING)
function copyText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const textToCopy = element.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(function() {
        alert("Berhasil disalin: " + textToCopy);
    }, function(err) {
        console.error('Gagal menyalin: ', err);
        // Fallback untuk browser lama
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("Copy");
        textArea.remove();
        alert("Berhasil disalin: " + textToCopy);
    });
}


// =============================================================================
// 4. FUNGSI PENDUKUNG (HELPER)
// =============================================================================

// A. LOAD UCAPAN DARI GOOGLE SHEET
// VERSI DEBUGGING
function loadUcapan() {
    const daftarUcapan = document.getElementById("daftar-ucapan");
    
    // Cek apakah URL sudah diisi
    if (!scriptURL || scriptURL.includes('AKfycbzVWcnpNx')) {
        daftarUcapan.innerHTML = '<p class="text-center text-danger small">Gagal Memuat Ucapan!</p>';
        return;
    }

    fetch(scriptURL)
    .then(response => {
        // Cek status koneksi
        if (!response.ok) {
            throw new Error('Jaringan bermasalah: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        // Cek apakah data kosong atau error dari script
        if (!data || data.length === 0) {
            daftarUcapan.innerHTML = '<div class="text-center py-5 opacity-75">Belum ada ucapan. Jadilah yang pertama!</div>';
            return;
        }

        if (data.result === 'error') {
             throw new Error(data.error);
        }

        let html = '';
        // Loop data
        data.forEach(item => {
            // Validasi data biar tidak error kalau ada kolom kosong
            const nama = item.nama ? item.nama : 'Tanpa Nama';
            const status = item.status ? item.status : 'Hadir';
            const pesan = item.pesan ? item.pesan : '';

            // Tentukan warna badge
            let badgeClass = 'bg-secondary';
            if(status === 'Hadir') badgeClass = 'bg-success';
            if(status === 'Tidak Hadir') badgeClass = 'bg-danger';

            html += `
            <div class="ucapan-item animate__animated animate__fadeIn">
                <div class="d-flex align-items-center mb-2">
                    <div class="fw-bold text-cream me-2">${nama}</div>
                    <span class="badge ${badgeClass}" style="font-size: 0.6rem;">${status}</span>
                </div>
                <p class="small text-cream opacity-75 mb-0 fst-italic">"${pesan}"</p>
            </div>
            `;
        });
        
        daftarUcapan.innerHTML = html;
    })
    .catch(error => {
        console.error('DETAIL ERROR:', error); // Cek Console browser (F12) untuk lihat ini
        daftarUcapan.innerHTML = `<div class="text-center py-5 text-warning small">
            Gagal memuat data.<br>
            <span style="font-size: 0.7em">Pastikan "Who has access" = "Anyone" saat Deploy.</span>
        </div>`;
    });
}

// B. FORMAT WAKTU (01, 02, dst)
function formatWaktu(waktu) {
    return waktu < 10 ? "0" + waktu : waktu;
}

// C. COUNTDOWN TIMER
const hitungMundur = setInterval(function() {
    const sekarang = new Date().getTime();
    const selisih = tanggalTujuan - sekarang;

    const elHari = document.getElementById("days");
    const elJam = document.getElementById("hours");
    const elMenit = document.getElementById("minutes");
    const elDetik = document.getElementById("seconds");
    const elCountdown = document.getElementById("countdown");

    // Pastikan elemen ada sebelum diupdate (Mencegah error)
    if (elHari && elJam && elMenit && elDetik) {
        const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
        const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
        const detik = Math.floor((selisih % (1000 * 60)) / 1000);

        elHari.innerText = formatWaktu(hari);
        elJam.innerText = formatWaktu(jam);
        elMenit.innerText = formatWaktu(menit);
        elDetik.innerText = formatWaktu(detik);
    }

    if (selisih < 0 && elCountdown) {
        clearInterval(hitungMundur);
        elCountdown.innerHTML = "<h3 class='font-aesthetic text-cream'>Alhamdulillah, Acara Telah Selesai</h3>";
    }
}, 1000);

// --- 7. INISIALISASI ANIMASI SCROLL (AOS) ---
// Jalankan hanya jika library AOS sudah termuat
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800, // Durasi animasi (ms)
        easing: 'ease-in-out', // Gaya gerakan
        once: true, // Animasi hanya sekali saat scroll ke bawah
        mirror: false // Jangan animasi ulang saat scroll ke atas
    });
}