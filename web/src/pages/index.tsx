import localFont from "next/font/local";
import { useState } from "react";
import toast from "react-hot-toast";
import { QrReader } from "react-qr-reader";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-5 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <p className="border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:from-inherit w-auto rounded-xl border bg-gray-200 p-4 dark:bg-zinc-800/30">
        Get started by scanning your QR code
      </p>
      {scannedCode}
      <QrReader
        scanDelay={0}
        constraints={{
          aspectRatio: { exact: 1 },
          facingMode: { ideal: "environment" },
          frameRate: 30,
        }}
        containerStyle={{
          maxWidth: 500,
          maxHeight: 500,
          width: "100vw",
          height: "100vh",
          margin: 24,
        }}
        videoContainerStyle={{
          maxWidth: 500,
          maxHeight: 500,
          width: "100vw",
          height: "100vh",
        }}
        videoStyle={{
          maxWidth: 500,
          width: "100vw",
          maxHeight: 500,
          height: "100vh",
        }}
        ViewFinder={ViewFinder}
        onResult={(result) => {
          if (!result) return;
          const code = result.getText().split("/").slice(-1)[0];
          if (code.split("-").length !== 4) {
            return toast.error("Invalid QR code");
          }
          if (code != scannedCode) {
            setScannedCode(code);
            toast.success("QR code scanned, your code is: " + code, {
              id: "scan_self",
              duration: 5000,
            });
          }
        }}
      />
    </div>
  );
}

const ViewFinder = (props: any) => (
  <div
    style={{
      zIndex: 100,
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "50%",
      height: "50%",
      borderRadius: "10px",
      ...props.style,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "10%",
        height: "10%",
        borderLeft: "2px solid white",
        borderTop: "2px solid white",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "10%",
        height: "10%",
        borderRight: "2px solid white",
        borderTop: "2px solid white",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "10%",
        height: "10%",
        borderLeft: "2px solid white",
        borderBottom: "2px solid white",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "10%",
        height: "10%",
        borderRight: "2px solid white",
        borderBottom: "2px solid white",
      }}
    />
  </div>
);
