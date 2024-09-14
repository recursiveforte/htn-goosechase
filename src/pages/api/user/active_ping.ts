import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db/prisma'

type ResponseData = {
  error?: 'MALFORMED_DATA' | 'INCORRECT_METHOD'
  data?: {}
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // if (req.method !== "POST") res.status(400).json({error: 'INCORRECT_METHOD'})

  // @ts-ignore // TODO: sam made me do this :(
  const userId: number = req.query.userId && parseInt(req.query.userId)

  if (!userId) return res.status(400).json({ error: 'MALFORMED_DATA' })

  let user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      lastInteractedAt: new Date(),
    },
  })

  // @ts-ignore // TODO: sam made me do this :(
  return res.status(200).json([user].map(data => {
    return {
      ...data,
      phone: null
    }
  })[0])
}
