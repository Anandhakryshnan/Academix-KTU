import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 256,
  height: 256,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 180,
          background: '#050505',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontFamily: 'monospace',
          border: '12px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'inset 0 0 40px rgba(255, 255, 255, 0.1)',
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}
