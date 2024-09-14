import { BadgeData } from '@/lib/hackTheNorth'
import dynamic from 'next/dynamic'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { ScanBadgeResponse } from './api/user/scanBadge'
import { errorString, useLoadingToast } from '@/lib/util'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { getUserState, setUserState, UserState } from '@/lib/userState'
import { CreateAccountResponse } from './api/user/createAccount'
import useSWR from 'swr'
import { User } from '@prisma/client'

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json())

const QrReader = dynamic(() => import('../components/QrReader'), { ssr: false })

function useAvatarUrl(avatarBuffer: { data: number[] } | null): string | null {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  useEffect(() => {
    if (avatarBuffer) {
      const data = new Blob([Uint8Array.from(avatarBuffer.data)])
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAvatarUrl(null)
    }
  }, [avatarBuffer])

  return avatarUrl
}

function LeaderboardItem({
  rank,
  name,
  avatarBuffer,
  score,
}: {
  rank: number
  name: string
  score: number
  avatarBuffer: { data: number[] } | null
}) {
  const avatarUrl = useAvatarUrl(avatarBuffer)

  const background =
    ['#ffd61f73', '#425a72', '#ff8c374E'][rank - 1] ?? '#2f2f2f'

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        paddingTop: '8px',
        paddingBottom: '8px',
        marginBottom: '8px',
      }}
    >
      <img
        src={avatarUrl ?? '/favicon.png'}
        style={{ borderRadius: 999, marginLeft: '8px', marginRight: '6px' }}
        height="36px"
        width="36px"
      />
      <span>#{rank}</span>
      <span style={{ flexGrow: 1 }}>{name}</span>
      <span style={{ marginRight: '8px' }}>🪿 {score}</span>
    </div>
  )
}

function currentUserOnLeaderboard(
  leaderboard: (User & { score: number })[],
  userId: number
) {
  return leaderboard
    .map((user, i) => ({ ...user, rank: i + 1 }))
    .filter((user) => user.id == userId)[0]
}

