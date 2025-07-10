'use client';

import { useTheme } from 'next-themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ThemeToastContainer() {
const {theme} = useTheme()
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      draggable
      pauseOnHover
      theme={theme}
      toastClassName="toastify-theme shadow-md border border-border rounded-xl px-4 py-3 text-base font-medium"
    />
  );
}