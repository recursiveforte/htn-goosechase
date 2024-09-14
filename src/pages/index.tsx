import dynamic from 'next/dynamic'
import { useState } from 'react'
import toast from 'react-hot-toast'

const QrReader = dynamic(() => import('../components/QrReader'), { ssr: false })

export default function Home() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)

  return (
    <div>
      <p>Get started by scanning your QR code</p>
      {scannedCode}
      <QrReader
        onScan={(text) => {
          const code = text.split('/').slice(-1)[0]
          if (code.split('-').length !== 4) {
            return toast.error('Invalid QR code')
          }
          if (code !== scannedCode) {
            setScannedCode(code)
            toast.success('QR code scanned, your code is: ' + code, {
              id: 'scan_self',
              duration: 5000,
            })
          }
        }}
      />
    </div>
  )
}
