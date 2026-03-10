import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (type === 'csv') {
    const csvContent = "Time,R_V,R_A,Y_V,Y_A,B_V,B_A,Temp,CO2,Vib\n2024-03-08 14:30:10,232.5,1.4,228.1,0.0,231.7,0.5,28.5,850,NORMAL";
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="AI_Dataset.csv"',
      },
    });
  }

  // Fallback PDF mock
  return new NextResponse('Mock PDF Content representing Machine Performance Report', {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="Machine_Report.pdf"',
    },
  });
}
