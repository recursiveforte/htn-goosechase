import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { badgeCode, phone } = req.body
  let user = await prisma.user.upsert({
    where: {
      badgeCode,
    },
    update: {
      phone,
    },
    create: {
      badgeCode,
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
