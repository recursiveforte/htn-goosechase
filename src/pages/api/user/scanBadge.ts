import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db/prisma'
import { BadgeData, lookupBadge } from '@/lib/hackTheNorth'
import { errorString } from '@/lib/util'

export type ScanBadgeResponse =
  | { success: true; badge: BadgeData; userId: number | null }
  | { success: false; error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const badgeCode = String(req.query.badgeCode)

  let badge: BadgeData
  try {
    badge = await lookupBadge(badgeCode)
  } catch (error) {
    return res.json({
      success: false,
      error: errorString(error),
    } satisfies ScanBadgeResponse)
  }

  const user = await prisma.user.findUnique({
    where: {
      badgeCode,
    },
  })

  return res.json({
    success: true,
    badge,
    userId: user?.id ?? null,
  } satisfies ScanBadgeResponse)
}
