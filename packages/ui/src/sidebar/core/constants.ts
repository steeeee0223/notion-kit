export interface SidebarConfig {
  cookieName: {
    state: string;
    width: string;
  };
  cookieMaxAge: number;
  defaultWidth: string;
  minWidth: string;
  maxWidth: string;
  defaultMobileWidth: string;
  shortcut: string;
}

export const DEFAULT_CONFIG: SidebarConfig = {
  cookieName: {
    state: "sidebar:state",
    width: "sidebar:width",
  },
  cookieMaxAge: 60 * 60 * 24 * 7,
  defaultWidth: "248px",
  minWidth: "248px",
  maxWidth: "400px",
  defaultMobileWidth: "248px",
  shortcut: "\\",
};
