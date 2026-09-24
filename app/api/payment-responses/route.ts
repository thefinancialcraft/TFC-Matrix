import { NextResponse } from 'next/server'

const PAYMENT_RESPONSES_SCRIPT_URL = process.env.PAYMENT_RESPONSES_SCRIPT_URL || ''

export async function GET(request: Request) {
  if (!PAYMENT_RESPONSES_SCRIPT_URL) {
    return NextResponse.json(
      { error: 'PAYMENT_RESPONSES_SCRIPT_URL is not configured.' },
      { status: 500 }
    )
  }

  try {
    const requestUrl = new URL(request.url)
    const scriptUrl = new URL(PAYMENT_RESPONSES_SCRIPT_URL)
    const startDate = requestUrl.searchParams.get('startDate')
    const endDate = requestUrl.searchParams.get('endDate')

    if (startDate) scriptUrl.searchParams.set('startDate', startDate)
    if (endDate) scriptUrl.searchParams.set('endDate', endDate)

    const response = await fetch(scriptUrl.toString(), { cache: 'no-store' })
    const payload = await response.json()

    if (!response.ok || payload.error) {
      return NextResponse.json(
        { error: payload.error || 'Payment Responses request failed.' },
        { status: response.ok ? 502 : response.status }
      )
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Payment Responses API error:', error)
    return NextResponse.json(
      { error: 'Unable to fetch Payment Responses data.' },
      { status: 500 }
    )
  }
}
