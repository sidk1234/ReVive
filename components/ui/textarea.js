import * as React from "react";

/**
 * A simple textarea component with ReVive styling. It forwards its ref to the
 * underlying textarea element so it can be used in forms.
 */
export const Textarea = React.forwardRef(function Textarea(
  { className = "", ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={
        "w-full min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 " +
        "focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 " +
        className
      }
      {...props}
    />
  );
});

export default Textarea;