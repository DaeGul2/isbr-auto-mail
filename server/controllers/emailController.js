const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { Email, EmailFile } = require('../db');
dotenv.config();

// ✅ 이메일 생성 + 전송 + 첨부 저장
const createAndSendEmail = async (req, res) => {
  try {
    const {
      title,
      sender,
      recipient,
      recipientName,
      email_html,
      smtpPass,
      projectId,
    } = req.body;

    const files = req.files || [];

    if (!sender || !smtpPass) {
      return res.status(400).json({ message: '이메일 계정정보가 필요합니다.' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.mailplug.co.kr',
      port: 465,
      secure: true,
      auth: {
        user: sender,
        pass: smtpPass,
      },
    });

    const token = uuidv4();
    const responseUrl = `${process.env.RESPONSE_URL}/respond/${token}`;
    // const finalHtml = `${email_html}<div style="margin-top:30px;text-align:center;"><a href="${responseUrl}" style="background-color:#1976d2;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">응답하러 가기</a></div>`;
    const finalHtml = `${email_html}`;

    const emailRecord = await Email.create({
      title,
      sender,
      recipient,
      recipientName,
      email_html: finalHtml,
      token,
      sent_at: new Date(),
      projectId: projectId || null,
    });

    const savedFiles = [];

    for (const file of files) {
      const uuidName = uuidv4() + path.extname(file.originalname);
      const destPath = path.join(__dirname, '..', 'files', uuidName)
      fs.renameSync(file.path, destPath);

      const saved = await EmailFile.create({
        emailId: emailRecord.id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        localPath: destPath,
      });

      savedFiles.push({
        filename: `=?UTF-8?B?${Buffer.from(saved.originalName).toString('base64')}?=`,
        path: saved.localPath,
      });
    }

    await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: title,
      html: finalHtml,
      attachments: savedFiles,
    });

    res.status(201).json(emailRecord);
  } catch (err) {
    console.error('이메일 전송 실패:', err);
    res.status(500).json({ message: '이메일 전송 실패', error: err.message });
  }
};

// ✅ 이메일 목록 조회 (페이지네이션 + hasAttachment 추가)
const getAllEmails = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const result = await Email.findAndCountAll({
    order: [['id', 'DESC']],
    limit,
    offset,
    include: {
      model: EmailFile,
      as: 'files',
      attributes: ['id'],
    },
  });

  const emails = result.rows.map((e) => {
    const plain = e.toJSON();
    return {
      ...plain,
      hasAttachment: (plain.files || []).length > 0,
    };
  });

  res.json({
    total: result.count,
    page,
    limit,
    emails,
  });
};

// ✅ 단일 이메일 조회 (첨부 포함)
const getEmailById = async (req, res) => {
  const { id } = req.params;

  const email = await Email.findByPk(id, {
    include: {
      model: EmailFile,
      as: 'files',
      attributes: ['id', 'originalName', 'mimeType', 'size'],
    },
  });

  if (!email) {
    return res.status(404).json({ message: '해당 이메일이 없습니다.' });
  }

  res.json(email);
};

// ✅ 이메일 삭제
const deleteEmail = async (req, res) => {
  const { id } = req.params;

  const email = await Email.findByPk(id);
  if (!email) {
    return res.status(404).json({ message: '삭제할 이메일이 없습니다.' });
  }

  await EmailFile.destroy({ where: { emailId: id } });
  await email.destroy();

  res.json({ message: '삭제 완료' });
};


const updateEmailStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['대기', '수락', '거절'].includes(status)) {
    return res.status(400).json({ message: '유효하지 않은 상태값입니다.' });
  }

  const email = await Email.findByPk(id);
  if (!email) {
    return res.status(404).json({ message: '이메일을 찾을 수 없습니다.' });
  }

  email.status = status;
  await email.save();

  res.json({ message: '상태가 성공적으로 변경되었습니다.', email });
};


module.exports = {
  createAndSendEmail,
  getAllEmails,
  getEmailById,
  deleteEmail,
  updateEmailStatus
};
