import React from "react";

/**
 * Loader component that displays a custom loading animation.
 * The loader is a circular spinner with a unique conic-gradient animation.
 * The loader is centered both vertically and horizontally on the screen.
 *
 * @returns {JSX.Element} The rendered Loader component.
 */
const Loader = () => {
  return (
    <div style={styles.loaderWrapper}>
      <div style={styles.loader}></div>
      <style>
        {`
          @keyframes l4 {
            0%     { -webkit-mask: conic-gradient(#0000 0, #000 0); }
            16.67% { -webkit-mask: conic-gradient(#0000 60deg, #000 0); }
            33.33% { -webkit-mask: conic-gradient(#0000 120deg, #000 0); }
            50%    { -webkit-mask: conic-gradient(#0000 180deg, #000 0); }
            66.67% { -webkit-mask: conic-gradient(#0000 240deg, #000 0); }
            83.33% { -webkit-mask: conic-gradient(#0000 300deg, #000 0); }
            100%   { -webkit-mask: conic-gradient(#0000 360deg, #000 0); }
          }
        `}
      </style>
    </div>
  );
};

/**
 * CSS-in-JS styles for the Loader component.
 * These styles control the layout of the loader, its appearance, and the animation.
 */
const styles = {
  /**
   * Wrapper style for centering the loader on the screen.
   * It uses flexbox to center the loader both vertically and horizontally.
   */
  loaderWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    position: "relative",
  },
  /**
   * Loader style for creating the animated circular spinner.
   * The loader has multiple radial gradients and a conic animation.
   */
  loader: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "12px solid #d1914b",
    boxSizing: "border-box",
    background: `
      no-repeat radial-gradient(farthest-side, #d64123 94%, #0000) 11px 15px,
      no-repeat radial-gradient(farthest-side, #000 94%, #0000) 6px 15px,
      no-repeat radial-gradient(farthest-side, #d64123 94%, #0000) 35px 23px,
      no-repeat radial-gradient(farthest-side, #000 94%, #0000) 29px 15px,
      no-repeat radial-gradient(farthest-side, #d64123 94%, #0000) 11px 46px,
      no-repeat radial-gradient(farthest-side, #000 94%, #0000) 11px 34px,
      no-repeat radial-gradient(farthest-side, #d64123 94%, #0000) 36px 0px,
      no-repeat radial-gradient(farthest-side, #000 94%, #0000) 50px 31px,
      no-repeat radial-gradient(farthest-side, #d64123 94%, #0000) 47px 43px,
      no-repeat radial-gradient(farthest-side, #000 94%, #0000) 31px 48px,
      #f6d353
    `,
    backgroundSize: "20px 20px, 8px 8px",
    animation: "l4 5s infinite, rotate 3s linear infinite", // Rotation animation and conic-gradient animation
  },
};

export default Loader;
