import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState, MouseEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  selectIsAuthenticated,
  selectUser,
  logoutUser,
} from '@/store/slices/authSlice';

function Header() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    void dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <AccountBalanceIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            Finances App
          </Typography>
        </Box>

        {isAuthenticated ? (
          <>
            <Button
              color="inherit"
              component={RouterLink}
              to="/dashboard"
              sx={{ mr: 1 }}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/accounts"
              sx={{ mr: 1 }}
            >
              Accounts
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/financial-institutions"
              sx={{ mr: 1 }}
            >
              Institutions
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/securities"
              sx={{ mr: 1 }}
            >
              Securities
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/currencies"
              sx={{ mr: 2 }}
            >
              Currencies
            </Button>
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user?.email || user?.username}
            </Typography>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              aria-label="user menu"
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to="/register"
              sx={{ borderColor: 'white', '&:hover': { borderColor: 'white' } }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
