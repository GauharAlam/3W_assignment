import { Avatar } from '@mui/material';
import { avatarGradient, initials } from '../utils/format';

/**
 * Gradient avatar with user initials — colour is derived from the username
 * so every member gets a stable, recognisable identity.
 */
export default function UserAvatar({ username = '?', size = 40, sx = {}, ...rest }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundImage: avatarGradient(username),
        ...sx,
      }}
      {...rest}
    >
      {initials(username)}
    </Avatar>
  );
}
