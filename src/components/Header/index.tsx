import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <AccountBalanceIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Finances App
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
