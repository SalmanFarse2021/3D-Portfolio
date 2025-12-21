'use client';

import { useState } from 'react';

export default function AdminIndexPage() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [adminKey, setAdminKey] = useState('');

    const handleIndex = async () => {
        if (!adminKey) {
            setStatus('Please enter the Admin Key (OPENAI_API_KEY for demo)');
            return;
        }

        setLoading(true);
        setStatus('Indexing started... this may take a few minutes.');

        try {
            const res = await fetch('/api/index', {
                method: 'POST',
                headers: {
                    'x-admin-key': adminKey,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setStatus(`Success! Indexed ${data.stats.repos} repos, ${data.stats.files} files, ${data.stats.chunks} chunks.`);
            } else {
                setStatus(`Error: ${data.error}`);
            }
        } catch (error: any) {
            setStatus(`Network Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
            <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
                <h1 className="text-2xl font-bold mb-4">Admin: Index Knowledge Base</h1>
                <p className="mb-6 text-gray-400">
                    Trigger a manual re-index of all GitHub repositories. This will fetch the latest code and update the RAG vector database.
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Admin Key</label>
                    <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter OPENAI_API_KEY"
                    />
                </div>

                <button
                    onClick={handleIndex}
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Indexing...' : 'Start Indexing'}
                </button>

                {status && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${status.startsWith('Success') ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
