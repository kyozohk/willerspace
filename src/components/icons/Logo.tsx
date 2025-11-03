export function Logo(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        <path d="M15.5 10.5c-1 .667-2.5 1-4.5 1s-3.5-.333-4.5-1" />
        <path d="M8.5 15c.833.667 2.167 1 3.5 1s2.667-.333 3.5-1" />
      </svg>
    );
  }
  