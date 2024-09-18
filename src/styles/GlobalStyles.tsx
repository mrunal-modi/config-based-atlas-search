import React from "react";
import { Global, css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";

const GlobalStyles = () => {
  const theme = useTheme();

  return (
    <Global
      styles={css`
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

        #__next {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        main {
          flex: 1;
        }

        a {
          color: ${theme.palette.primary.main};
          text-decoration: none;
          &:hover {
            text-decoration: underline;
            color: ${theme.palette.primary.dark};
          }
        }

        h1, h2, h3, h4, h5, h6 {
          margin-top: 0;
          margin-bottom: ${theme.spacing(2)};
          font-weight: ${theme.typography.fontWeightBold};
        }

        /* Scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${theme.palette.background.default};
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.palette.primary.main};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.palette.primary.dark};
        }

        /* Additional global styles can be added here */
      `}
    />
  );
};

export default GlobalStyles;