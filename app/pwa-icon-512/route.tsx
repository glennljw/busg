import { ImageResponse } from 'next/og';
import { AppIconMark } from '../../library/appIcon';

export async function GET() {
  return new ImageResponse(<AppIconMark />, { width: 512, height: 512 });
}
