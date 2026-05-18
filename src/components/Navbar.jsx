export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-gray-900/80 backdrop-blur z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between">
        <h1 className="font-bold">Eduardo Santos</h1>

        <div className="flex gap-6">
          <a href="#projects" className="hover:text-gray-300">
            Projects
          </a>
          <a href="#contact" className="hover:text-gray-300">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}