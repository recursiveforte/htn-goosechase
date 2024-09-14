import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const users = await prisma.user.findMany({
    include: {
      taggings: true,
      tags: true,
    },
  })
  return res.json(users)
}
