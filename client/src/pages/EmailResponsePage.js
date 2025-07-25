import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { getEmailResponseStatus, submitEmailResponse } from '../services/emailResponseService';

const EmailResponsePage = () => {
  const { token } = useParams();
  const [email, setEmail] = useState(null);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getEmailResponseStatus(token);
      if (data.responded) {
        setSubmitted(true);
        setStatus(data.status);
        setComment(data.comment);
      } else {
        const res = await fetch(`/api/email-responses/${token}`);
        const emailData = await res.json();
        setEmail(emailData);
      }
    };
    load();
  }, [token]);

  const handleSubmit = async () => {
    if (!status) {
      alert('응답 상태를 선택해주세요.');
      return;
    }
    await submitEmailResponse(token, { status, comment });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>이미 응답이 완료되었습니다.</Typography>
          <Typography><strong>내 답변:</strong> {status}</Typography>
          <Typography><strong>메시지:</strong> {comment || '-'}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>메일 응답</Typography>

        {email?.email_html && (
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <div dangerouslySetInnerHTML={{ __html: email.email_html }} />
          </Paper>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">응답 선택</MenuItem>
            <MenuItem value="수락">✅ 수락</MenuItem>
            <MenuItem value="거절">❌ 거절</MenuItem>
          </Select>

          <TextField
            label="추가 메시지 (선택)"
            multiline
            minRows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button variant="contained" onClick={handleSubmit}>
            응답 제출
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailResponsePage;