function Game({ loginState, loggedIn }: { loginState: any; loggedIn: any }) {
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [leaderboardOpen, setLeaderboardOpen] = useState<boolean>(false)
  const {
    data: leaderboard,
    error: leaderboardError,
    isLoading: leaderboardIsLoading,
  } = useSWR('/api/user/get_all', fetcher, { refreshInterval: 1000 })
  const {
    data: challenge,
    error: challengeError,
    isLoading: challengeIsLoading,
  } = useSWR('/api/challenge/get_current', fetcher, { refreshInterval: 1000 })
  const {
    data: user,
    error: userError,
    isLoading: userIsLoading,
  } = useSWR(
    `/api/user/active_ping?userId=${loggedIn ? loggedIn.userId : null}`,
    fetcher,
    { refreshInterval: 1000 }
  )

  const avatarUrl = useAvatarUrl(user?.avatarData ?? null)

  return (
    <div
      style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      {/* @ts-ignore */}
      <marquee
        style={{
          fontSize: '24px',
          width: '100vw',
          paddingTop: '16px',
          paddingBottom: '16px',
          background: 'magenta',
          color: 'black',
        }}
      >
        <b>
          <i>
            the game is to be played at{' '}
            {challenge?.data?.roomName ?? 'the food tent'}.
          </i>
        </b>{' '}
        {/* @ts-ignore */}
      </marquee>

      {!leaderboardOpen &&
        (challenge ? (
          challenge.data.tagged.id === loggedIn.userId ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1,
                padding: 10,
              }}
            >
              <h1 style={{ margin: 0, fontSize: '3em', marginBottom: '10px' }}>
                you're it.
              </h1>
              <div className="awareness" style={{ fontSize: '1.2em' }}>
                <p>
                  get someone to use goosechase.club to{' '}
                  <span style={{ color: 'cyan' }}>scan your badge</span>.
                </p>
                <p>the faster, the more points you earn.</p>
                <p>you will be greatly rewarded.</p>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                }}
              >
                <p style={{ fontSize: '1.4em', margin: 0, marginTop: '16px' }}>
                  the current target is:
                </p>
                <h1 style={{ margin: 0 }}>
                  {challenge.data.tagged.name.toLowerCase()}
                </h1>
                <h3
                  style={{
                    marginTop: '16px',
                    fontWeight: 400,
                    color: '#b8b8b8',
                  }}
                >
                  <span style={{ color: 'magenta' }}>find them</span>, scan
                  their badge, and you'll earn POINTS.
                </h3>
              </div>

              <div
                style={{
                  width: 'min(500px, 100vw)',
                  height: 'min(500px, 100vw)',
                }}
              >
                <QrReader
                  onScan={async (text) => {
                    const code = text.split('/').slice(-1)[0]
                    if (code.split('-').length !== 4) {
                      return toast.error('invalid qr code')
                    }
                    if (code !== scannedCode) {
                      setScannedCode(code)
                      toast.promise(
                        fetch('/api/tag_user', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            taggedBadgeCode: code,
                            taggerId: loggedIn.userId,
                          }),
                        }).then((resp) => {
                          if (!resp.ok) {
                            throw new Error('bad bad bad')
                          }
                        }),
                        {
                          loading: 'scanning...',
                          success: <b>your loyalty will be rewarded.</b>,
                          error: <b>that wasn't the target, bozo</b>,
                        }
                      )
                    }
                  }}
                />
              </div>
            </>
          )
        ) : (
          <div
            className="login-form"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <h1>hi {loginState.userState.badge.name.toLowerCase()}.</h1>
            <div className="awareness">
              <p>
                <span style={{ color: 'cyan' }}>goosechase</span> is aware of
                you.
              </p>
              <p>you'll hear from us when you least expect it.</p>
              <p>enlist your friends and you will all be rewarded.</p>
            </div>
          </div>
        ))}

      {leaderboardOpen && (
        <div
          // initial={{ opacity: 0, y: 1000 }}
          // animate={{ opacity: 1, y: 0 }}
          // exit={{ opacity: 0, y: 100 }}
          // transition={{ duration: 0.15 }}
          style={{
            width: '100%',
            flexGrow: 1,
            textAlign: 'left',
            padding: '10px',
            flexShrink: 1,
            overflowY: 'scroll',
            position: 'relative',
            height: '80vh',
          }}
        >
          <h1 style={{ margin: 0, width: '100%', marginTop: '16px' }}>
            <span style={{ color: 'cyan' }}>goosechase</span> leaderboard
          </h1>

          <p style={{ textAlign: 'left', width: '100%' }}>
            keep an eye on your texts.
          </p>

          {leaderboard
            ?.slice(0, 100)
            .map((user: any, i: number) => (
              <LeaderboardItem
                rank={i + 1}
                name={user.name.toLowerCase()}
                avatarBuffer={user.avatarData}
                score={user.score}
              />
            ))}
        </div>
      )}

      <div
        onClick={() => setLeaderboardOpen(!leaderboardOpen)}
        style={{
          paddingTop: '16px',
          paddingBottom: '16px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          borderTop: '2px solid cyan',
        }}
      >
        <img
          src={avatarUrl ?? '/favicon.png'}
          style={{ borderRadius: 999, marginLeft: '16px' }}
          height="36px"
          width="36px"
        />
        <span style={{ flexGrow: 1, textAlign: 'left' }}>
          {user?.name.toLowerCase() || 'loading...'}
        </span>
        <span
          style={{
            background: '#1f1f1f',
            width: '64px',
            // borderRadius: '48px',
            padding: '2px',
          }}
        >
          #
          {(leaderboard &&
            currentUserOnLeaderboard(leaderboard, loggedIn.userId).rank) ||
            '?'}
        </span>
        <span
          style={{
            background: '#1f1f1f',
            width: '64px',
            // borderRadius: '48px',
            padding: '2px',
            marginRight: '10px',
          }}
        >
          🪿{' '}
          {(leaderboard &&
            currentUserOnLeaderboard(leaderboard, loggedIn.userId).score) ||
            0}
        </span>
      </div>
    </div>
  )
}

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
    return <Game loginState={loginState} loggedIn={getUserState()} />
  }
}
