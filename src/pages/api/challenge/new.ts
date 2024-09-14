import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db/prisma'
import { sendTextMessage } from '@/lib/twilio'
import { lookupBadge } from '@/lib/hackTheNorth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(400).json({ error: 'INCORRECT_METHOD' })

  const {taggedId} = req.body

  if (!taggedId)
    return res.status(400).json({ error: 'MALFORMED_DATA' })

  await prisma.challenge.updateMany({
    where: {
      invalidated: false
    },
    data: {
      invalidated: true
    },
  })

  const tagged = await prisma.user.findUnique({where: {id: taggedId}})

  const otherUsers = await prisma.user.findMany({
    where: {
      id: {
        not: taggedId
      }
    },
  })

  if (!tagged)
    return res.status(400).json({ error: 'RESOURCE_DNE' })

  const challenge = await prisma.challenge.create({
    data: {
      taggedId
    },
  })

  const taggedName = await lookupBadge(tagged.badgeCode).then(
    (data) => data.name
  )

  await sendTextMessage(
    tagged.phone,
    'you are the taggee! get points by getting tagged as soon as possible.\n\ngoosechase.club\nSTOP to leave the game'
  )

  for (const user of otherUsers) {
    if (!user.phone) continue
    await sendTextMessage(
      user.phone,
      `a challenge begins. tag ${taggedName} ASAP\n\ngoosechase.club\nSTOP to leave the game`
    )
  }

  return res.json(challenge)
}
