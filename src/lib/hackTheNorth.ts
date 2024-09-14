import { HACK_THE_NORTH_AUTH_TOKEN } from './config'

export interface BadgeData {
  name: string
  role: string
  pronouns: string[]

  facebookLink: string
  githubLink: string
  instagramLink: string
  linkedinLink: string
  twitterLink: string
}

export async function lookupBadge(badgeCode: string): Promise<BadgeData> {
  const res = await fetch('https://api.hackthenorth.com/v3/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: HACK_THE_NORTH_AUTH_TOKEN,
    },
    body: JSON.stringify({
      operationName: 'HandleNetworkingScan',
      query: `
        mutation HandleNetworkingScan($badgeCode: String!) {
          handleNetworkingScan(badge_code: $badgeCode) {
            hackerNetworkingPayload {
              name
              role
              pronouns
              
              facebookLink
              githubLink
              instagramLink
              linkedinLink
              twitterLink
            }
          }
        }
      `,
      variables: { badgeCode },
    }),
  })

  if (!res.ok) {
    console.error(await res.text())
    throw new Error(`Status ${res.status} from Hack the North API`)
  }

  const json = (await res.json()) as {
    errors?: Array<{ message: string }>
    data: {
      handleNetworkingScan: {
        hackerNetworkingPayload: BadgeData | null
      }
    }
  }

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message)
  }

  if (json.data.handleNetworkingScan.hackerNetworkingPayload === null) {
    throw new Error('No worky for sponsors')
  }

  return json.data.handleNetworkingScan.hackerNetworkingPayload
}

export async function getBadgeAvatar(badge: BadgeData): Promise<Buffer | null> {
  let avatarUrl: string | null
  try {
    avatarUrl = await getBadgeAvatarUrl(badge)
  } catch (error) {
    console.error(error)
    return null
  }
  if (!avatarUrl) return null

  const res = await fetch(avatarUrl)
  if (!res.ok) {
    console.error(`Error fetching avatar from ${avatarUrl}`)
    console.error(await res.text())
    return null
  }
  return Buffer.from(await res.arrayBuffer())
}

async function getBadgeAvatarUrl(badge: BadgeData): Promise<string | null> {
  const githubUsername = getLastPathParam(badge.githubLink)
  if (githubUsername.length > 1) {
    return `https://avatars.githubusercontent.com/${encodeURIComponent(githubUsername)}`
  }

  const linkedinUsername = getLastPathParam(badge.linkedinLink)
  if (linkedinUsername.length > 1) {
    const res = await fetch(
      `https://www.linkedin.com/in/${linkedinUsername}/`,
      {
        headers: {
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          priority: 'u=0, i',
          'sec-ch-ua':
            '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        },
      }
    )
    if (res.ok) {
      const html = await res.text()
      const imageUrl = html.match(
        /data-delayed-url="(https:\/\/media.licdn.com\/dms\/image\/v2\/[^"]+)"/
      )?.[1]
      if (imageUrl) return imageUrl.replaceAll('&amp;', '&')
    } else {
      console.log(
        `LinkedIn fetch failed for ${linkedinUsername} with status ${res.status}`
      )
    }
  }

  return null
}

function getLastPathParam(url: string) {
  return url.replaceAll('/', ' ').trim().split(' ').pop()!.trim() ?? ''
}
