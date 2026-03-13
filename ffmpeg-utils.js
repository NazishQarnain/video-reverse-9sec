const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve({ stdout, stderr });
    });
  });
}

async function processVideo9Reverse(inputPath, outputPath) {
  const workDir = path.dirname(outputPath);
  const noaudio = path.join(workDir, 'noaudio_' + path.basename(inputPath));
  const partsDir = path.join(workDir, 'parts_' + Date.now());
  fs.mkdirSync(partsDir, { recursive: true });

  await run(`ffmpeg -y -i "${inputPath}" -an -c:v copy "${noaudio}"`);

  await run(
    `ffmpeg -y -i "${noaudio}" -c:v libx264 -crf 22 -map 0 -segment_time 9 ` +
      `-g 18 -sc_threshold 0 -force_key_frames "expr:gte(t,n_forced*9)" ` +
      `-f segment "${partsDir}/out%03d.mp4"`
  );

  const files = fs
    .readdirSync(partsDir)
    .filter((f) => f.startsWith('out') && f.endsWith('.mp4'))
    .sort();

  const listFile = path.join(partsDir, 'files.txt');
  const lines = [];

  for (const f of files) {
    const inFile = path.join(partsDir, f);
    const rFile = path.join(partsDir, 'r_' + f);
    await run(`ffmpeg -y -i "${inFile}" -vf reverse "${rFile}"`);
    lines.push(`file '${rFile.replace(/'/g, "'\\''")}'`);
  }

  fs.writeFileSync(listFile, lines.join('\n'));

  await run(`ffmpeg -y -f concat -safe 0 -i "${listFile}" -c copy "${outputPath}"`);
}

module.exports = { processVideo9Reverse };
