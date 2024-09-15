import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/db/prisma'
import { sendTextMessage } from '@/lib/twilio'
import { lookupBadge } from '@/lib/hackTheNorth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(400).json({ error: 'INCORRECT_METHOD' })

  const { taggedId, password } = req.body

  if (!taggedId || !password)
    return res.status(400).json({ error: 'MALFORMED_DATA' })

  if (password != process.env.ADMIN_PASSWORD)
    return res.status(403).json({ error: 'INCORRECT_PASSWORD' })

  await prisma.challenge.updateMany({
    where: {
      invalidated: false,
    },
    data: {
      invalidated: true,
    },
  })

  const tagged = await prisma.user.findUnique({ where: { id: taggedId } })

  if (!tagged) return res.status(400).json({ error: 'RESOURCE_DNE' })

  const challenge = await prisma.challenge.create({
    data: {
      taggedId,
    },
  })

  await sendTextMessage(
    tagged.phone,
    `
you are it. get someone to use goosechase.club to scan your badge.

the faster, the more points you earn.

you will be greatly rewarded.
    `.trim()
  )

  /*for (const user of otherUsers) {
    if (!user.phone) continue
    await sendTextMessage(
      user.phone,
      `
a challenge begins in the food tent.

find ${taggedName.toLowerCase()} ASAP and scan their badge with goosechase.club to earn points.

you will be greatly rewarded. (or reply STOP to leave the game forever)
      `.trim()
    )
  }*/

  return res.json(challenge)
}
