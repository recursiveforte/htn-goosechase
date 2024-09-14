import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db/prisma'

type ResponseData = {
  error?: "MALFORMED_DATA" | "INCORRECT_METHOD"
  data?: {}
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") res.status(400).json({error: 'INCORRECT_METHOD'})

  const userId: number = req.body.phone

  if (!userId) return res.status(400).json({error: 'MALFORMED_DATA'})

  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      lastInteractedAt: new Date()
    }
  })

  return res.status(200).json({})
}
