export default function Footer() {
  return (
    <div className="flex flex-col items-center justify-around max-w-4xl mx-auto mt-12">
      <div className="flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-mono">
          Built with <span className="text-red-500">♥</span> by{" "}
          <a
            href="https://safedep.io"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            target="_blank"
          >
            SafeDep Team
          </a>{" "}
          using{" "}
          <a
            href="https://docs.safedep.io/cloud"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
            target="_blank"
          >
            SafeDep Cloud API
          </a>{" "}
          ⚡️{" "}
          <a
            href="/about"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
          >
            About
          </a>
        </p>
      </div>
    </div>
  );
}
