import api from '../services/api';

export const documentApi = {
  getDocuments: () => api.get('/v1/documents'),
  getDocumentDetails: (id: string) => api.get(`/v1/documents/${id}`),
  uploadDocument: (formData: FormData) =>
    api.post('/v1/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  reuploadDocument: (id: string, formData: FormData) =>
    api.post(`/v1/documents/${id}/reupload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteDocument: (id: string) => api.delete(`/v1/documents/${id}`),
  getBlockchainStatus: (id: string) => api.get(`/v1/documents/${id}/blockchain-status`),
};

export default documentApi;
