import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEmailById } from '../services/emailService';

const EmailDetailModal = () => {
  const { id } = useParams();
  const [email, setEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await fetchEmailById(id);
      setEmail(data);
    };
    load();
  }, [id]);

  if (!email) return <div>로딩 중...</div>;

  return (
    <div style={{ background: '#fff', padding: 20 }}>
      <button onClick={() => navigate(-1)}>닫기</button>
      <h3>{email.title}</h3>
      <div dangerouslySetInnerHTML={{ __html: email.email_html }} />
      {email.files?.length > 0 && (
        <>
          <h4>📎 첨부파일</h4>
          <ul>
            {email.files.map((f) => (
              <li key={f.id}>
                <a href={`/api/email-files/${f.id}/download`} target="_blank" rel="noreferrer">
                  {f.originalName}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      <p>상태: {email.status}</p>
      {email.comment && <p>응답 메시지: {email.comment}</p>}
    </div>
  );
};

export default EmailDetailModal;
