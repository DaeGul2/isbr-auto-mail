import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Container,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Stack,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import { fetchProjects, fetchEmailsByProject } from '../services/projectService';
import { deleteEmail } from '../services/emailService';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const EmailsPerProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [emailsByProject, setEmailsByProject] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);

  const navigate = useNavigate();

  const loadProjects = async () => {
    const res = await fetchProjects(1, 1000);
    setProjects(res.projects);
    if (res.projects.length > 0) setSelectedProjectId(res.projects[0].id);

    const emailMap = {};
    for (const p of res.projects) {
      const res = await fetchEmailsByProject(p.id, 1, 1000);
      emailMap[p.id] = res.emails;
    }
    setEmailsByProject(emailMap);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId && emailsByProject[selectedProjectId]) {
      let all = emailsByProject[selectedProjectId];
      if (statusFilter !== '전체') {
        all = all.filter((e) => e.status === statusFilter);
      }
      const offset = pagination.page * pagination.rowsPerPage;
      const paged = all.slice(offset, offset + pagination.rowsPerPage);
      setEmails(paged);
      setPagination((p) => ({ ...p, total: all.length }));
    }
  }, [selectedProjectId, emailsByProject, pagination.page, pagination.rowsPerPage, statusFilter]);

  const handleStatusChange = async (emailId, newStatus) => {
    try {
      await API.patch(`/emails/${emailId}`, { status: newStatus });
      loadProjects(); // refresh
    } catch (err) {
      alert('상태 변경 실패');
    }
  };

  const handleSelect = (id) => {
    setSelectedEmailIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedEmailIds.length === 0) return;
    if (!window.confirm(`정말 ${selectedEmailIds.length}개 메일을 삭제하시겠습니까?`)) return;

    await Promise.all(selectedEmailIds.map((id) => deleteEmail(id)));
    setSelectedEmailIds([]);
    loadProjects();
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteEmail(id);
    loadProjects();
  };

  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .map((p) => {
        const stats = { total: 0, 대기: 0, 수락: 0, 거절: 0 };
        const list = emailsByProject[p.id] || [];
        for (const e of list) {
          stats.total++;
          stats[e.status] = (stats[e.status] || 0) + 1;
        }
        return { ...p, stats };
      });
  }, [projects, search, emailsByProject]);

  return (
    <Container sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">📁 프로젝트별 메일함</Typography>
        <Button variant="contained" onClick={() => navigate('/compose')}>✉ 메일 작성</Button>
      </Stack>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* 프로젝트 목록 */}
        <Paper sx={{ width: 300, height: '70vh', display: 'flex', flexDirection: 'column' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="프로젝트명 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ p: 1 }}
          />
          <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
            <List dense>
              {filteredProjects.map((p) => (
                <ListItemButton
                  key={p.id}
                  selected={p.id === selectedProjectId}
                  onClick={() => {
                    setSelectedProjectId(p.id);
                    setPagination((prev) => ({ ...prev, page: 0 }));
                  }}
                >
                  <ListItemText
                    primary={p.name}
                    secondary={
                      <>
                        {new Date(p.createdAt).toLocaleString('ko-KR')}
                        <br />
                        총 {p.stats.total} / 대기 {p.stats['대기']} / 수락 {p.stats['수락']} / 거절 {p.stats['거절']}
                      </>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Paper>

        {/* 이메일 목록 */}
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="전체">전체</MenuItem>
              <MenuItem value="대기">대기</MenuItem>
              <MenuItem value="수락">수락</MenuItem>
              <MenuItem value="거절">거절</MenuItem>
            </Select>

            <Button
              variant="outlined"
              color="error"
              size="small"
              disabled={selectedEmailIds.length === 0}
              onClick={handleDeleteSelected}
            >
              선택 삭제
            </Button>
          </Stack>

          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>제목</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>수신자</TableCell>
                  <TableCell>상태</TableCell>

                  <TableCell>보낸시각</TableCell>
                  <TableCell>작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emails.map((email) => (
                  <TableRow key={email.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedEmailIds.includes(email.id)}
                        onChange={() => handleSelect(email.id)}
                      />
                    </TableCell>
                    <TableCell>
                      {email.title.length > 10 ? `${email.title.slice(0, 10)}...` : email.title}
                      {email.files?.length > 0 && '📎'}
                    </TableCell>
                    <TableCell>{email.recipient}</TableCell>
                    <TableCell>{email.recipientName || '-'}</TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={email.status}
                        onChange={(e) => handleStatusChange(email.id, e.target.value)}
                      >
                        <MenuItem value="대기">대기</MenuItem>
                        <MenuItem value="수락">수락</MenuItem>
                        <MenuItem value="거절">거절</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell>{email.sent_at ? new Date(email.sent_at).toLocaleString('ko-KR') : '-'}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/emails/${email.id}`)}
                        >
                          자세히
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSingle(email.id)}
                        >
                          삭제
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page}
              rowsPerPage={pagination.rowsPerPage}
              onPageChange={(e, newPage) =>
                setPagination((p) => ({ ...p, page: newPage }))
              }
              onRowsPerPageChange={(e) =>
                setPagination((p) => ({
                  ...p,
                  rowsPerPage: parseInt(e.target.value, 10),
                  page: 0,
                }))
              }
            />
          </Paper>

          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/')}>
            📦 전체 메일함으로 이동
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default EmailsPerProjectPage;
