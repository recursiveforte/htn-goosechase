import prisma from '../../lib/db/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCurrentChallenge } from '@/lib/db/challenge'
import { sendTextMessage } from '@/lib/twilio'
import { score } from '@/pages/api/user/get_all'

type ResponseData = {
  error?: 'INCORRECT_METHOD'
  message?: 'ok'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') res.status(400).json({ error: 'INCORRECT_METHOD' })

  const usersToNotify = await prisma.user.findMany()

  await Promise.all(usersToNotify.map(user => {
    return sendTextMessage(
      user.phone,
      `
a challenge begins in ${process.env.NEXT_PUBLIC_LOCATION}.

find the target ASAP and scan their badge with goosechase.club to earn points.

you will be greatly rewarded. (or reply STOP to leave the game forever)
      `.trim()
    )
  }))

  res.status(200).json({})
}
