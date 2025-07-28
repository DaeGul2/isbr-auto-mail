const { Email } = require('../db');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const getResponseStatus = async (req, res) => {
  const { token } = req.params;
  const email = await Email.findOne({ where: { token } });

  if (!email) {
    return res.status(404).json({ message: '유효하지 않은 링크입니다.' });
  }

  if (email.status !== '대기') {
    return res.json({
      responded: true,
      status: email.status,
      comment: email.comment,
      responded_at: email.responded_at,
    });
  }

  res.json({ responded: false });
};

const submitResponse = async (req, res) => {
  const { token } = req.params;
  const { status, comment } = req.body;

  if (!['수락', '거절'].includes(status)) {
    return res.status(400).json({ message: '응답 값이 올바르지 않습니다.' });
  }

  const email = await Email.findOne({ where: { token } });

  if (!email) {
    return res.status(404).json({ message: '유효하지 않은 토큰입니다.' });
  }

  if (email.status !== '대기') {
    return res.status(400).json({ message: '이미 응답이 완료된 요청입니다.' });
  }

  // 상태 업데이트
  email.status = status;
  email.comment = comment || null;
  email.responded_at = new Date();
  await email.save();

  // 메일로 알림 발송
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.mailplug.co.kr',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SYSTEM_SENDER,
        pass: process.env.SYSTEM_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"이메일자동화알림" <${process.env.SYSTEM_SENDER}>`,
      to: email.sender,
      subject: `[응답 완료] ${email.title}`,
      html: `
        <div style="font-family:sans-serif;line-height:1.6">
          <p><strong>${email.recipient}</strong>님이 아래 이메일에 응답하였습니다.</p>
          <p><strong>응답 상태:</strong> ${status}</p>
          <p><strong>코멘트:</strong><br/>${comment ? comment.replace(/\n/g, '<br/>') : '(없음)'}</p>
          <hr/>
          <p><strong>제목:</strong> ${email.title}</p>
          <p><strong>받는 사람:</strong> ${email.recipient}</p>
          <p><strong>보낸 시각:</strong> ${new Date(email.sent_at).toLocaleString('ko-KR')}</p>
        </div>
      `,
    });

    console.log('응답 알림 이메일 발송 완료:', info.messageId);
  } catch (err) {
    console.error('응답 결과 메일 발송 실패:', err.message);
  }

  res.json({ message: '응답이 저장되었습니다.' });
};

module.exports = {
  getResponseStatus,
  submitResponse,
};
