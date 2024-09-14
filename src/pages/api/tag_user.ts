import prisma from '../../lib/db/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCurrentChallenge } from '@/lib/db/challenge'

type ResponseData = {
  error?:
    | 'INCORRECT_TAGGEE'
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

  // const data = await req.body
  // const taggeeBadgeCode: string = data.taggeeBadgeCode
  // const taggerId: number = data.taggerId

  // if (!taggeeBadgeCode || !taggerId)
  //   res.status(400).json({ error: 'MALFORMED_DATA' })

  // const currentChallenge = await getCurrentChallenge()

  // if (!currentChallenge) return res.status(400).json({ error: 'NO_CHALLENGE' })

  // if (currentChallenge.taggee.badgeCode != taggeeBadgeCode) {
  //   res.status(400).json({ error: 'INCORRECT_TAGGEE' })
  // }

  // const taggee = await prisma.user.findUnique({
  //   where: {
  //     badgeCode: taggeeBadgeCode,
  //   },
  // })

  // if (taggee?.id == taggerId) {
  //   res.status(400).json({ error: 'INCORRECT_TAGGEE' })
  // }

  // await prisma.challenge.update({
  //   where: {
  //     id: currentChallenge.id,
  //   },
  //   data: {
  //     taggerId: taggerId,
  //     taggedAt: new Date(),
  //   },
  // })

  // TODO: logic to start new challenge

  res.status(200).json({})
}
