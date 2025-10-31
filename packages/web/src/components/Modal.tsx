/** @jsx jsx */
/** @jsxImportSource hono/jsx */

import { type JSX, Fragment } from 'hono/jsx';

export const Modal = () => {
  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black/40 backdrop-blur-sm hidden items-center justify-center z-50"
    >
      <div
        id="modal-box"
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full opacity-0 scale-95 transition-all duration-300"
      >
        <h2 id="modal-title" className="text-lg font-bold mb-3">Modal Title</h2>
        <p id="modal-message" className="mb-6 text-gray-700 dark:text-gray-300">
          Message text goes here !
        </p>

        <div className="flex justify-center gap-4">
          <button
            id="modal-confirm"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            OK
          </button>
          <button
            id="modal-cancel"
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
