import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface ArtworkImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export const ArtworkImage: React.FC<ArtworkImageProps> = ({
  src,
  alt,
  title,
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[var(--bg-subtle)] text-[var(--text-muted)] ${className}`}
        aria-label={alt}
      >
        <BookOpen className="w-6 h-6 mb-1.5 opacity-60" />
        <span className="text-xs font-poetry tracking-wide">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
