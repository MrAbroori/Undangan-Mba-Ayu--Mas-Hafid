// ============================================================================
// 1. KONFIGURASI UTAMA
// ============================================================================
// PENTING: Ganti URL ini dengan URL Web App Google Script TERBARU (akhiran /exec)
// Caranya: Deploy > Manage Deployments > Edit (Pensil) > New Version > Deploy
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzTiEtQCn3eMn4kbw6bvYfdjOZRoS3vkOVdaMa9KFtrPT-nahpU41tRGtIHt8G6VTr0LQ/exec'; 

// Tanggal Acara: Tahun, Bulan (0-11), Tanggal, Jam
const TARGET_DATE = new Date(2026, 3, 4, 8, 0, 0).getTime(); // 04 April 2026


// ============================================================================
// 2. LOGIKA UTAMA (DOM READY)
// ============================================================================
document.addEventListener("DOMContentLoaded", function() {

    // A. ISI NAMA TAMU DARI URL
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    if (namaTamu) {
        if(document.getElementById("nama-tamu")) document.getElementById("nama-tamu").innerText = namaTamu;
        if(document.getElementById("nama")) document.getElementById("nama").value = namaTamu;
    }

    // B. SETUP AUDIO
    const audioBtn = document.getElementById("audio-btn");
    const audio = document.getElementById("song");
    if (audioBtn && audio) {
        audioBtn.addEventListener("click", () => {
            if (audio.paused) {
                audio.play();
                audioBtn.querySelector("i").classList.add("fa-spin");
            } else {
                audio.pause();
                audioBtn.querySelector("i").classList.remove("fa-spin");
            }
        });
    }

    // C. LOAD KOMENTAR/UCAPAN
    loadUcapan();

    // D. HANDLE SUBMIT FORM RSVP
    const form = document.getElementById('rsvpForm');
    const btnKirim = document.querySelector("button[type='submit']");

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // 1. Validasi Sederhana
            if (form.nama.value.length < 3) {
                alert("Mohon isi nama lengkap.");
                return;
            }

            // 2. Ubah Tombol Loading
            const textAsli = btnKirim.innerText;
            btnKirim.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            btnKirim.disabled = true;

            // 3. Siapkan Data
            const dataKirim = {
                nama: form.nama.value,
                jumlah: form.jumlah.value,
                status: form.status.value,
                pesan: form.pesan.value
            };

            // 4. Kirim ke Google Script
            fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(dataKirim),
                // Header ini PENTING agar Google Script mau menerima JSON tanpa error CORS
                headers: { "Content-Type": "text/plain" }
            })
            .then(response => response.json())
            .then(result => {
                if (result.result === 'success') {
                    alert("Terima kasih! Konfirmasi kehadiran berhasil terkirim.");
                    form.reset(); // Bersihkan form
                    loadUcapan(); // Refresh daftar ucapan
                } else {
                    throw new Error(result.error || 'Gagal menyimpan.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Maaf, terjadi kesalahan koneksi. Silakan coba lagi.");
            })
            .finally(() => {
                btnKirim.innerHTML = textAsli;
                btnKirim.disabled = false;
            });
        });
    }
});


// ============================================================================
// 3. FUNGSI LOAD UCAPAN (GET)
// ============================================================================
function loadUcapan() {
    const container = document.getElementById("daftar-ucapan");
    if (!container) return;

    if (!SCRIPT_URL.includes('/exec')) {
        container.innerHTML = '<div class="text-center small opacity-50 py-3">URL Script belum disetting.</div>';
        return;
    }

    fetch(SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="text-center small opacity-50 py-3">Belum ada ucapan. Jadilah yang pertama!</div>';
            return;
        }

        let html = '';
        data.forEach(item => {
            // Tentukan warna badge status
            let badgeColor = 'bg-secondary';
            if (item.status === 'Hadir') badgeColor = 'bg-success';
            if (item.status === 'Tidak Hadir') badgeColor = 'bg-danger';

            html += `
            <div class="ucapan-item mb-2 p-2 rounded" style="background: rgba(250,247,240,0.1); border: 1px solid rgba(250,247,240,0.1);">
                <div class="d-flex align-items-center mb-1">
                    <span class="fw-bold text-cream me-2" style="font-size: 0.9rem;">${item.nama}</span>
                    <span class="badge ${badgeColor}" style="font-size: 0.6rem;">${item.status}</span>
                </div>
                <p class="small text-cream opacity-75 mb-0 fst-italic">"${item.pesan}"</p>
            </div>
            `;
        });
        container.innerHTML = html;
    })
    .catch(err => {
        console.error(err);
        container.innerHTML = '<div class="text-center small text-danger py-3">Gagal memuat data.</div>';
    });
}

