import React from "react";
import { Code } from "lucide-react";

export const Logo = () => (
  <div className="flex items-center gap-2">
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 17.25C8.41421 17.25 8.75 16.9142 8.75 16.5V7.5C8.75 7.08579 8.41421 6.75 8 6.75C7.58579 6.75 7.25 7.08579 7.25 7.5V16.5C7.25 16.9142 7.58579 17.25 8 17.25Z"
        className="fill-indigo-500 dark:fill-indigo-400"
      />
      <path
        d="M12.5873 18.3533C12.8594 18.526 13.221 18.4449 13.3937 18.1728L17.8937 11.4228C18.0664 11.1507 17.9852 10.7891 17.7131 10.6164C17.441 10.4437 17.0794 10.5248 16.9067 10.7969L12.75 16.973L11.2031 5.8272C11.134 5.55661 10.8655 5.37833 10.5949 5.44743C10.3243 5.51652 10.146 5.78505 10.2151 6.05564L12.5873 18.3533Z"
        className="fill-gray-700 dark:fill-gray-300"
      />
    </svg>
    <span className="text-2xl font-bold text-gray-800 dark:text-white">
      CodeSnip
    </span>
  </div>
);
