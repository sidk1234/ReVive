import * as React from "react";

/**
 * A simple select component with ReVive styling. This component does not
 * implement a full-featured select dropdown like the shadcn/ui component, but
 * provides basic styling compatible with Tailwind CSS.
 */
export function Select({ className = "", children, ...props }) {
  return (
    <select
      className={
        "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none " +
        "focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 " +
        className
      }
      {...props}
    >
      {children}
    </select>
  );
}

export const SelectTrigger = Select;
export const SelectValue = ({ children }) => <>{children}</>;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

export default Select;