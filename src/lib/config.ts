function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env var ${name}`)
  return value
}

export const TWILIO_ACCOUNT_SID = requireEnv('TWILIO_ACCOUNT_SID')
export const TWILIO_AUTH_TOKEN = requireEnv('TWILIO_AUTH_TOKEN')

export const HACK_THE_NORTH_AUTH_TOKEN = requireEnv('HACK_THE_NORTH_AUTH_TOKEN')
