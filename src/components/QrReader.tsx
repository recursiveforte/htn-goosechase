import { ReactNode } from 'react'
import { QrReader as ReactQrReader } from 'react-qr-reader'

export interface QrReaderProps {
  onScan: (code: string) => void
}

export default function QrReader(props: QrReaderProps): ReactNode {
  return (
    <ReactQrReader
      scanDelay={0}
      constraints={{
        aspectRatio: { exact: 1 },
        facingMode: { ideal: 'environment' },
        frameRate: 30,
      }}
      containerStyle={{
        maxWidth: 500,
      }}
      ViewFinder={ViewFinder}
      onResult={(result) => {
        const text = result?.getText()
        if (!text) return
        props.onScan(text)
      }}
    />
  )
}

const ViewFinder = (props: any) => (
  <div
    style={{
      zIndex: 100,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '50%',
      height: '50%',
      borderRadius: '10px',
      ...props.style,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '10%',
        height: '10%',
        borderLeft: '2px solid white',
        borderTop: '2px solid white',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '10%',
        height: '10%',
        borderRight: '2px solid white',
        borderTop: '2px solid white',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '10%',
        height: '10%',
        borderLeft: '2px solid white',
        borderBottom: '2px solid white',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '10%',
        height: '10%',
        borderRight: '2px solid white',
        borderBottom: '2px solid white',
      }}
    />
  </div>
)
