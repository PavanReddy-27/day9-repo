import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useSSE } from './hooks/useSSE';

export default function App() {
  useSSE(); // Initialize Server-Sent Events listener for real-time dashboard updates

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
