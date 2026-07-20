import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Badge,
  Popover,
  Stack,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  Search,
  Message,
  FileUpload,
  Work,
  Group,
  ListAlt,
  ExitToApp,
  Notifications,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import VistroLogo from '../common/VistroLogo';
import notificationService from '../../services/notification.service';
import type { NotificationResponseDto } from '../../types/messaging';

const DRAWER_WIDTH = 280;

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isStudent = user?.roles.includes('Student');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Notification states
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!user) return;
    
    fetchNotifications();
    
    // Poll every 10 seconds for notifications
    const timer = setInterval(() => {
      fetchNotifications();
    }, 10000);
    
    return () => clearInterval(timer);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.succeeded && response.data) {
        setNotifications(response.data);
      }
    } catch {
      // Quiet fail
    }
  };

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const item of unread) {
      try {
        await notificationService.markRead(item.id);
      } catch {
        // Continue
      }
    }
    fetchNotifications();
  };

  const handleNotifClick = async (notif: NotificationResponseDto) => {
    if (!notif.isRead) {
      try {
        await notificationService.markRead(notif.id);
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
      } catch {
        // Continue
      }
    }
    
    handleNotifClose();
    
    // Role redirects based on notification type
    if (notif.notificationType === 'JobInvitationReceived' || notif.notificationType === 'NewEmployerMessage' || notif.notificationType === 'NewStudentMessage') {
      navigate('/messages');
    } else if (notif.notificationType === 'JobInvitationAccepted' || notif.notificationType === 'JobInvitationDeclined') {
      navigate('/messages');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = async () => {
    handleUserMenuClose();
    await logout();
    navigate('/login');
  };

  // Determine navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    const links = [];

    if (user.roles.includes('Admin')) {
      links.push(
        { text: 'Dashboard', path: '/admin/dashboard', icon: <Dashboard /> },
        { text: 'User Directory', path: '/admin/users', icon: <Group /> },
        { text: 'System Audits', path: '/admin/audit-logs', icon: <ListAlt /> }
      );
    }

    if (user.roles.includes('Student')) {
      links.push(
        { text: 'Dashboard', path: '/student/dashboard', icon: <Dashboard /> }
      );
    }

    if (user.roles.includes('ShopOwner')) {
      links.push(
        { text: 'Dashboard', path: '/employer/dashboard', icon: <Dashboard /> },
        { text: 'Business Profile', path: '/employer/profile', icon: <Person /> },
        { text: 'Upload Verification', path: '/employer/documents', icon: <FileUpload /> },
        { text: 'Manage Job Posts', path: '/job-postings/my', icon: <Work /> },
        { text: 'Student Search', path: '/employer/students', icon: <Search /> },
        { text: 'Inbox', path: '/messages', icon: <Message /> }
      );
    }

    return links;
  };

  const navLinks = getNavLinks();
  const userInitials = user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sidebar Header with Logo */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0a162b',
        }}
      >
        <VistroLogo iconSize={36} variant="light-text" tagline={false} />
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

      {/* Navigation List */}
      <Box sx={{ flexGrow: 1, px: 2, py: 3, backgroundColor: '#071121' }}>
        <List sx={{ p: 0 }}>
          {navLinks.map((link) => {
            const isSelected = location.pathname === link.path;
            return (
              <ListItem key={link.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to={link.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: '0 8px 8px 0',
                    py: 1.25,
                    px: 2,
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                    backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.2)' : 'transparent',
                    borderLeft: isSelected ? '4px solid #0d9488' : '4px solid transparent',
                    '&:hover': {
                      color: '#ffffff',
                      backgroundColor: isSelected ? 'rgba(13, 148, 136, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? '#0d9488' : 'rgba(255, 255, 255, 0.45)',
                      minWidth: 40,
                    }}
                  >
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontFamily: '"Outfit", sans-serif',
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '0.925rem',
                        }}
                      >
                        {link.text}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Sidebar Footer with Logged In User Info */}
      <Box sx={{ p: 2, backgroundColor: '#050c18' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: '#ffffff',
            }}
          >
            {userInitials}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ color: '#ffffff', fontWeight: 600 }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: 'rgba(255, 255, 255, 0.45)', display: 'block' }}>
              {user?.roles.join(', ')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navbar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: isStudent ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: isStudent ? 0 : `${DRAWER_WIDTH}px` },
          boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.05)',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isStudent && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' }, color: '#0f172a' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              Vistaro Workspace
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notification Badge Menu */}
            <IconButton color="default" sx={{ color: '#475569' }} onClick={handleNotifOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* Profile Dropdown Action */}
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {userInitials}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    boxShadow: '0px 8px 30px rgba(15, 23, 42, 0.08)',
                    border: '1px solid #f1f5f9',
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {user?.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem
                component={RouterLink}
                to={user?.roles.includes('Student') ? '/student/profile' : user?.roles.includes('ShopOwner') ? '/employer/profile' : '#'}
                onClick={handleUserMenuClose}
                disabled={user?.roles.includes('Admin')}
              >
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                My Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <ExitToApp fontSize="small" />
                </ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>

            {/* Notifications Popover Dropdown */}
            <Popover
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1.5,
                    width: 360,
                    maxHeight: 480,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0px 8px 30px rgba(15, 23, 42, 0.08)',
                    border: '1px solid #f1f5f9',
                  },
                },
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f2c59' }}>
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Button size="small" onClick={handleMarkAllRead} sx={{ fontWeight: 700, textTransform: 'none', py: 0 }}>
                    Mark all read
                  </Button>
                )}
              </Box>

              <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((notif) => (
                    <Box
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderBottom: '1px solid #f8fafc',
                        backgroundColor: notif.isRead ? 'transparent' : 'rgba(13, 148, 136, 0.04)',
                        transition: 'background-color 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.02)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ flexGrow: 1, pr: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: notif.isRead ? 600 : 800, color: '#0f2c59', mb: 0.5 }}>
                            {notif.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.825rem', lineHeight: 1.4 }}>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}>
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(notif.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {!notif.isRead && (
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main', mt: 1 }} />
                        )}
                      </Stack>
                    </Box>
                  ))
                )}
              </Box>
            </Popover>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      {!isStudent && (
        <Box
          component="nav"
          sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
          aria-label="mailbox folders"
        >
          {/* Mobile View Drawer */}
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: DRAWER_WIDTH,
                  borderRight: 'none',
                  borderRadius: 0,
                },
              }}
            >
              {drawerContent}
            </Drawer>
          ) : (
            /* Desktop View Drawer (Permanent) */
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: DRAWER_WIDTH,
                  borderRight: 'none',
                  borderRadius: 0,
                },
              }}
              open
            >
              {drawerContent}
            </Drawer>
          )}
        </Box>
      )}

      {/* Main Work Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 3, md: 4 },
          width: { xs: '100%', md: isStudent ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)` },
          overflowX: 'hidden',
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
