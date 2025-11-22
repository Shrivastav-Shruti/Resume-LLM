import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const uploadJobDescription = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/upload/job-description', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const calculateMatchScore = async (resumeText: string, jobDescriptionText: string, resumeId?: string, jobDescriptionId?: string) => {
  const response = await apiClient.post('/match/score', {
    resumeText,
    jobDescriptionText,
    resumeId,
    jobDescriptionId
  });
  return response.data;
};

export const sendChatMessage = async (message: string, sessionId: string, resumeId?: string) => {
  const response = await apiClient.post('/chat', {
    message,
    sessionId,
    resumeId
  });
  return response.data;
};

export const getChatHistory = async (sessionId: string) => {
  const response = await apiClient.get(`/chat/history/${sessionId}`);
  return response.data;
};

export const getAllSessions = async () => {
  const response = await apiClient.get('/chat/sessions');
  return response.data;
};

export const deleteSession = async (sessionId: string) => {
  const response = await apiClient.delete(`/chat/session/${sessionId}`);
  return response.data;
};

export const updateSessionTitle = async (sessionId: string, title: string) => {
  const response = await apiClient.patch(`/chat/session/${sessionId}/title`, { title });
  return response.data;
};

// Vector deletion methods
export const deleteResume = async (resumeId: string) => {
  const response = await apiClient.delete(`/upload/resume/${resumeId}`);
  return response.data;
};

export const deleteJobDescription = async (jobDescId: string) => {
  const response = await apiClient.delete(`/upload/job-description/${jobDescId}`);
  return response.data;
};

export const deleteAllResumes = async () => {
  const response = await apiClient.delete('/upload/resumes/all');
  return response.data;
};

export const deleteAllJobDescriptions = async () => {
  const response = await apiClient.delete('/upload/job-descriptions/all');
  return response.data;
};

export const deleteAllVectors = async () => {
  const response = await apiClient.delete('/upload/all');
  return response.data;
};
