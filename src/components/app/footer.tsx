export default function Footer() {
  return (
    <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center justify-around">
      <div className="flex items-center justify-center">
        <p className="text-center font-mono text-sm text-gray-500 dark:text-gray-400">
          Built with <span className="text-red-500">♥</span> by{" "}
          <a
            href="https://safedep.io"
            className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            target="_blank"
          >
            SafeDep Team
          </a>{" "}
          using{" "}
          <a
            href="https://docs.safedep.io/cloud"
            className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
            target="_blank"
          >
            SafeDep Cloud API
          </a>{" "}
          ⚡️{" "}
          <a
            href="/about"
            className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            About
          </a>
        </p>
      </div>
    </div>
  );
}
