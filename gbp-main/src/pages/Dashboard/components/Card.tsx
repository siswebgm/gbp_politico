import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description: string;
}

export function Card({ title, value, icon, description }: CardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900 dark:text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </div>
      </div>
    </div>
  );
}