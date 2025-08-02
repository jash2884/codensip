import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export const SnippetForm = ({ editingSnippet, onSave, authAxios }) => {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (editingSnippet) {
      setTitle(editingSnippet.title);
      setLanguage(editingSnippet.language);
      setCode(editingSnippet.code);
    } else {
      resetForm();
    }
  }, [editingSnippet]);

  const resetForm = () => {
    setTitle("");
    setLanguage("javascript");
    setCode("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !code) return;
    const snippetData = { title, language, code };
    const promise = editingSnippet
      ? authAxios.put(`/snippets/${editingSnippet.id}`, snippetData)
      : authAxios.post("/snippets", snippetData);

    toast.promise(promise, {
      loading: "Saving snippet...",
      success: () => {
        resetForm();
        onSave();
        return editingSnippet ? "Snippet updated!" : "Snippet saved!";
      },
      error: "Could not save snippet.",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <PlusCircle size={24} />{" "}
        {editingSnippet ? "Edit Snippet" : "Add New Snippet"}
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="sql">SQL</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="bash">Bash/Shell</option>
          <option value="json">JSON</option>
        </select>
        <textarea
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows="10"
          className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>
      <div className="mt-6 flex gap-4">
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {editingSnippet ? "Update Snippet" : "Save Snippet"}
        </button>
        {editingSnippet && (
          <button
            type="button"
            onClick={() => onSave()}
            className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
