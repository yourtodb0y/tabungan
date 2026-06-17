const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Menggunakan path.resolve agar jalurnya absolut sempurna di serverless function
const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

let databaseTabungan = {
    totalSaldo: 0,
    logs: []
};

app.get('/api/tabungan', (req, res) => {
    res.json(databaseTabungan);
});

app.post('/api/nabung', (req, res) => {
    const { nominal, namaUser } = req.body;
    if (!nominal || nominal < 10000) {
        return res.status(400).json({ error: 'Minimal nominal Rp 10.000, mamen!' });
    }
    const qrDataSimulasi = "https://midtrans.com/simulasi-qris-" + nominal + "-" + Date.now();
    res.json({
        success: true,
        nominal: nominal,
        namaUser: namaUser,
        qrData: qrDataSimulasi
    });
});

app.post('/api/bayar-sukses', (req, res) => {
    const { nominal, namaUser } = req.body;
    databaseTabungan.totalSaldo += parseInt(nominal);
    const waktu = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
    databaseTabungan.logs.unshift({
        teks: `Nabung Rp ${parseInt(nominal).toLocaleString('id-ID')}`,
        user: namaUser,
        waktu: waktu
    });
    res.json({ success: true, message: 'Saldo berhasil diperbarui!' });
});

// Sajikan index.html secara eksplisit jika user mengakses halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.resolve(publicPath, 'index.html'));
});

// Fallback untuk rute lainnya
app.get('*', (req, res) => {
    res.sendFile(path.resolve(publicPath, 'index.html'));
});

module.exports = app;
