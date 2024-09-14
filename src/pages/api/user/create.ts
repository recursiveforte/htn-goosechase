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

  const phone: string = req.body.phone
  const username: string = req.body.username

  if (!phone || !username) return res.status(400).json({error: 'MALFORMED_DATA'})

  await prisma.user.upsert({
    where: {
      username: username
    },
    create: {
      username: username
    },
    update: {
      phone: phone
    }
  })

  return res.status(200).json({})
}