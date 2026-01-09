import * as React from "react";

/**
 * A simple input component with ReVive styling. It forwards its ref to the
 * underlying input element so it can be used in forms and focus management.
 */
export const Input = React.forwardRef(function Input(
  { className = "", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={
        "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 " +
        "focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 " +
        className
      }
      {...props}
    />
  );
});

export default Input;