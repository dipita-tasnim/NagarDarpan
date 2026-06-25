import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiFileText, FiSearch, FiList, FiClipboard } from 'react-icons/fi';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: <FiFileText size={28} />, title: 'Report a Problem', desc: 'Submit civic issues with photos and location details', link: '/report', color: 'bg-emerald-50 text-emerald-600' },
    { icon: <FiSearch size={28} />, title: 'Track Your Issue', desc: 'Use your reference number to check real-time status', link: '/track', color: 'bg-blue-50 text-blue-600' },
    { icon: <FiList size={28} />, title: 'View All Problems', desc: 'Browse all reported issues and their current status', link: '/problems', color: 'bg-purple-50 text-purple-600' },
    { icon: <FiClipboard size={28} />, title: 'My Reports', desc: 'View and manage all problems you have reported', link: '/my-problems', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">NagarDarpan</h1>
          <p className="text-lg md:text-xl text-emerald-100 mb-8">
            Reflecting the voice of every citizen : report civic problems, track progress, and drive accountability.
          </p>
          {user ? (
            <Link to="/report" className="inline-block bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition shadow-lg">
              Report a Problem
            </Link>
          ) : (
            <Link to="/signup" className="inline-block bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition shadow-lg">
              Get Started
            </Link>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">What You Can Do</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Link key={i} to={f.link} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 text-center group">
              <div className={`w-14 h-14 ${f.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Report', desc: 'Submit your problem with details, location, and a "before" photo.' },
              { step: '2', title: 'Track', desc: 'Get a unique reference number to track progress in real time.' },
              { step: '3', title: 'Resolve', desc: 'Watch the status change and see "after" photos when resolved.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
