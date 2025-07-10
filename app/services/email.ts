import { api } from './api';

export const sendEmail = async (
  name: string,
  email: string,
  message: string
) => {
  try {
    const response = await api.post('/send-emails', {
      email,
      name,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
