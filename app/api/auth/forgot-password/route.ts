import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/utils/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists for security reasons
    // Still return a success message even if user doesn't exist
    if (!user) {
      return NextResponse.json({ 
        message: 'If an account with that email exists, we have sent password reset instructions.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Store reset token in database
    // First check if there's an existing token and delete it
    await prisma.passwordResetToken.deleteMany({
      where: { identifier: email },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: tokenExpiry,
      },
    });

    try {
      // Send password reset email
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      // In development, we'll still return success as the token is created
      // In production, we should handle this more carefully
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { message: 'Failed to send reset email. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      message: 'If an account with that email exists, we have sent password reset instructions.'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Failed to process request' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
