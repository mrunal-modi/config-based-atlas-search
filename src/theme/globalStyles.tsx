import React from "react";
import { Global, css } from "@emotion/react";
import { Theme, useTheme } from "@mui/material/styles";

const createGlobalStyles = (theme: Theme) => css`
  :root {
    --primary-color: ${theme.palette.primary.main};
    --secondary-color: ${theme.palette.secondary.main};
    --text-color: ${theme.palette.text.primary};
    --background-color: ${theme.palette.background.default};
    --error-color: ${theme.palette.error.main};
    --success-color: ${theme.palette.success.main};
    --header-height: 55px;

    --drawer-width-open: 240px;
    --drawer-width-close: 54px;

    --theme-background-color: ${theme.palette.primary.main};
    --theme-border-color: ${theme.palette.primary.light};
    --theme-hover-color: ${theme.palette.secondary.main};
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.fontSize}px;
    line-height: ${theme.typography.body1.lineHeight};
    color: var(--text-color);
    background-color: var(--background-color);
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
      color: var(--theme-hover-color);
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0;
    margin-bottom: ${theme.spacing(2)}px;
    font-weight: ${theme.typography.fontWeightBold};
  }

  // Add more global styles as needed
`;

const GlobalStyles: React.FC = () => {
  const theme = useTheme();
  return <Global styles={createGlobalStyles(theme)} />;
};

export default GlobalStyles;