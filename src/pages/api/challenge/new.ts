import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let users = await prisma.user.findMany()
  let challenge = await prisma.challenge.create({
    data: {
      taggeeId: users[Math.floor(Math.random() * users.length)].id,
    },
  })

  // TODO: mass ping, restart, etc

  return res.json(challenge)
}