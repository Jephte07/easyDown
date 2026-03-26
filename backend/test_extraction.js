const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const pythonExe = path.join(__dirname, 'venv', 'Scripts', 'python.exe');
const scriptPath = path.join(__dirname, 'scripts', 'youtube_to_audio.py');
const outputBase = path.join(__dirname, 'temp', 'test_output');
const youtubeUrl = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'; // Une vidéo courte de test

if (!fs.existsSync(path.join(__dirname, 'temp'))) {
    fs.mkdirSync(path.join(__dirname, 'temp'));
}

const command = `"${pythonExe}" "${scriptPath}" "${youtubeUrl}" "${outputBase}" "audio"`;
console.log(`Exécution : ${command}`);

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`ERREUR :`, stderr || error.message);
    } else {
        console.log(`STDOUT :`, stdout);
        console.warn(`STDERR :`, stderr);
    }
});
