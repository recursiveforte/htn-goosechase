import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  let user = await prisma.user.findUnique({
    where: {
      id: parseInt(String(id)),
    },
    include: {
      taggings: true,
      tags: true,
    },
  })
  return res.json(user)
}
