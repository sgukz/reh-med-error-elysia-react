import { useState } from 'react';
import PropTypes from 'prop-types';
import { noCase } from 'change-case';
import { useNavigate } from 'react-router-dom';
// @mui
import {
  Button,
  Avatar,
  Tooltip,
  Typography,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  Dialog,
  DialogTitle,
  Divider,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

// utils
import { fToNow } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';

export default function NotificationsPopover({ users }) {
  const navigate = useNavigate();
  const [isLogout, setIsLogout] = useState(false);
  const handleLogout = (event) => {
    setIsLogout(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login', { replace: true });
  };

  const handleClose = (e) => {
    setIsLogout(false);
    e.preventDefault();
  };

  return (
    <>
      {/* <IconButton color={open ? 'primary' : 'default'} onClick={handleOpen} sx={{ width: 40, height: 40 }}>
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify icon="eva:bell-fill" />
        </Badge>
      </IconButton> */}

      {users && users.map((val) => <Button key={val}>{val.name}</Button>)}
      <Tooltip title="Logout">
        <Button variant="outlined" color="error" onClick={handleLogout} size='small'>{`ออกจากระบบ`}</Button>
      </Tooltip>
      <Dialog
        open={Boolean(isLogout)}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ bgcolor: '#c62828', color: 'common.white' }}>
          ยืนยันการออกจากระบบ
        </DialogTitle>
        <Divider variant="middle" />
        <DialogContent>
          <DialogContentText color="gray.main" sx={{ fontSize: '14px' }}>
            คุณต้องการออกจากระบบใช่หรือไม่?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={(e) => handleConfirmLogout(e)} autoFocus sx={{ color: 'error.main' }}>
            ยืนยัน
          </Button>
          <Button onClick={handleClose}>
            <Iconify icon={'eva:close-outline'} /> ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.instanceOf(Date),
    id: PropTypes.string,
    isUnRead: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    avatar: PropTypes.any,
  }),
};

function NotificationItem({ notification }) {
  const { avatar, title } = renderContent(notification);

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        ...(notification.isUnRead && {
          bgcolor: 'action.selected',
        }),
      }}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'flex',
              alignItems: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
            {fToNow(notification.createdAt)}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {noCase(notification.description)}
      </Typography>
    </Typography>
  );

  if (notification.type === 'order_placed') {
    return {
      avatar: <img alt={notification.title} src="/assets/icons/ic_notification_package.svg" />,
      title,
    };
  }
  if (notification.type === 'order_shipped') {
    return {
      avatar: <img alt={notification.title} src="/assets/icons/ic_notification_shipping.svg" />,
      title,
    };
  }
  if (notification.type === 'mail') {
    return {
      avatar: <img alt={notification.title} src="/assets/icons/ic_notification_mail.svg" />,
      title,
    };
  }
  if (notification.type === 'chat_message') {
    return {
      avatar: <img alt={notification.title} src="/assets/icons/ic_notification_chat.svg" />,
      title,
    };
  }
  return {
    avatar: notification.avatar ? <img alt={notification.title} src={notification.avatar} /> : null,
    title,
  };
}
