export default function Hero() {
    return (
        <section className="min-h-screen flex flex-col justify-center items-center text-center px-6">
            <h1 className="text-5xl md:text-6xl font-bold">
                Hi, I'm Eduardo 👋
            </h1>

            <p className="mt-6 text-lg text-gray-400 max-w-xl">
                Unity developer
            </p>

            <p className="mt-6 text-lg text-gray-400 max-w-xl">
                I build interactive apps, real-time systems, and tools that make
                technology more accessible.
            </p>

            <div className="mt-8 flex gap-4">
                <a
                    href="#projects"
                    className="bg-white text-black px-6 py-2 rounded-lg font-medium"
                >
                    View Projects
                </a>
                <a
                    href="#contact"
                    className="border border-gray-500 px-6 py-2 rounded-lg"
                >
                    Contact
                </a>
            </div>
        </section>
    );
}