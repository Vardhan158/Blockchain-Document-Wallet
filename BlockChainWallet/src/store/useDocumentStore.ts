import { create } from 'zustand';
import api from '../services/api';
import { DocumentItem, DocumentType, ApprovedTag } from '../types/models';

interface DocumentState {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;

  fetchDocuments: () => Promise<void>;
  fetchDocumentDetails: (id: string) => Promise<DocumentItem | null>;
  uploadDocument: (title: string, documentType: DocumentType, requestedTag: ApprovedTag, file?: any) => Promise<boolean>;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  selectedDocument: null,
  isLoading: false,
  isUploading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/documents');
      set({ documents: response.data.documents || [], isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load documents';
      set({ error: msg, isLoading: false });
    }
  },

  fetchDocumentDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/documents/${id}`);
      const doc = response.data.document;
      set({ selectedDocument: doc, isLoading: false });
      return doc;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load document details';
      set({ error: msg, isLoading: false });
      return null;
    }
  },

  uploadDocument: async (title, documentType, requestedTag, file) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('documentType', documentType);
      formData.append('requestedTag', requestedTag);

      if (file) {
        const fileUri = file.fileCopyUri || file.uri;
        formData.append('file', {
          uri: fileUri,
          type: file.type || 'application/pdf',
          name: file.name || `${title}.pdf`,
        } as any);
      }

      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      set({ isUploading: false });
      await get().fetchDocuments();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to upload document';
      set({ error: msg, isUploading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDocumentStore;

