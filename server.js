const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const { processVideo9Reverse } = require('./ffmpeg-utils');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/processed', express.static(path.join(__dirname, 'processed')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: 'No video file' });
    }

    const video = req.files.video;
    const uploadPath = path.join(__dirname, 'uploads', Date.now() + '_' + video.name);

    await video.mv(uploadPath);

    const outputPath = path.join(
      __dirname,
      'processed',
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
