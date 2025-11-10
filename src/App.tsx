import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import { theme } from './theme';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Layout>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Box>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
