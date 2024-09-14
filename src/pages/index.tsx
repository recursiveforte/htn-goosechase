import { BadgeData } from '@/lib/hackTheNorth'
import dynamic from 'next/dynamic'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { ScanBadgeResponse } from './api/user/scanBadge'
import { errorString, useLoadingToast } from '@/lib/util'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { getUserState, setUserState, UserState } from '@/lib/userState'
import { CreateAccountResponse } from './api/user/createAccount'

const QrReader = dynamic(() => import('../components/QrReader'), { ssr: false })

/*
function LeaderboardItem() {
  return <div style={{ display: 'flex', width: '100%', gap: '8px', alignItems: 'center', justifyContent: 'center', background: '#ff8c374E', paddingTop: '8px', paddingBottom: '8px', borderRadius: '8px', marginBottom: '8px' }}>
    <img src="https://preview.redd.it/1k2p6tly25x61.jpg?width=640&crop=smart&auto=webp&s=8f12f643c5f765c9d563c0c4d2bec764ca29469d" style={{ borderRadius: 999, marginLeft: '8px', marginRight: '6px' }} height="36px" width="36px" />
    <span>#1</span>
    <span style={{ flexGrow: 1 }}>Maria Anders</span>
    <span style={{ marginRight: '8px' }}>🪿 820</span>
  </div>
}

export default function Home() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [leaderboardOpen, setLeaderboardOpen] = useState<boolean>(false)

  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      { /* @ts-ignore */ }
      <marquee style={{ fontSize: '24px', width: '100vw', paddingTop: '16px', paddingBottom: '16px', background: '#a633d6' }}>
        <b><i>The game is being played at dinner! Join us.</i></b> { /* @ts-ignore */ }
      </marquee>
      {!leaderboardOpen && <>
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
      </>}
      {leaderboardOpen && <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, textAlign: 'left', width: 'calc(100% - 32px)', flexShrink: 1, overflowY: 'scroll', position: 'relative' }}>
          <h1 style={{ margin: 0, marginTop: '64px', width: '100%' }}>
            <u>Goose Chase Leaderboard</u>
          </h1>
          <p style={{ textAlign: 'left', width: '100%' }}>
            Looking to earn points? Keep an eye on your texts for new challenges and be the first to tag the target. <i>(Or get lucky and be the target!)</i> 
          </p>
          <LeaderboardItem />
          <LeaderboardItem />
          <LeaderboardItem />
          <LeaderboardItem />
          <LeaderboardItem />
          <LeaderboardItem />
          <LeaderboardItem />
        </div>
      </>}
      <div style={{ background: '#338eda', paddingTop: '16px', paddingBottom: '16px', width: '100%', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src="https://preview.redd.it/1k2p6tly25x61.jpg?width=640&crop=smart&auto=webp&s=8f12f643c5f765c9d563c0c4d2bec764ca29469d" style={{ borderRadius: 999, marginLeft: '16px' }} height="36px" width="36px" />
        <span style={{ flexGrow: 1, textAlign: 'left' }}>chase-chase-chase-chase</span>
        <span style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '48px', padding: '4px 8px' }} onClick={() => setLeaderboardOpen(!leaderboardOpen)}>
          #1
        </span>
        <span style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '48px', padding: '4px 8px', marginRight: '16px' }} onClick={() => setLeaderboardOpen(!leaderboardOpen)}>
          🪿 16  
        </span>
      </div>
    </div>
  )
}
*/

type LoginState =
  | { kind: 'qrScanner' }
  | { kind: 'checkingQrCode' }
  | { kind: 'phoneNumberInput'; badgeCode: string; badge: BadgeData }
  | { kind: 'creatingAccount'; badgeCode: string; badge: BadgeData }
  | { kind: 'loggedIn'; userState: UserState }
  | { kind: 'error'; message: string }

