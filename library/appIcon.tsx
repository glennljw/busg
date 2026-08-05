// Renders the app's brand mark (amber badge + simplified bus silhouette) for
// use with next/og's ImageResponse, so icons are generated at build/request
// time instead of needing external image assets.
export const AppIconMark = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#d97706',
    }}
  >
    <div
      style={{
        width: '62%',
        height: '42%',
        backgroundColor: '#ffffff',
        borderRadius: '18%',
        display: 'flex',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '16%',
          left: '12%',
          right: '12%',
          height: '32%',
          backgroundColor: '#d97706',
          borderRadius: '30%',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-16%',
          left: '8%',
          width: '22%',
          height: '22%',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-16%',
          right: '8%',
          width: '22%',
          height: '22%',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'flex',
        }}
      />
    </div>
  </div>
);
