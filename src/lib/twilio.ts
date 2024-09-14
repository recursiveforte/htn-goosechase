import twilio from 'twilio'
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from './config'

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

/**
 * Send an SMS message.
 *
 * `to` must be full E.164 format with preceeding plus sign.
 */
export async function sendTextMessage(to: string, body: string) {
  await client.messages.create({
    from: '+13082443373',
    to,
    body,
  })
}
