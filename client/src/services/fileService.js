import API from './api';

export const downloadFile = async (fileId) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/email-files/${fileId}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!res.ok) throw new Error('파일 다운로드 실패');

    const blob = await res.blob();
    const contentDisposition = res.headers.get('Content-Disposition');
    let filename = '파일명없음';

    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]*)["']?/);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('파일 다운로드 중 오류가 발생했습니다.');
    console.error(err);
  }
};
