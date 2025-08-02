import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { createAuthAxios } from "../../services/api";
import { SnippetForm } from "../snippets/SnippetForm";
import { SnippetCard } from "../snippets/SnippetCard";
import { Modal } from "../ui/Modal";

export const SnippetsPage = ({ token }) => {
  const [snippets, setSnippets] = useState([]);
  const [filteredSnippets, setFilteredSnippets] = useState([]);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snippetToDelete, setSnippetToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const authAxios = createAuthAxios(token);

  useEffect(() => {
    fetchSnippets();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = snippets.filter(
      (snippet) =>
        snippet.title.toLowerCase().includes(lowercasedFilter) ||
        snippet.language.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredSnippets(filtered);
  }, [searchTerm, snippets]);

  const fetchSnippets = async () => {
    try {
      const { data } = await authAxios.get("/snippets");
      setSnippets(data);
    } catch (error) {
      toast.error("Could not fetch snippets.");
    }
  };

  const onSnippetSave = () => {
    fetchSnippets();
    setEditingSnippet(null);
  };

  const handleEdit = (snippet) => {
    setEditingSnippet(snippet);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDeleteModal = (id) => {
    setSnippetToDelete(id);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await authAxios.delete(`/snippets/${snippetToDelete}`);
      toast.success("Snippet deleted!");
      fetchSnippets();
    } catch (error) {
      toast.error("Could not delete snippet.");
    } finally {
      setIsModalOpen(false);
      setSnippetToDelete(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3 w-full lg:sticky lg:top-8 self-start">
        <SnippetForm
          key={editingSnippet?.id}
          editingSnippet={editingSnippet}
          onSave={onSnippetSave}
          authAxios={authAxios}
        />
      </div>
      <div className="lg:w-2/3 w-full">
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by title or language..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-6">
          {filteredSnippets.length > 0 ? (
            filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                onEdit={handleEdit}
                onDelete={openDeleteModal}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10 p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold">No snippets found.</h3>
              <p className="mt-2">
                {searchTerm
                  ? "Try a different search term."
                  : "Add a new snippet to get started!"}
              </p>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Snippet"
      >
        Are you sure you want to permanently delete this snippet? This action
        cannot be undone.
      </Modal>
    </div>
  );
};
