'use client';

import Image from 'next/image';
import { useState } from 'react';

export interface Article {
  title: string;
  source: { name: string };
  publishedAt: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
}

interface ArticleCardProps {
  article: Article;
  onDismiss: () => void;
}

function timeAgo(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ArticleCard({ article, onDismiss }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = article.urlToImage && !imgError;

  return (
    <article className="
      border border-[#1f1f1f] rounded-xl overflow-hidden
      bg-[#141414] hover:bg-[#181818] hover:border-[#2a2a2a]
      transition-colors duration-150 group
    ">
      {/* Image */}
      {showImage && (
        <div className="relative w-full h-44">
          <Image
            src={article.urlToImage!}
            alt={article.title}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
            unoptimized
          />
        </div>
      )}

      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#5a5a5a] uppercase tracking-wider truncate max-w-[60%]">
            {article.source.name}
          </span>
          <span className="text-xs text-[#3d3d3d] shrink-0 ml-2">
            {timeAgo(article.publishedAt)}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-[#d8d6d1] text-base font-semibold leading-snug mb-2 group-hover:text-[#e8e6e1] transition-colors">
          {article.title}
        </h2>

        {/* Description */}
        {article.description && (
          <p className="text-sm text-[#666] leading-relaxed mb-4 line-clamp-2">
            {article.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#5a5a5a] hover:text-[#b0b0b0] transition-colors underline underline-offset-2 decoration-[#333]"
          >
            Read article →
          </a>
          <button
            onClick={onDismiss}
            className="text-xs text-[#333] hover:text-[#666] transition-colors cursor-pointer"
            aria-label="Dismiss article"
          >
            Dismiss
          </button>
        </div>
      </div>
    </article>
  );
}
