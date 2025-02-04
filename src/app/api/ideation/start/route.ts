export async function POST(req: Request) {
  const { path } = await req.json()
  // Handle path selection and session creation
  return Response.json({ success: true })
} 