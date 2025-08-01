import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LayoutBar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="default" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          이메일 자동화 시스템
        </Typography>
        <Stack direction="row" spacing={2}>
          {/* <Button color="inherit" onClick={() => navigate('/')}>
            전체 이메일
          </Button> */}
          <Button color="inherit" onClick={() => navigate('/projects-emails')}>
            프로젝트별 이메일
          </Button>
          {/* <Button color="inherit" onClick={() => navigate('/projects')}>
            프로젝트 설정
          </Button> */}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default LayoutBar;
