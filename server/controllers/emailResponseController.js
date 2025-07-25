const { Email } = require('../db');

// ✅ 응답 상태 조회
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

// ✅ 응답 제출 (수락/거절 + 코멘트)
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

  email.status = status;
  email.comment = comment || null;
  email.responded_at = new Date();
  await email.save();

  res.json({ message: '응답이 저장되었습니다.' });
};

module.exports = {
  getResponseStatus,
  submitResponse,
};
