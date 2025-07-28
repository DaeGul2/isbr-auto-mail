import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
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
} from '@mui/material';
import { fetchProjects, fetchEmailsByProject } from '../services/projectService';
import { useNavigate } from 'react-router-dom';

const EmailsPerProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [emailsByProject, setEmailsByProject] = useState({}); // id → 이메일 배열
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 20, total: 0 });
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  const loadProjects = async () => {
    const res = await fetchProjects(1, 1000);
    setProjects(res.projects);
    if (res.projects.length > 0) {
      setSelectedProjectId(res.projects[0].id);
    }

    // 프로젝트별 메일 미리 조회
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
      const all = emailsByProject[selectedProjectId];
      const offset = pagination.page * pagination.rowsPerPage;
      const paged = all.slice(offset, offset + pagination.rowsPerPage);
      setEmails(paged);
      setPagination((p) => ({ ...p, total: all.length }));
    }
  }, [selectedProjectId, emailsByProject, pagination.page, pagination.rowsPerPage]);

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
        <Button variant="contained" onClick={() => navigate('/compose')}>
          ✉ 메일 작성
        </Button>
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
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>제목</TableCell>
                  <TableCell>수신자</TableCell>
                  <TableCell>상태</TableCell>
                  <TableCell>응답</TableCell>
                  <TableCell>보낸시각</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emails.map((email) => (
                  <TableRow
                    key={email.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/emails/${email.id}`)}
                  >
                    <TableCell>{email.title}</TableCell>
                    <TableCell>{email.recipient}</TableCell>
                    <TableCell>{email.status}</TableCell>
                    <TableCell>{email.comment || '-'}</TableCell>
                    <TableCell>
                      {email.sent_at
                        ? new Date(email.sent_at).toLocaleString('ko-KR')
                        : '-'}
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
