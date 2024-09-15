import prisma from '../../../lib/db/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCurrentChallenge } from '@/lib/db/challenge'
import { sendTextMessage } from '@/lib/twilio'
import { score } from '@/pages/api/user/get_all'

type ResponseData = {
  error?: 'INCORRECT_METHOD' | 'MALFORMED_DATA' | 'INCORRECT_PASSWORD'
  message?: 'ok'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') res.status(400).json({ error: 'INCORRECT_METHOD' })

  const { password, message } = req.body

  if (!password || !message)
    return res.status(400).json({ error: 'MALFORMED_DATA' })

  if (password != process.env.ADMIN_PASSWORD)
    return res.status(403).json({ error: 'INCORRECT_PASSWORD' })

  const usersToNotify = await prisma.user.findMany()

  await Promise.all(usersToNotify.map(user => {
    return sendTextMessage(
      user.phone, message
    )
  }))

  res.status(200).json({})
}
