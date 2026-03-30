import * as React from 'react'

const RtbePortalContainerContext = React.createContext<HTMLElement | null>(null)

export function RtbePortalProvider({
  children,
  container
}: {
  children: React.ReactNode
  container: HTMLElement | null
}) {
  return (
    <RtbePortalContainerContext.Provider value={container}>
      {children}
    </RtbePortalContainerContext.Provider>
  )
}

export function useRtbePortalContainer(): HTMLElement | null {
  return React.useContext(RtbePortalContainerContext)
}
