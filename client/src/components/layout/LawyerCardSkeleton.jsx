import React from 'react'
import { Skeleton } from "@heroui/skeleton";
import { FaStar, FaMapMarkerAlt, FaChevronDown } from "react-icons/fa";

const LawyerCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl shadow-lg transition-all duration-300 p-6 border border-slate-100 relative">
      {/* Rating Badge Skeleton */}
      <div className="absolute right-2 top-2 bg-yellow-50 px-3 py-1 rounded-full flex items-center gap-2 text-sm shadow-sm">
        <FaStar className="text-yellow-400" />
        <Skeleton className="w-6 h-4 rounded">
          <div className="bg-yellow-200"></div>
        </Skeleton>
      </div>

      {/* Profile Section Skeleton */}
      <div className="flex items-center gap-5 h-28">
        <div className="relative">
          <Skeleton className="w-20 h-20 rounded-full bg-gray-300">
            <div className="bg-gray-200"></div>
          </Skeleton>
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-gray-300 rounded-full ring-2 ring-white"></span>
        </div>

        <div className="flex-1 space-y-2">
          {/* Name */}
          <Skeleton className="w-3/4 h-6 rounded-lg bg-gray-300">
            <div className="bg-gray-200"></div>
          </Skeleton>

          {/* Role and Experience */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-1/2 h-4 rounded bg-gray-300">
              <div className="bg-gray-200"></div>
            </Skeleton>
            <Skeleton className="w-16 h-5 rounded-lg bg-gray-300">
              <div className="bg-gray-300"></div>
            </Skeleton>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm mt-2">
            <FaMapMarkerAlt className="mr-2 text-slate-300" />
            <Skeleton className="w-1/3 h-4 rounded bg-gray-300">
              <div className="bg-gray-200"></div>
            </Skeleton>
          </div>
        </div>
      </div>

      {/* Specializations Skeleton */}
      <div className="flex gap-2 mt-2 h-7 pt-1 pb-1">
        <Skeleton className="w-20 h-6 rounded-full bg-gray-300">
          <div className="bg-gray-200"></div>
        </Skeleton>
        <Skeleton className="w-24 h-6 rounded-full bg-gray-300">
          <div className="bg-gray-200"></div>
        </Skeleton>
        <Skeleton className="w-16 h-6 rounded-full bg-gray-300">
          <div className="bg-gray-200"></div>
        </Skeleton>
      </div>

      {/* Availability + Price Section */}
      <div className="h-10 flex items-center justify-between mt-2 p-5">
        {/* Availability */}
        <Skeleton className="w-20 h-6 rounded-lg bg-gray-300">
          <div className="bg-gray-200"></div>
        </Skeleton>

        {/* Fee */}
        <div className="text-lg font-bold bg-gray-300 pl-2 pr-2 rounded-lg flex items-center">
          <Skeleton className="w-16 h-5 rounded mr-2 bg-gray-300">
            <div className="bg-gray-200"></div>
          </Skeleton>
          <FaChevronDown className="text-white text-xs" />
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="flex gap-3 mt-2">
        <Skeleton className="flex-1 h-8 rounded-xl bg-gray-300">
          <div className="bg-gray-200"></div>
        </Skeleton>
        <Skeleton className="flex-1 h-8 rounded-xl bg-gray-300">
          <div className="bg-gray-200"></div>
        </Skeleton>
      </div>
    </div>
  )
}

export default LawyerCardSkeleton