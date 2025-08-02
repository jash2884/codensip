import React, { useContext } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { FilePenLine, Trash2, Clipboard } from "lucide-react";
import { toast } from "react-hot-toast";
import { ThemeContext } from "../../contexts/ThemeContext";

export const SnippetCard = ({ snippet, onEdit, onDelete }) => {
  const { theme } = useContext(ThemeContext);
  const handleCopy = (codeToCopy) => {
    navigator.clipboard.writeText(codeToCopy);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {snippet.title}
          </h3>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-700 inline-block px-2 py-1 rounded mt-1">
            {snippet.language}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => handleCopy(snippet.code)}
            title="Copy code"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <Clipboard size={18} />
          </button>
          <button
            onClick={() => onEdit(snippet)}
            title="Edit snippet"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
          >
            <FilePenLine size={18} />
          </button>
          <button
            onClick={() => onDelete(snippet.id)}
            title="Delete snippet"
            className="text-gray-500 dark:text-gray-400 hover:text-red-500"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="text-sm">
        <SyntaxHighlighter
          language={snippet.language}
          style={theme === "light" ? oneLight : oneDark}
          customStyle={{
            margin: 0,
            borderRadius: "0 0 0.5rem 0.5rem",
            borderTop: "1px solid #e5e7eb",
            background: theme === "light" ? "#f9fafb" : "#1f2937",
          }}
        >
          {snippet.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
