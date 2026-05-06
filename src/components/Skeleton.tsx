import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps {
  className?: string;
  key?: React.Key;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn("animate-pulse bg-gray-200 rounded-md", className)} 
      aria-hidden="true"
    />
  );
}
