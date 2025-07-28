import { NextRequest, NextResponse } from 'next/server';

// Тимчасове сховище для файлів (має співпадати з athlete-registration API)
const uploadedFiles = new Map<string, { name: string, size: number, type: string, data: string }>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 });
    }

    const file = uploadedFiles.get(fileId);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const buffer = Buffer.from(file.data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': file.type,
        'Content-Length': file.size.toString(),
        'Content-Disposition': `inline; filename="${file.name}"`
      }
    });
  } catch (error) {
    console.error('❌ Помилка отримання файлу:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
