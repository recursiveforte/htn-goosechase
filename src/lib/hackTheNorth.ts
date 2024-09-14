import { HACK_THE_NORTH_AUTH_TOKEN } from './config'

export interface BadgeData {
  name: string
  role: string
  pronouns: string[]

  discordTag: string
  facebookLink: string
  githubLink: string
  instagramLink: string
  linkedinLink: string
  tiktokLink: string
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
              
              discordTag
              facebookLink
              githubLink
              instagramLink
              linkedinLink
              tiktokLink
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
