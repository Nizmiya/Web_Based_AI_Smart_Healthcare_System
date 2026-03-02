'use client';

type VideoRecommendation = {
  title: string;
  url: string;
  category?: string;
  note?: string;
};

const getYouTubeId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '');
    }
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
      const parts = parsed.pathname.split('/');
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return parts[embedIndex + 1];
      }
    }
  } catch {
    return null;
  }
  return null;
};

const toEmbedUrl = (url: string): string => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
};

export default function VideoRecommendations({
  title = 'Recommended Videos',
  videos,
}: {
  title?: string;
  videos: VideoRecommendation[];
}) {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video, index) => (
          <div
            key={`${video.title}-${index}`}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="p-4 flex items-start justify-between gap-3">
              <p className="font-semibold text-gray-800">{video.title}</p>
              {video.category && (
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full capitalize">
                  {video.category.replace('_', ' ')}
                </span>
              )}
            </div>
            {video.note && (
              <div className="px-4 pb-2 text-xs text-gray-500">{video.note}</div>
            )}
            <div className="aspect-video w-full bg-gray-100">
              <iframe
                className="w-full h-full"
                src={toEmbedUrl(video.url)}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="p-4 text-xs text-gray-500">
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Open on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


