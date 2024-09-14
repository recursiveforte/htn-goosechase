import { HACK_THE_NORTH_AUTH_TOKEN } from './config'

export interface BadgeData {
  name: string
  role: string
  pronouns: string[]
  profiles: {
    discordTag: string | null
    facebookLink: string | null
    githubLink: string | null
    instagramLink: string | null
    linkedinLink: string | null
    tiktokLink: string | null
    twitterLink: string | null
  }
}

export type BadgeResult =
  | { isSelf: true }
  | { isSelf: false, badgeData: BadgeData }

export async function lookupBadge(badgeCode: string): Promise<BadgeResult> {
  const res = await fetch('https://api.hackthenorth.com/v3/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': HACK_THE_NORTH_AUTH_TOKEN,
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
    })
  })

  if (!res.ok) {
    console.error(await res.text())
    throw new Error(`Status ${res.status} from Hack the North API`)
  }
  
  const json = await res.json() as {
    errors?: Array<{ message: string }>
    data: {
      handleNetworkingScan: {
        hackerNetworkingPayload: {
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
      }
    }
  }

  if (json.errors && json.errors.length > 0) {
    if (json.errors[0].message === 'User scanned themselves.') {
      return { isSelf: true }
    }
    throw new Error(json.errors[0].message)
  }

  const networkingPayload = json.data.handleNetworkingScan.hackerNetworkingPayload
  return {
    isSelf: false,
    badgeData: {
      name: networkingPayload.name,
      role: networkingPayload.role,
      pronouns: networkingPayload.pronouns,
      profiles: {
        discordTag: networkingPayload.discordTag || null,
        facebookLink: networkingPayload.facebookLink || null,
        githubLink: networkingPayload.githubLink || null,
        instagramLink: networkingPayload.instagramLink || null,
        linkedinLink: networkingPayload.linkedinLink || null,
        tiktokLink: networkingPayload.tiktokLink || null,
        twitterLink: networkingPayload.twitterLink || null,
      }
    }
  }
}