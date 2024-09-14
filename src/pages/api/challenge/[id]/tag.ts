import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const { taggerId } = req.body
  let challenge = await prisma.challenge.update({
    where: {
      id: String(id),
    },
    data: {
      taggerId: parseInt(taggerId),
      taggedAt: new Date()
    },
  })
  // mass ping everyone: tagged!
  return res.json(challenge)
}
