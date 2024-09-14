import { BadgeData } from './hackTheNorth'

const VERSION = 1

export interface UserState {
  badge: BadgeData
  userId: number
}

export function getUserState(): UserState | null {
  try {
    const userState = JSON.parse(localStorage.getItem('userState') ?? '{}')
    if (userState.version !== VERSION) {
      localStorage.removeItem('userState')
      return null
    }
    return userState
  } catch {
    return null
  }
}

export function setUserState(userState: UserState): void {
  localStorage.setItem(
    'userState',
    JSON.stringify({
      ...userState,
      version: VERSION,
    })
  )
}
