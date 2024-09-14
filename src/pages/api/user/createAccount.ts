import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/db/prisma'
import { BadgeData, getBadgeAvatar, lookupBadge } from '@/lib/hackTheNorth'
import { errorString } from '@/lib/util'
import parsePhoneNumberFromString from 'libphonenumber-js'
import { ScanBadgeResponse } from './scanBadge'
import { sendTextMessage } from '@/lib/twilio'

export type CreateAccountResponse =
  | { success: true; badge: BadgeData; userId: number }
  | { success: false; error: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const phoneNumber = String(req.query.phoneNumber)
  const badgeCode = String(req.query.badgeCode)

  const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber)
  if (!parsedPhoneNumber?.isValid()) {
    return res.json({
      success: false,
      error: 'Invalid phone number',
    } satisfies ScanBadgeResponse)
  }

  let badge: BadgeData
  try {
    badge = await lookupBadge(badgeCode)
  } catch (error) {
    return res.json({
      success: false,
      error: errorString(error),
    } satisfies ScanBadgeResponse)
  }

  const avatarData = await getBadgeAvatar(badge)

  await sendTextMessage(
    parsedPhoneNumber.format('E.164'),
    `goosechase is now aware of you. you'll hear from us when you least expect it.`
  )

  const user = await prisma.user.create({
    data: {
      name: badge.name,
      avatarData,
      phone: parsedPhoneNumber.format('E.164'),
      badgeCode,
    },
  })

  return res.json({
    success: true,
    badge,
    userId: user.id,
  } satisfies ScanBadgeResponse)
}
