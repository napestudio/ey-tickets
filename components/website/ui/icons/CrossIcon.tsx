import { SVGProps } from "react";

export default function CrossIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="61"
      height="61"
      viewBox="0 0 61 61"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M14.2582 0L0.0018119 14.2564L46.7346 60.9892L60.991 46.7328L14.2582 0Z"
        fill="currentColor"
      />
      <path
        d="M60.9892 14.2672L46.7328 0.010842L0 46.7436L14.2564 61L60.9892 14.2672Z"
        fill="currentColor"
      />
    </svg>
  );
}
