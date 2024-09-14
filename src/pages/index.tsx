import { BadgeData } from '@/lib/hackTheNorth'
import dynamic from 'next/dynamic'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import type { ScanBadgeResponse } from './api/user/scanBadge'
import { errorString, useLoadingToast } from '@/lib/util'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { getUserState, setUserState, UserState } from '@/lib/userState'
import { CreateAccountResponse } from './api/user/createAccount'

const QrReader = dynamic(() => import('../components/QrReader'), { ssr: false })

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
