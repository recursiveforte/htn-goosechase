import dynamic from 'next/dynamic'
import { useState } from 'react'
import toast from 'react-hot-toast'

const QrReader = dynamic(() => import('../components/QrReader'), { ssr: false })

export default function Home() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)

  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <marquee style={{ fontSize: '24px', width: '100vw', paddingTop: '16px', paddingBottom: '16px', background: '#a633d6' }}>
        <b><i>The game is being played at dinner! Join us.</i></b>
      </marquee>
      <div style={{ width: '500px', height: '500px'}}>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
        <h3 style={{ margin: 0, marginTop: '16px' }}>
          The current target is:
        </h3>
        <h1 style={{ margin: 0, marginTop: '16px' }}>
          Lexi Mattick
        </h1>
        <h3 style={{ margin: '16px', fontWeight: 400 }}>Find them in the room, scan their code, and you'll both earn points.</h3>
      </div>
      <div style={{ background: '#338eda', padding: '16px', width: '100%', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src="https://preview.redd.it/1k2p6tly25x61.jpg?width=640&crop=smart&auto=webp&s=8f12f643c5f765c9d563c0c4d2bec764ca29469d" style={{ borderRadius: 999, marginLeft: '16px' }} height="36px" width="36px" />
        <span style={{ flexGrow: 1, textAlign: 'left' }}>chase-chase-chase-chase</span>
        <span style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '48px', padding: '4px 8px' }}>
          #1
        </span>
        <span style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '48px', padding: '4px 8px', marginRight: '16px' }}>
          🪿 16  
        </span>
      </div>
    </div>
  )
}
