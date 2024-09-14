import prisma from '../../lib/db/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCurrentChallenge } from '@/lib/db/challenge'
import { sendTextMessage } from '@/lib/twilio'
import { score } from '@/pages/api/user/get_all'

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
    return res.status(400).json({ error: 'MALFORMED_DATA' })

  let currentChallenge = await getCurrentChallenge()

  if (!currentChallenge) return res.status(400).json({ error: 'NO_CHALLENGE' })

  if (currentChallenge.tagged.badgeCode != taggedBadgeCode) {
    return res.status(400).json({ error: 'INCORRECT_TAGGED' })
  }

  if (currentChallenge.taggedAt != null) {
    return res.status(400).json({ error: 'INCORRECT_TAGGED' })
  }

  const tagged = await prisma.user.findUnique({
    where: {
      badgeCode: taggedBadgeCode,
    },
  })

  console.log('tagger, tagged', taggerId, tagged?.id)
  if (tagged?.id == taggerId) {
    return res.status(400).json({ error: 'INCORRECT_TAGGED' })
  }

  currentChallenge = await prisma.challenge.update({
    where: {
      id: currentChallenge.id,
    },
    data: {
      taggerId: taggerId,
      taggedAt: new Date(),
    },
    include: {
      tagged: true,
      tagger: true,
    },
  })

  const usersToNotify = await prisma.user.findMany({
    where: {
      lastInteractedAt: {
        gt: new Date(Date.now() - 10 * 60 * 1000),
      },
      NOT: {
        OR: [
          {
            id: taggerId,
          },
          {
            id: tagged?.id,
          },
        ],
      },
    },
  })

  for (const user of usersToNotify) {
    if (!user.phone) continue
    await sendTextMessage(
      user.phone,
      `the target has been tagged. stay alert, gosling.`
    )
  }

  const tagger = await prisma.user.findUnique({
    where: {
      id: taggerId,
    },
  })

  await sendTextMessage(
    tagger!.phone,
    `you tagged ${tagged!.name}. you got +${score(currentChallenge)} points`
  )

  await sendTextMessage(
    tagged!.phone,
    `you've been tagged by ${tagged!.name.toLowerCase()}. you got +${score(currentChallenge)} points`
  )

  res.status(200).json({})
}
