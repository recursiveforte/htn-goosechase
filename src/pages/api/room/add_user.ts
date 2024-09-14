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

  const data = req.body
  const userId: number = req.body.userId
  const roomId: number = req.body.userId

  if (!userId || !roomId) return res.status(400).json({error: 'MALFORMED_DATA'})

  await prisma.room.update({
    where: {
      id: roomId
    },
    data: {
      users: {
        connect: {
          id: userId
        }
      }
    }
  })

  return res.status(200).json({})
}