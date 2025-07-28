import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Container, Typography, Paper, TextField, Button, Box,
  Chip, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, Table, TableHead, TableBody,
  TableRow, TableCell, MobileStepper, Select, MenuItem,
} from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { sendEmail } from '../services/emailService';
import { fetchProjects, createProject } from '../services/projectService';

const ComposeEmailPage = () => {
  const [columns, setColumns] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [smtpDialogOpen, setSmtpDialogOpen] = useState(false);
  const [smtpInfo, setSmtpInfo] = useState({ email: '', password: '' });
  const [sendResults, setSendResults] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [attachments, setAttachments] = useState([]); // ✅ 첨부파일
  const quillRef = useRef(null);

  useEffect(() => {
    const loadProjects = async () => {
      const res = await fetchProjects(1, 100);
      setProjectList(res.projects);
    };
    loadProjects();
  }, []);

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const headers = data[0];
      const rows = data.slice(1);

      if (!headers.includes('email')) {
        alert('"email" 컬럼이 필수입니다.');
        setColumns([]); setExcelData([]); return;
      }

      setColumns(headers);
      setExcelData(rows);
    };
    reader.readAsBinaryString(file);
  };

  const applyTemplate = (template, row, headers) => {
    let result = template;
    headers.forEach((header, idx) => {
      const regex = new RegExp(`{{\\s*${header}\\s*}}`, 'g');
      result = result.replace(regex, row[idx]);
    });
    return result;
  };

  const handleInsertTag = (tag) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const cursor = editor.getSelection()?.index ?? editor.getLength();
      editor.insertText(cursor, tag);
      editor.setSelection(cursor + tag.length);
    }
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const handlePreview = () => {
    if (!title || !body || columns.length === 0 || excelData.length === 0) {
      alert('엑셀, 제목, 본문 모두 입력해주세요.');
      return;
    }
    setPreviewOpen(true);
    setActiveStep(0);
  };

  const handleSend = () => {
    if (!selectedProjectId) {
      alert('프로젝트를 선택해주세요.');
      return;
    }
    setSmtpDialogOpen(true);
  };

  const confirmSend = async () => {
    if (!smtpInfo.email || !smtpInfo.password) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const results = [];

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const personalizedTitle = applyTemplate(title, row, columns);
      const personalizedBody = applyTemplate(body, row, columns);
      const recipient = row[columns.indexOf('email')];

      try {
        await sendEmail({
          title: personalizedTitle,
          sender: smtpInfo.email,
          recipient,
          email_html: personalizedBody,
          smtpPass: smtpInfo.password,
          projectId: selectedProjectId,
        }, attachments); // ✅ 파일 포함

        results.push({ row: i + 1, recipient, success: true });
      } catch (err) {
        results.push({ row: i + 1, recipient, success: false, error: err.message });
      }
    }

    setSendResults(results);
    setSmtpDialogOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>메일 작성</Typography>

      {/* 엑셀 업로드 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1">1. 엑셀 업로드</Typography>
        <Button variant="outlined" component="label">
          엑셀 파일 선택
          <input type="file" hidden accept=".xlsx, .xls" onChange={handleExcelUpload} />
        </Button>
        {columns.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">사용 가능한 변수 태그:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {columns.map((col) => (
                <Chip key={col} label={`{{${col}}}`} onClick={() => handleInsertTag(`{{${col}}}`)} />
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* 프로젝트 선택 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1">2. 프로젝트 선택</Typography>
        <Select fullWidth value={selectedProjectId} displayEmpty onChange={(e) => setSelectedProjectId(e.target.value)} sx={{ mb: 2 }}>
          <MenuItem value="">(선택 안 됨)</MenuItem>
          {projectList.map((p) => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </Select>
        <Stack direction="row" spacing={2}>
          <TextField
            label="새 프로젝트명"
            fullWidth
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={async () => {
              if (!newProjectName.trim()) return;
              const newP = await createProject(newProjectName.trim());
              setProjectList((prev) => [newP, ...prev]);
              setSelectedProjectId(newP.id);
              setNewProjectName('');
            }}
          >
            추가
          </Button>
        </Stack>
      </Paper>

      {/* 제목/본문 + 첨부 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1">3. 제목 및 본문 작성</Typography>
        <TextField
          fullWidth label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <ReactQuill
          ref={quillRef}
          value={body}
          onChange={setBody}
          modules={{
            toolbar: [['bold', 'italic'], ['link'], ['clean']],
          }}
          style={{ height: 250, marginBottom: 20 }}
        />

        {/* ✅ 파일 첨부 */}
        <Typography variant="subtitle1">📎 첨부파일</Typography>
        <Button component="label" variant="outlined">
          파일 선택
          <input type="file" hidden multiple onChange={handleFileChange} />
        </Button>
        <ul>
          {attachments.map((f, i) => (
            <li key={i}>{f.name} ({Math.round(f.size / 1024)} KB)</li>
          ))}
        </ul>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={handlePreview}>미리보기</Button>
        <Button variant="contained" onClick={handleSend} disabled={!excelData.length}>
          보내기
        </Button>
      </Stack>

      {/* 미리보기 */}
      {previewOpen && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="subtitle1">미리보기 {activeStep + 1} / {excelData.length}</Typography>
          <Typography variant="h6">제목: {applyTemplate(title, excelData[activeStep], columns)}</Typography>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <div dangerouslySetInnerHTML={{ __html: applyTemplate(body, excelData[activeStep], columns) }} />
          </Paper>
          <MobileStepper
            steps={excelData.length}
            position="static"
            activeStep={activeStep}
            nextButton={<Button size="small" onClick={() => setActiveStep((s) => s + 1)} disabled={activeStep === excelData.length - 1}>다음<KeyboardArrowRight /></Button>}
            backButton={<Button size="small" onClick={() => setActiveStep((s) => s - 1)} disabled={activeStep === 0}><KeyboardArrowLeft />이전</Button>}
          />
        </Paper>
      )}

      {/* SMTP 다이얼로그 */}
      <Dialog open={smtpDialogOpen} onClose={() => setSmtpDialogOpen(false)}>
        <DialogTitle>이메일 로그인 정보</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="이메일" value={smtpInfo.email} onChange={(e) => setSmtpInfo((p) => ({ ...p, email: e.target.value }))} />
          <TextField fullWidth type="password" margin="dense" label="비밀번호" value={smtpInfo.password} onChange={(e) => setSmtpInfo((p) => ({ ...p, password: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmtpDialogOpen(false)}>취소</Button>
          <Button onClick={confirmSend} variant="contained">보내기</Button>
        </DialogActions>
      </Dialog>

      {/* 전송 결과 */}
      {sendResults.length > 0 && (
        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6">전송 결과</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>수신자</TableCell>
                <TableCell>결과</TableCell>
                <TableCell>오류</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sendResults.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.row}</TableCell>
                  <TableCell>{r.recipient}</TableCell>
                  <TableCell>{r.success ? '성공' : '실패'}</TableCell>
                  <TableCell>{r.error || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
};

export default ComposeEmailPage;
