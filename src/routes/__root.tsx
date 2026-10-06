import type { ReactNode } from 'react'
import { createRootRoute, HeadContent, Link, Outlet, Scripts } from '@tanstack/react-router'
import stylesheet from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { title: 'PPS School Explorer' },
    ],
    links: [
      { rel: 'stylesheet', href: stylesheet },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  shellComponent: RootDocument,
  component: Outlet,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: ReactNode }) {
  return <html lang="en"><head><HeadContent /></head><body>{children}<Scripts /></body></html>
}

function NotFound() {
  return <section style={{ maxWidth: 560, margin: '12vh auto', padding: 24 }}>
    <h1>Page not found</h1>
    <p>This address doesn’t match a page in PPS School Explorer.</p>
    <Link to="/">Return to the school boundary map</Link>
  </section>
}
