import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db/prisma'

type ResponseData = {
    error?: "MALFORMED_DATA" | "INCORRECT_METHOD" | "RESOURCE_DNE"
    data?: {
        id: number,
        username: string
    }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
    if (req.method !== "GET") res.status(400).json({error: 'INCORRECT_METHOD'})


    const userId: number = req.body.userId

    if (!userId) res.status(400).json({error: 'MALFORMED_DATA'})

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) return res.status(400).json({error: 'RESOURCE_DNE'})

    res.status(200).json({data:
          {
              id: user.id,
              username: user.username
          }
    })
}
