// 1. Setup DOM Elements
const valTotal = document.getElementById('valTotal');
const valMerah = document.getElementById('valMerah');
const valBiru = document.getElementById('valBiru');
const logArea = document.getElementById('logArea');
const btnLaporan = document.getElementById('btnLaporan');
const kotakAI = document.getElementById('kotakAI');
const teksLaporan = document.getElementById('teksLaporan');

// API Key Gemini
const GEMINI_API_KEY = 'API GEMINI';

// Format jam buat log
function tulisLog(pesan) {
    const waktu = new Date().toLocaleTimeString('id-ID', { hour12: false });
    logArea.innerHTML += `<span style="color: #64748b;">[${waktu}]</span> ${pesan}<br>`;
    logArea.scrollTop = logArea.scrollHeight; 
}

// 2. KONEKSI MQTT (IOT)
const clientId = 'web_client_' + Math.random().toString(16).substring(2, 8);
const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt', { clientId: clientId });

client.on('connect', () => {
    tulisLog('✅ Berhasil terhubung ke Broker IoT.');
    client.subscribe('proyekuts/kampuslu/paket');
});

client.on('message', (topik, message) => {
    const pesan = message.toString();
    tulisLog(`> Deteksi warna: <strong style="color:#fff">${pesan}</strong>`);
    
    if (pesan.includes("MERAH")) {
        valMerah.innerText = parseInt(valMerah.innerText) + 1;
    } else if (pesan.includes("BIRU")) {
        valBiru.innerText = parseInt(valBiru.innerText) + 1;
    }
    
    // Update counter total
    valTotal.innerText = parseInt(valMerah.innerText) + parseInt(valBiru.innerText);
});

// 3. INTEGRASI GEMINI AI
btnLaporan.addEventListener('click', async () => {
    // Tampilkan kotak dan set mode loading
    kotakAI.classList.remove('hidden');
    teksLaporan.innerHTML = "<em>Memproses data dan menyusun laporan...</em>";
    btnLaporan.disabled = true;

    // Prompt cerdas untuk Gemini
    const prompt = `Sebagai sistem analitik gudang cerdas. Hari ini sistem berhasil menyortir total ${valTotal.innerText} paket. Rincian: Merah (Jakarta) ${valMerah.innerText} paket, Biru (Bandung) ${valBiru.innerText} paket. Buatkan 2 kalimat ringkasan profesional untuk evaluasi operasional ke pihak manajemen.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            teksLaporan.innerText = data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Format respons tidak sesuai");
        }
    } catch (error) {
        teksLaporan.innerText = "❌ Gagal memuat AI. Pastikan API Key valid atau cek koneksi internet.";
        console.error(error);
    } finally {
        btnLaporan.disabled = false;
        btnLaporan.innerText = "Perbarui Laporan →";
    }
});