import React from 'react';

const SkeletonBox: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-shimmer rounded-lg ${className}`} />
);

const DashboardSkeleton: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="hidden md:flex justify-between items-center mb-6">
                <SkeletonBox className="h-9 w-1/3" />
                <div className="flex items-center space-x-4">
                    <SkeletonBox className="h-10 w-10 rounded-full" />
                    <SkeletonBox className="h-10 w-10 rounded-full" />
                </div>
            </div>

            {/* Balance Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonBox className="h-36" />
                <SkeletonBox className="h-36" />
                <SkeletonBox className="h-36" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Your Accounts Skeleton */}
                    <div>
                        <div className="flex justify-between items-center mb-4 px-2">
                            <SkeletonBox className="h-7 w-1/4" />
                            <SkeletonBox className="h-8 w-20" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <SkeletonBox className="w-36 h-36 rounded-xl shrink-0" />
                            <SkeletonBox className="w-64 h-40 rounded-xl shrink-0" />
                            <SkeletonBox className="w-64 h-40 rounded-xl shrink-0 hidden md:block" />
                        </div>
                    </div>

                    {/* Activity Chart Skeleton */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <SkeletonBox className="h-7 w-1/2" />
                            <SkeletonBox className="h-9 w-1/4" />
                        </div>
                        <SkeletonBox className="h-[300px] w-full" />
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Recent Activity Skeleton */}
                    <div>
                        <SkeletonBox className="h-6 w-1/2 mb-4" />
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center">
                                    <SkeletonBox className="h-12 w-12 rounded-lg mr-4 shrink-0" />
                                    <div className="flex-grow space-y-2">
                                        <SkeletonBox className="h-4 w-full" />
                                        <SkeletonBox className="h-4 w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Debt/Recurring Skeleton */}
                     <div>
                        <SkeletonBox className="h-6 w-1/2 mb-4" />
                        <div className="space-y-2">
                            <SkeletonBox className="h-8 w-full" />
                            <SkeletonBox className="h-8 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
