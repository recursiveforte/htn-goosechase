import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db/prisma'
import { getCurrentChallenge } from '@/lib/db/challenge'

type ResponseData = {
  error?: 'MALFORMED_DATA' | 'INCORRECT_METHOD' | 'NO_CHALLENGE'
  data?: {
    createdAt: Date
    room: {
      name: string
    }
    tagger: {
      id: number
      badgeCode: string
    } | null
    taggee: {
      id: number
      badgeCode: string
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') res.status(400).json({ error: 'INCORRECT_METHOD' })

  const currentChallenge = await getCurrentChallenge()

  if (!currentChallenge) return res.status(400).json({ error: 'NO_CHALLENGE' })

  res.status(200).json({
    data: {
      createdAt: currentChallenge.createdAt,
      room: {
        name: currentChallenge.room.name,
      },
      taggee: {
        id: currentChallenge.taggee.id,
        badgeCode: currentChallenge.taggee.badgeCode,
      },
      tagger: currentChallenge.tagger && {
        id: currentChallenge.tagger.id,
        badgeCode: currentChallenge.tagger.badgeCode,
      },
    },
  })
}