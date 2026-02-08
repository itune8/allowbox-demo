export interface UserInfo {
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface TopNavItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  href?: string;
}

export interface SidebarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  href?: string;
}

export interface SidebarSection {
  title: string;
  icon?: React.ReactNode;
  items: SidebarItem[];
}

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  divider?: boolean;
}
