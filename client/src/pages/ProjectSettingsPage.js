import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { createProject, fetchProjects, updateProject, deleteProject } from '../services/projectService';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ProjectSettingsPage = () => {
  const [projects, setProjects] = useState([]);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const loadProjects = async () => {
    const res = await fetchProjects(1, 100);
    setProjects(res.projects);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createProject(newName.trim());
    setNewName('');
    await loadProjects();
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    await updateProject(id, editName.trim());
    setEditId(null);
    setEditName('');
    await loadProjects();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteProject(id);
    await loadProjects();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>프로젝트 설정</Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            label="새 프로젝트명"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleCreate}>추가</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>프로젝트명</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell align="right">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {editId === p.id ? (
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      size="small"
                    />
                  ) : (
                    p.name
                  )}
                </TableCell>
                <TableCell>{new Date(p.createdAt).toLocaleString('ko-KR')}</TableCell>
                <TableCell align="right">
                  {editId === p.id ? (
                    <Button size="small" onClick={() => handleUpdate(p.id)}>저장</Button>
                  ) : (
                    <IconButton onClick={() => { setEditId(p.id); setEditName(p.name); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton onClick={() => handleDelete(p.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ProjectSettingsPage;
