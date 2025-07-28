import { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TablePagination,
    Paper, Box, Button
} from '@mui/material';
import { fetchEmails } from '../services/emailService';
import { useNavigate } from 'react-router-dom';

const SentEmailsPage = () => {
    const [emails, setEmails] = useState([]);
    const [pagination, setPagination] = useState({
        page: 0,
        rowsPerPage: 10,
        totalItems: 0,
    });

    const navigate = useNavigate();

    const loadEmails = async () => {
        const res = await fetchEmails(pagination.page + 1, pagination.rowsPerPage);
        setEmails(res.emails);
        setPagination((prev) => ({
            ...prev,
            totalItems: res.total,
        }));
    };

    useEffect(() => {
        loadEmails();
    }, [pagination.page, pagination.rowsPerPage]);

    const handlePageChange = (e, newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleRowsPerPageChange = (e) => {
        setPagination((prev) => ({
            ...prev,
            rowsPerPage: parseInt(e.target.value, 10),
            page: 0,
        }));
    };

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                보낸 메일함
            </Typography>
            <Button variant="contained" onClick={() => navigate('/compose')}>
                메일 쓰기
            </Button>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>발신자</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell>수신자</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>응답 메시지</TableCell>
                            <TableCell>응답일</TableCell>
                            <TableCell>발신일</TableCell>
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
                                <TableCell>{email.sender}</TableCell>
                                <TableCell>{email.title} {email.files?.length > 0 && '📎'}</TableCell>
                                <TableCell>{email.recipient}</TableCell>
                                <TableCell>{email.status}</TableCell>
                                <TableCell>{email.comment || '-'}</TableCell>
                                <TableCell>
                                    {email.responded_at
                                        ? new Date(email.responded_at).toLocaleString('ko-KR')
                                        : '-'}
                                </TableCell>
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
                    count={pagination.totalItems}
                    page={pagination.page}
                    rowsPerPage={pagination.rowsPerPage}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
            </Paper>
        </Container>
    );
};

export default SentEmailsPage;
