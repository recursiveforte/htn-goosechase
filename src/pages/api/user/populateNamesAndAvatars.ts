import prisma from '@/lib/db/prisma'
import { getBadgeAvatar, lookupBadge } from '@/lib/hackTheNorth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const usersWithoutNames = await prisma.user.findMany({
    where: {
      name: '',
    },
    select: {
      id: true,
      badgeCode: true,
    },
  })

  for (const user of usersWithoutNames) {
    console.log(`Populating name and avatar for ${user.badgeCode}`)
    let badge
    try {
      badge = await lookupBadge(user.badgeCode)
    } catch (error) {
      console.error(error)
      continue
    }
    const avatarData = await getBadgeAvatar(badge)
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: badge.name,
        avatarData,
      },
    })
  }

  console.log('Done!')
  return res.status(200).json({})
}
