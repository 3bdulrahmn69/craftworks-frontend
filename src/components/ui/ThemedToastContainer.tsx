import { ToastContainer } from 'react-toastify';
import useTheme from '../../hooks/useTheme';

const ThemedToastContainer = () => {
  const { theme } = useTheme();
  return <ToastContainer position="bottom-right" theme={theme} />;
};

export default ThemedToastContainer;