export default function Home(): ReactNode {
  const [loginState, setLoginState] = useState<LoginState>({
    kind: 'qrScanner',
  })

  useLoadingToast(loginState.kind === 'checkingQrCode', 'logging in...')
  useLoadingToast(loginState.kind === 'creatingAccount', 'creating account...')

  const [phoneNumberInput, setPhoneNumberInput] = useState('')
  const parsedPhoneNumber = useMemo(() => {
    const parsed = parsePhoneNumberFromString(phoneNumberInput, 'US')
    if (!parsed?.isValid()) return null
    return parsed
  }, [phoneNumberInput])

  useEffect(() => {
    const userState = getUserState()
    if (userState) {
      setLoginState({
        kind: 'loggedIn',
        userState,
      })
    }
  }, [])

  if (loginState.kind === 'qrScanner' || loginState.kind === 'checkingQrCode') {
    return (
      <div className="login-form">
        <p className="brand">goosechase</p>

        <p className="subheading">log in</p>
        <h1>scan your badge</h1>

        <QrReader
          className="qr-reader"
          onScan={async (text) => {
            if (loginState.kind !== 'qrScanner') return

            const code = text.split('/').slice(-1)[0]
            if (code.split('-').length !== 4) {
              return toast.error('Invalid QR code')
            }

            setLoginState({
              kind: 'checkingQrCode',
            })

            try {
              const res = await fetch(
                `/api/user/scanBadge?badgeCode=${encodeURIComponent(code)}`
              )
              if (!res.ok) {
                console.error(await res.text())
                throw new Error(`Unknown backend error (${res.status})`)
              }
              const json = (await res.json()) as ScanBadgeResponse
              if (!json.success) {
                throw new Error(json.error)
              }

              if (json.userId === null) {
                setLoginState({
                  kind: 'phoneNumberInput',
                  badgeCode: code,
                  badge: json.badge,
                })
              } else {
                const userState = {
                  badge: json.badge,
                  userId: json.userId,
                }

                setUserState(userState)

                setLoginState({
                  kind: 'loggedIn',
                  userState,
                })
              }
            } catch (error) {
              setLoginState({
                kind: 'error',
                message: errorString(error),
              })
            }
          }}
        />
      </div>
    )
  } else if (
    loginState.kind === 'phoneNumberInput' ||
    loginState.kind === 'creatingAccount'
  ) {
    return (
      <div className="login-form">
        <p className="brand">goosechase</p>

        <p className="subheading">hi {loginState.badge.name.toLowerCase()}.</p>
        <h1>what's your phone number?</h1>

        <input
          type="tel"
          autoComplete="tel"
          placeholder="(xxx) xxx-xxxx"
          value={phoneNumberInput}
          onChange={(e) => setPhoneNumberInput(e.target.value)}
          onBlur={() => {
            if (parsedPhoneNumber) {
              if (parsedPhoneNumber.countryCallingCode === '1') {
                setPhoneNumberInput(parsedPhoneNumber.formatNational())
              } else {
                setPhoneNumberInput(parsedPhoneNumber.formatInternational())
              }
            }
          }}
        />

        {parsedPhoneNumber && (
          <button
            onClick={async (event) => {
              event.preventDefault()
              if (loginState.kind !== 'phoneNumberInput') return

              setLoginState({
                kind: 'creatingAccount',
                badgeCode: loginState.badgeCode,
                badge: loginState.badge,
              })

              try {
                const res = await fetch(
                  `/api/user/createAccount?badgeCode=${encodeURIComponent(loginState.badgeCode)}&phoneNumber=${encodeURIComponent(parsedPhoneNumber.format('E.164'))}`
                )
                if (!res.ok) {
                  console.error(await res.text())
                  throw new Error(`Unknown backend error (${res.status})`)
                }
                const json = (await res.json()) as CreateAccountResponse
                if (!json.success) {
                  throw new Error(json.error)
                }

                const userState = {
                  badge: json.badge,
                  userId: json.userId,
                }
                setUserState(userState)
                setLoginState({
                  kind: 'loggedIn',
                  userState,
                })
              } catch (error) {
                setLoginState({
                  kind: 'error',
                  message: errorString(error),
                })
              }
            }}
          >
            log in
          </button>
        )}
      </div>
    )
  } else if (loginState.kind === 'error') {
    return (
      <div className="login-form">
        <p className="brand">goosechase</p>

        <h1>login error</h1>

        <p className="error">"{loginState.message}"</p>
        <p>
          find lexi mattick, sam poder, faisal sayed, or cheru on slack for
          help, or...
        </p>

        <button onClick={() => setLoginState({ kind: 'qrScanner' })}>
          try again
        </button>
      </div>
    )
  } else if (loginState.kind === 'loggedIn') {
    return (
      <div className="login-form">
        <p className="brand">goosechase</p>

        <h1>hi {loginState.userState.badge.name.toLowerCase()}.</h1>
        <div className="awareness">
          <p>goosechase is aware of you.</p>
          <p>you'll hear from us when you least expect it.</p>
        </div>
      </div>
    )
  }
}
