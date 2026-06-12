import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ThemeBackground from './components/ThemeBackground';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeBackground />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
