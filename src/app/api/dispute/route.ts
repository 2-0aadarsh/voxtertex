// src/app/api/dispute/route.ts (frontend)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Get the JWT token from localStorage or cookies
     const token = req.headers.get('authorization'); // "Bearer <token>"
    console.log('Frontend route received token:', token);


    if (!token) {
      return NextResponse.json({ message: 'Authentication required. Please log in.' }, { status: 401 });
    }

    // Send the request to your backend
 
    // Forward request to backend
    const res = await fetch('http://localhost:3001/api/dispute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '', // Forward token
      },
      body: JSON.stringify(body),
    });


    const data = await res.json();

    // Forward the backend response
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Error sending dispute:', error);
    return NextResponse.json({ message: 'Failed to create dispute' }, { status: 500 });
  }
}
