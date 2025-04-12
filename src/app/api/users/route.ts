import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "./user.service"

export const GET = async (req: NextRequest) => {
    const email = 'ana@email.com'
    const user = await getUserByEmail(email)
    return NextResponse.json(user)
}