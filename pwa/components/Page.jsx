// Simple Page wrapper component to avoid importing Framework7.
// Provides a container for each PWA page. This component does not include
// any Framework7 dependencies and simply renders its children. It
// accepts arbitrary props and applies them to the root div.
export default function Page({ children, ...rest }) {
  return <div {...rest}>{children}</div>;
}