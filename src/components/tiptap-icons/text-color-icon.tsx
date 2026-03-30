import * as React from "react"

export const TextColorIcon = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
    return (
      <svg
        width="24"
        height="24"
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M11.1 3C11.4762 3 11.8126 3.2286 11.9487 3.5786L16.9487 16.4214C17.1429 16.9213 16.8913 17.4816 16.3877 17.6743C15.884 17.8671 15.3196 17.6173 15.1254 17.1173L13.7569 13.5997H8.24311L6.87456 17.1173C6.68038 17.6173 6.11599 17.8671 5.61235 17.6743C5.10871 17.4816 4.85706 16.9213 5.05123 16.4214L10.0512 3.5786C10.1874 3.2286 10.5238 3 10.9 3H11.1ZM12.9879 11.6233L11 6.51102L9.0121 11.6233H12.9879Z"
          fill="currentColor"
        />
        <rect x="3" y="19" width="18" height="2.5" rx="1" fill="currentColor" />
      </svg>
    )
  }
)

TextColorIcon.displayName = "TextColorIcon"
