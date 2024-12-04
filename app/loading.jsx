import Loader from "../components/Loader";

/**
 * LoadingPage Component
 *
 * @description This component serves as a placeholder while the application is loading content.
 * It renders a `Loader` component to provide visual feedback to the user.
 *
 * @returns {JSX.Element} The rendered loading page.
 *
 * @example
 * // Example usage in a dynamic route or suspense fallback:
 * <LoadingPage />
 */
const LoadingPage = () => {
  return (
    <>
      <Loader />
    </>
  );
};

export default LoadingPage;
