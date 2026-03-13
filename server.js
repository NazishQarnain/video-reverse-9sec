const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { processVideo9Reverse } = require('./ffmpeg-utils');

const app = express();
const PORT = process.env.PORT || 3000;

// ensure uploads & processed dirs exist
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir);

// static files
app.use('/processed', express.static(processedDir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: 'No video file' });
    }

    const video = req.files.video;
    const uploadPath = path.join(
      uploadsDir,
      Date.now() + '_' + video.name.replace(/\s+/g, '_')
    );

    // save upload
    try {
      await video.mv(uploadPath);
    } catch (e) {
      console.error('Upload save error', e);
      return res.status(500).json({ error: 'Upload save failed' });
    }

    const outputPath = path.join(
      processedDir,
      Date.now() + '_final.mp4'
    );

    await processVideo9Reverse(uploadPath, outputPath);

    const publicPath = '/processed/' + path.basename(outputPath);
    res.json({ url: publicPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
