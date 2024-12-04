"use client";

import { SessionProvider as Provider } from "next-auth/react";

/**
 * A custom wrapper for the `SessionProvider` from NextAuth.js.
 * This component provides authentication session data to its child components.
 *
 * @component
 * @param {Object} props - The properties passed to this component.
 * @param {React.ReactNode} props.children - The child components that will have access to the session context.
 * @param {import("next-auth").Session} [props.session] - The current session object, if available.
 *
 * @example
 * // Wrapping the application with SessionProvider to enable session handling
 * import SessionProvider from './path/to/SessionProvider';
 * import { App } from './App';
 *
 * export default function MyApp({ session }) {
 *   return (
 *     <SessionProvider session={session}>
 *       <App />
 *     </SessionProvider>
 *   );
 * }
 *
 * @returns {JSX.Element} A `Provider` component that wraps its children with session data.
 */
export default function SessionProvider({ children, session }) {
  return <Provider session={session}>{children}</Provider>;
}
