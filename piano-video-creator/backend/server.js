const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

const VideoRequest = require('./models/VideoRequest');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Servir statiquement les fichiers générés
app.use('/download', express.static(path.join(__dirname, 'temp')));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connecté`);
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error);
    process.exit(1);
  }
};
module.exports = connectDB;
connectDB();

// Helper pour exécuter une commande Python depuis le venv local
const runPythonScript = (scriptName, args) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'scripts', scriptName);
    const pythonExe = os.platform() === 'win32'
      ? path.join(__dirname, 'venv', 'Scripts', 'python.exe')
      : path.join(__dirname, 'venv', 'bin', 'python');

    const command = `"${pythonExe}" "${scriptPath}" ${args.map(a => `"${a}"`).join(' ')}`;

    console.log(`Exécution : ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur [${scriptName}]:`, stderr);
        return reject(error);
      }
      console.log(`[${scriptName} log]:`, stdout);
      resolve(stdout);
    });
  });
};

app.post('/api/generate', async (req, res) => {
  const { input, mode = 'audio', fetchSubtitles = false } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Une URL YouTube ou un titre est requis.' });
  }

  console.log(`Nouvelle demande Média (${mode}) reçue pour : ${input} | Sous-titres: ${fetchSubtitles}`);

  // Simulation ID (unique temp name)
  const reqId = Date.now().toString();

  // Dossiers temp
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const baseMediaFile = path.join(tempDir, reqId);

  try {
    let subtitlesText = null;

    if (fetchSubtitles) {
      const subFileBase = path.join(tempDir, `${reqId}_subs`);
      try {
        console.log(`[Pipeline] Extraction des sous-titres...`);
        await runPythonScript('get_subtitles.py', [input, subFileBase]);

        const txtFile = `${subFileBase}.txt`;
        if (fs.existsSync(txtFile)) {
          subtitlesText = fs.readFileSync(txtFile, 'utf8');
          fs.unlinkSync(txtFile); // clean up
        }
      } catch (err) {
        console.error("[Pipeline] Erreur sous-titres (ignorée) :", err);
      }
    }

    // 1. Download YouTube Media
    console.log(`[Pipeline] Téléchargement Média (${mode})...`);
    await runPythonScript('youtube_to_audio.py', [input, baseMediaFile, mode]);

    // Find the actual downloaded file's extension (could be .webm, .m4a, .mp4, etc.)
    const files = fs.readdirSync(tempDir);
    const downloadedFile = files.find(f => f.startsWith(reqId + '.') && f !== `${reqId}_subs.txt`);

    if (!downloadedFile) {
      throw new Error("Fichier non trouvé après le téléchargement.");
    }

    console.log(`[Pipeline] Terminé avec succès ! Fichier Média prêt : ${downloadedFile}`);

    res.json({
      message: 'Téléchargement réussi !',
      status: 'success',
      mediaUrl: `http://localhost:${PORT}/download/${downloadedFile}`,
      subtitles: subtitlesText
    });

  } catch (error) {
    console.error("[Pipeline] Erreur fatale :", error);
    res.status(500).json({ error: "Erreur lors du traitement de la vidéo YouTube." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
