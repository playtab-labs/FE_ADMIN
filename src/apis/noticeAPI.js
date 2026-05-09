import api from './instance';

export const createNotice = async (body) => {
  const response = await api.post('/admin/notices', body);
  return response.data;
};

export const updateNotice = async (id, body) => {
  const response = await api.put(`/admin/notices/${id}`, body);
  return response.data;
};

export const deleteNotice = async (id) => {
  const response = await api.delete(`/admin/notices/${id}`);
  return response.data;
};

export const getNoticeDetail = async (noticeId) => {
  const response = await api.post('/graphql', {
    query: `
      query NoticeDetail($noticeId: ID!) {
        noticeDetail(noticeId: $noticeId) {
          id
          title
          content
          postedAt
          isPinned
          imageUrl
        }
      }
    `,
    variables: { noticeId },
  });
  return response.data.data.noticeDetail;
};

export const getNotices = async () => {
  const response = await api.post('/graphql', {
    query: `
      query Notices {
        notices {
          notices {
            id
            title
            postedAt
            isPinned
            imageUrl
            contentPreview
          }
        }
      }
    `,
  });
  return response.data.data.notices.notices;
};
