import React from 'react';
import {
  Button,
  ButtonProps,
  Link,
  LinkProps,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuItemProps,
  useStyleConfig
} from '@chakra-ui/react';

// Common Minter Components - Button & Link referencing branded variants

export function MinterButton(
  props: ButtonProps & { size?: string; variant?: string }
) {
  const { size, variant, ...rest } = props;
  const styles = useStyleConfig('Button', { size, variant });
  return <Button sx={styles} {...rest} />;
}

export function MinterLink(
  props: LinkProps & { size?: string; variant?: string }
) {
  const { size, variant, ...rest } = props;
  const styles = useStyleConfig('Link', { size, variant });
  return <Link sx={styles} {...rest} />;
}

export function MinterMenuButton(
  props: MenuButtonProps & { variant?: string }
) {
  const { variant, ...rest } = props;
  const styles = useStyleConfig('MenuButton', { variant });
  return <MenuButton sx={styles} {...rest} />;
}

export function MinterMenuItem(props: MenuItemProps & { variant?: string }) {
  const { variant, ...rest } = props;
  const styles = useStyleConfig('MenuItem', { variant });
  return <MenuItem sx={styles} {...rest} />;
}
