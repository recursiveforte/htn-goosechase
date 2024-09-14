import prisma from '../../lib/db/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCurrentChallenge } from '@/lib/db/challenge'

type ResponseData = {
  error?:
    | 'INCORRECT_TAGGED'
    | 'INCORRECT_METHOD'
    | 'MALFORMED_DATA'
    | 'NO_CHALLENGE'
  message?: 'ok'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') res.status(400).json({ error: 'INCORRECT_METHOD' })

  const data = await req.body
  const taggedBadgeCode: string = data.taggedBadgeCode
  const taggerId: number = data.taggerId

  if (!taggedBadgeCode || !taggerId)
    res.status(400).json({ error: 'MALFORMED_DATA' })

  const currentChallenge = await getCurrentChallenge()

  if (!currentChallenge) return res.status(400).json({ error: 'NO_CHALLENGE' })

  if (currentChallenge.tagged.badgeCode != taggedBadgeCode) {
    res.status(400).json({ error: 'INCORRECT_TAGGED' })
  }

  if (currentChallenge.taggedAt != null) {
    res.status(400).json({ error: 'INCORRECT_TAGGED' })
  }

  const tagged = await prisma.user.findUnique({
    where: {
      badgeCode: taggedBadgeCode,
    },
  })

  if (tagged?.id == taggerId) {
    res.status(400).json({ error: 'INCORRECT_TAGGED' })
  }

  await prisma.challenge.update({
    where: {
      id: currentChallenge.id,
    },
    data: {
      taggerId: taggerId,
      taggedAt: new Date(),
    },
  })

  res.status(200).json({})
}
