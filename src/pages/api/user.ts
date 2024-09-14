import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, phone } = req.body
  let user = await prisma.user.upsert({
    where: {
      username,
    },
    update: {
      phone,
    },
    create: {
      username,
      phone: phone || null,
    },
    include: {
      taggings: true,
      tags: true,
    },
  })
  // send a confirmation!
  return res.json(user)
}
