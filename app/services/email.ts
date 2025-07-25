import { api } from './api';
import { ApiResponse } from '../types/user';

export const sendEmail = async (
  name: string,
  email: string,
  message: string
) => {
  try {
    const response = await api.post<ApiResponse<any>>('/send-email', {
      email,
      name,
      message,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
