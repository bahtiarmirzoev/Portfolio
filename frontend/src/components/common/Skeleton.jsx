import { motion } from 'framer-motion';

export const MovieCardSkeleton = () => {
  return (
    <div className="card animate-pulse">
      <div className="w-full aspect-[2/3] bg-white/10 rounded-lg mb-4"></div>
      <div className="h-6 bg-white/10 rounded mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-2/3"></div>
    </div>
  );
};

export const MovieListSkeleton = () => {
  return (
    <div className="card animate-pulse flex gap-6">
      <div className="w-32 h-48 bg-white/10 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 space-y-3">
        <div className="h-8 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
        <div className="h-4 bg-white/10 rounded"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    </div>
  );
};

export const CommentSkeleton = () => {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10 animate-pulse">
      <div className="h-4 bg-white/10 rounded mb-2"></div>
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-white/10 rounded w-1/4"></div>
    </div>
  );
};

