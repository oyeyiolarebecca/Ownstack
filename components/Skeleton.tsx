"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/60", className)}
      {...props}
    />
  );
}

export function StatsSkeleton() {
    return (
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-32">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="w-14 h-14 rounded-2xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function InvoiceSkeleton() {
    return (
        <div className="mt-8 bg-white border border-gray-100 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}
