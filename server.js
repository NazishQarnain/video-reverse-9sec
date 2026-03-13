const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { processVideo9Reverse } = require('./ffmpeg-utils');

const app = express();
const PORT = process.env.PORT || 3000;

// ensure uploads & processed dirs exist on every start
const uploadsDir = path.join(__dirname, 'uploads');
const processedDir = path.join(__dirname, 'processed');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

// middlewares
app.use('/processed', express.static(processedDir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// upload + processing route
app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: 'No video file' });
    }

    const video = req.files.video;

    console.log('Incoming file:', {
      name: video.name,
      size: video.size,
      mimetype: video.mimetype,
    });

    const safeName = video.name.replace(/\s+/g, '_');
    const uploadPath = path.join(
      uploadsDir,
      Date.now() + '_' + safeName
    );

    console.log('Saving to:', uploadPath);

    // save upload (callback -> promise)
    await new Promise((resolve, reject) => {
      video.mv(uploadPath, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    if (!fs.existsSync(uploadPath)) {
      console.error('File not found after mv:', uploadPath);
      return res.status(500).json({ error: 'Upload save failed (not found)' });
    }

    const outputPath = path.join(
      processedDir,
      Date.now() + '_final.mp4'
    );

    await processVideo9Reverse(uploadPath, outputPath);

    const publicPath = '/processed/' + path.basename(outputPath);
    return res.json({ url: publicPath });
  } catch (err) {
    console.error('Upload/processing error:', err);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
