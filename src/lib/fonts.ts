import localFont from 'next/font/local'

export const vazirmatn = localFont({
  src: [
    {
      path: '../../public/fonts/Vazirmatn-Thin.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Vazirmatn-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Vazirmatn-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Vazirmatn-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif'],
})
