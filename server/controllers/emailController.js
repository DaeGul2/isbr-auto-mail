const { Email } = require('../db');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config(); // ✅ .env 로드
// ✅ 이메일 생성 + 전송
const createAndSendEmail = async (req, res) => {
  try {
    const {
      title,
      sender,
      recipient,
      email_html,
      smtpPass,
    } = req.body;

    if (!sender || !smtpPass) {
      return res.status(400).json({ message: '이메일 계정정보가 필요합니다.' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.mailplug.co.kr',
      port: 465,
      secure: true,
      service: 'Mailplug',
      auth: {
        user: sender,
        pass: smtpPass,
      },
    });

    const token = uuidv4();

    // ✅ 응답 링크 삽입
    const responseUrl = `${process.env.RESPONSE_URL}/respond/${token}`;
    const responseButtonHtml = `
      <div style="margin-top:30px;text-align:center;">
        <a href="${responseUrl}" 
           style="background-color:#1976d2;color:white;padding:10px 20px;
                  text-decoration:none;border-radius:5px;display:inline-block;">
          응답하러 가기
        </a>
      </div>
    `;

    const finalHtml = `${email_html}${responseButtonHtml}`;

    await transporter.sendMail({
      from: sender,
      to: recipient,
      subject: title,
      html: finalHtml,
    });

    const emailRecord = await Email.create({
      title,
      sender,
      recipient,
      email_html: finalHtml,
      token,
      sent_at: new Date(),
    });

    res.status(201).json(emailRecord);
  } catch (err) {
    console.error('이메일 전송 실패:', err);
    res.status(500).json({ message: '이메일 전송 실패', error: err.message });
  }
};

// ✅ 전체 이메일 조회 (페이지네이션)
const getAllEmails = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const result = await Email.findAndCountAll({
    order: [['id', 'DESC']],
    limit,
    offset,
  });

  res.json({
    total: result.count,
    page,
    limit,
    emails: result.rows,
  });
};

// ✅ 단일 이메일 상세 조회
const getEmailById = async (req, res) => {
  const { id } = req.params;
  const email = await Email.findByPk(id);

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

  await email.destroy();
  res.json({ message: '삭제 완료' });
};

module.exports = {
  createAndSendEmail,
  getAllEmails,
  getEmailById,
  deleteEmail,
};
