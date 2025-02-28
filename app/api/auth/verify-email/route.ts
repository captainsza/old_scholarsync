import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 400 });
    }
    
    // Find the verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    });
    
    if (!verificationToken) {
      return NextResponse.redirect(new URL('/verification-failed', req.url));
    }
    
    // Update the user's emailVerified status
    await prisma.user.updateMany({
      where: {
        email: verificationToken.identifier,
      },
      data: {
        emailVerified: true,
      },
    });
    
    // Delete the verification token
    await prisma.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });
    
    // Redirect to verification success page
    return NextResponse.redirect(new URL('/verification-success', req.url));
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/verification-failed', req.url));
  } finally {
    await prisma.$disconnect();
  }
}