// ============================================================================
// 4. FUNGSI GLOBAL (BUKA UNDANGAN & COPY)
// ============================================================================
function bukaUndangan() {
    const hero = document.getElementById("hero");
    const mainContent = document.getElementById("main-content");
    const audio = document.getElementById("song");
    const audioContainer = document.getElementById("audio-container");
    
    // 1. Animasi Geser Cover (Hero) ke Atas secara Mulus
    if(hero) {
        // Tambahkan efek transisi (CSS) langsung dari JS agar mulus & elegan
        hero.style.transition = "transform 1.2s cubic-bezier(0.7, 0, 0.3, 1), opacity 1.2s ease";
        
        // Eksekusi gerakannya (angkat ke atas dan buat transparan)
        hero.style.transform = "translateY(-100vh)"; 
        hero.style.opacity = "0";
        
        // Hapus elemen hero setelah animasi selesai (1.2 detik) agar tidak menutupi klik
        setTimeout(() => {
            hero.style.display = "none";
        }, 1200);
    }
    
    // 2. Tampilkan Konten Utama
    if(mainContent) {
        mainContent.style.display = "block";
    }

    // 3. Aktifkan Scroll pada Body
    document.body.style.overflow = "auto"; 
    
    // 4. Munculkan Tombol Musik & Putar Lagu
    if(audioContainer) {
        audioContainer.style.display = "block";
        // PENTING: Pastikan ikon kaset langsung berputar saat undangan pertama kali dibuka
        audioContainer.querySelector("i").classList.add("fa-spin");
    }
    if(audio) audio.play().catch(e => console.log("Audio autoplay blocked"));
    
    // 5. Init Animasi AOS (Munculnya elemen-elemen secara perlahan)
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 1000, once: true });
    }
}
// Kunci scroll saat halaman pertama kali dimuat (sebelum tombol dibuka)
document.body.style.overflow = "hidden";

function copyText(id) {
    const el = document.getElementById(id);
    if(el) {
        navigator.clipboard.writeText(el.innerText).then(() => {
            alert("Berhasil disalin: " + el.innerText);
        });
    }
}

// ============================================================================
// 5. COUNTDOWN TIMER
// ============================================================================
setInterval(() => {
    const now = new Date().getTime();
    const diff = TARGET_DATE - now;
    
    if (diff < 0) return;

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if(el) el.innerText = val < 10 ? "0" + val : val;
    };

    setVal("days", d);
    setVal("hours", h);
    setVal("minutes", m);
    setVal("seconds", s);
}, 1000);

// ============================================================================
// 6. FITUR AUTO-PAUSE MUSIK SAAT KELUAR TAB/BROWSER
// ============================================================================
let wasPlaying = false; // Pengingat apakah lagu sedang nyala atau tidak

document.addEventListener("visibilitychange", function() {
    const audio = document.getElementById("song");
    const audioBtn = document.getElementById("audio-btn");
    
    if (!audio) return;

    if (document.hidden) {
        // JIKA USER KELUAR TAB / BROWSER
        wasPlaying = !audio.paused; // Ingat status lagu sebelum ditinggal
        audio.pause();              // Matikan lagu
        
        // Hentikan putaran ikon kaset
        if (audioBtn) {
            audioBtn.querySelector("i").classList.remove("fa-spin");
        }
    } else {
        // JIKA USER BALIK LAGI KE UNDANGAN
        // Nyalakan lagi HANYA jika sebelum ditinggal lagunya memang nyala
        if (wasPlaying) {
            audio.play().catch(e => console.log("Gagal memutar otomatis:", e));
            
            // Putar lagi ikon kaset
            if (audioBtn) {
                audioBtn.querySelector("i").classList.add("fa-spin");
            }
        }
    }
});