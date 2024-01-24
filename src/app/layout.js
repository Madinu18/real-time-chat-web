import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Real-time Chat Web App',
  description: 'Real-time chat created by Muhammad Adi Nurhidayat using NextJS and Firebase Real Time Database',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
