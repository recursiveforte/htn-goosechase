import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db/prisma'
import { getCurrentChallenge } from '@/lib/db/challenge'

type ResponseData = {
  error?: 'MALFORMED_DATA' | 'INCORRECT_METHOD' | 'NO_CHALLENGE'
  data?: {
    createdAt: Date
    tagger: {
      id: number
      badgeCode: string
    } | null
    tagged: {
      name: string
      id: number
    }
  }
} | null

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') res.status(400).json({ error: 'INCORRECT_METHOD' })

  const currentChallenge = await getCurrentChallenge()

  if (!currentChallenge) return res.status(200).json(null)

  res.status(200).json({
    data: {
      createdAt: currentChallenge.createdAt,
      tagged: {
        name: currentChallenge.tagged.name,
        id: currentChallenge.tagged.id
      },
      tagger: currentChallenge.tagger && {
        id: currentChallenge.tagger.id,
        badgeCode: currentChallenge.tagger.badgeCode,
      },
    },
  })
}
