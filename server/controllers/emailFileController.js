const path = require('path');
const fs = require('fs');
const { EmailFile } = require('../db');
const { v4: uuidv4 } = require('uuid');

// 첨부파일 다운로드
const downloadFile = async (req, res) => {
  const { id } = req.params;
  const file = await EmailFile.findByPk(id);
  if (!file) return res.status(404).json({ message: '파일이 없습니다.' });

  const filePath = path.resolve(file.localPath);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: '파일이 존재하지 않습니다.' });

  try {
    const encoded = encodeURIComponent(file.originalName);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`
    );
    res.setHeader('Content-Type', file.mimeType);
    res.sendFile(filePath);
  } catch (err) {
    console.error('❌ 파일 전송 중 오류:', err);
    res.status(500).json({ message: '파일 전송 중 오류', error: err.message });
  }
};
module.exports = { downloadFile };
