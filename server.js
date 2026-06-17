const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
// Railway akan otomatis memberikan PORT dinamis lewat process.env.PORT
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Sajikan file frontend (HTML, CSS, JS) dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// DATABASE SIMULASI (Nanti di-upgrade ke MongoDB asli di Railway)
let databaseTabungan = {
    totalSaldo: 0,
    logs: []
};

// Endpoint API 1: Mengambil data saldo dan logs terbaru
app.get('/api/tabungan', (req, res) => {
    res.json(databaseTabungan);
});

// Endpoint API 2: Request Menabung & Generate Data QRIS
app.post('/api/nabung', (req, res) => {
    const { nominal, namaUser } = req.body;

    if (!nominal || nominal < 10000) {
        return res.status(400).json({ error: 'Minimal nominal Rp 10.000, mamen!' });
    }

    // Di sinilah nanti kode "Midtrans Snap / QRIS API" asli diletakkan
    const qrDataSimulasi = "https://midtrans.com/simulasi-qris-" + nominal + "-" + Date.now();

    res.json({
        success: true,
        nominal: nominal,
        namaUser: namaUser,
        qrData: qrDataSimulasi
    });
});

// Endpoint API 3: Callback/Webhook saat Pembayaran Sukses
app.post('/api/bayar-sukses', (req, res) => {
    const { nominal, namaUser } = req.body;

    databaseTabungan.totalSaldo += parseInt(nominal);
    
    const waktu = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
    databaseTabungan.logs.unshift({
        teks: `Nabung Rp ${parseInt(nominal).toLocaleString('id-ID')}`,
        user: namaUser,
        waktu: waktu
    });

    res.json({ success: true, message: 'Saldo berhasil diperbarui di server cloud!' });
});

app.listen(PORT, () => {
    console.log(`Server cloud Arput jalan di port ${PORT}`);
});
