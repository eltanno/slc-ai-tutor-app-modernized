import { Box } from '@mui/material';
import YouTube from 'react-youtube';
import type { YouTubeProps } from 'react-youtube';

interface YouTubeEmbedProps {
  videoId: string;
}

/**
 * Component for safely embedding YouTube videos using react-youtube
 * @param videoId - The YouTube video ID (e.g., "dQw4w9WgXcQ" from https://www.youtube.com/watch?v=dQw4w9WgXcQ)
 */
export const YouTubeEmbed = ({ videoId }: YouTubeEmbedProps) => {
  // Don't render if no video ID provided
  if (!videoId) {
    return null;
  }

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        overflow: 'hidden',
        maxWidth: '100%',
        mt: 2,
        mb: 2,
        '& iframe': {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        },
      }}
    >
      <YouTube videoId={videoId} opts={opts} />
    </Box>
  );
};
