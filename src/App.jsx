import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Menu, 
  X, 
  ChevronRight, 
  Star, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  Plane, 
  Coffee,
  MessageCircle,
  Instagram,
  Github,
  Loader,
  Sparkles,
  ChefHat,
  TrendingUp,
  Map,
  Clock,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';

// --- STYLES ---
const Styles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translate3d(0, 20px, 0); }
      to { opacity: 1; transform: translate3d(0, 0, 0); }
    }
    .animate-fade-in-up { animation: fadeInUp 0.3s ease-out; }
    body { background-color: #f9fafb; }
    
    /* Styling khusus untuk hasil render AI */
    .ai-result ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 0.5rem; }
    .ai-result ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 0.5rem; }
    .ai-result li { margin-bottom: 0.25rem; }
    .ai-result strong { font-weight: 700; color: #1e3a8a; }
  `}</style>
);

// --- GEMINI API HELPER ---
const callGeminiAPI = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // API Key disediakan oleh environment runtime
  
  if (!apiKey) {
    return "⚠️ API Key belum diset. Hubungi admin untuk aktivasi fitur AI.";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI sedang sibuk. Coba lagi nanti.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan koneksi saat menghubungi AI.";
  }
};

// --- HELPER: FORMATTER TEXT AI ---
// Fungsi ini mengubah teks markdown menjadi elemen React yang rapi
// UPDATE: Menangani #, ##, ### dan membersihkan tabel
const AIResponseRenderer = ({ text }) => {
  if (!text) return null;

  // Split text per baris
  const lines = text.split('\n');

  return (
    <div className="ai-result text-sm leading-relaxed text-gray-800">
      {lines.map((line, index) => {
        let content = line.trim();
        
        if (!content) return <br key={index} />;

        // 1. Handle Markdown Headings (#, ##, ###)
        // Mengubah # Judul menjadi teks tebal biasa tanpa simbol pagar
        if (content.startsWith('#')) {
            content = content.replace(/^#+\s*/, ''); // Hapus tanda # di awal
            return <h4 key={index} className="font-bold text-blue-900 mt-3 mb-1 text-base">{content}</h4>;
        }

        // 2. Handle Markdown Tables (Fallback Cleaning)
        // Jika masih ada baris tabel (| sel | sel |), kita bersihkan pipanya agar jadi teks biasa
        if (content.startsWith('|')) {
             content = content.replace(/\|/g, ' ').trim(); // Ganti | dengan spasi
        }

        // 3. Deteksi List Item (* atau -)
        const isListItem = content.startsWith('* ') || content.startsWith('- ');
        if (isListItem) {
          content = content.substring(2); // Hapus simbol list di awal
        }

        // 4. Parsing Bolding (**teks**)
        const parts = content.split(/(\*\*.*?\*\*)/g);
        const formattedContent = parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (isListItem) {
          return (
            <div key={index} className="flex items-start mb-1">
              <span className="mr-2 text-blue-500 min-w-[10px]">•</span>
              <span>{formattedContent}</span>
            </div>
          );
        }

        return <p key={index} className="mb-2">{formattedContent}</p>;
      })}
    </div>
  );
};


// --- COMPONENTS ---

const Header = ({ currentView, setView, isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <header className="fixed top-0 w-full bg-white shadow-sm z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-blue-900">HomeyTips <span className="text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full ml-1">AI Powered</span></span>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <button onClick={() => setView('home')} className={`${currentView === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'}`}>Beranda</button>
          <button onClick={() => setView('tools')} className={`${currentView === 'tools' ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'}`}>Smart Tools</button>
          <button onClick={() => setView('products')} className={`${currentView === 'products' ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'}`}>Produk</button>
          <button onClick={() => setView('testimonials')} className={`${currentView === 'testimonials' ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'}`}>Testimoni</button>
        </nav>

        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-blue-600">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </div>

    {isMobileMenuOpen && (
      <div className="md:hidden bg-white border-t border-gray-100">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 w-full text-left">Beranda</button>
          <button onClick={() => { setView('tools'); setIsMobileMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 w-full text-left">Smart Tools</button>
          <button onClick={() => { setView('products'); setIsMobileMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 w-full text-left">Produk</button>
        </div>
      </div>
    )}
  </header>
);

const Hero = ({ setView }) => (
  <div className="bg-gradient-to-br from-blue-50 to-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto text-center">
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <Sparkles className="w-4 h-4 mr-2" />
          Sekarang dengan Gemini AI
        </span>
      </div>
      <h1 className="text-4xl tracking-tight font-extrabold text-blue-900 sm:text-5xl md:text-6xl">
        Perencanaan Hidup <span className="text-blue-600">Lebih Cerdas</span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        Gunakan kekuatan AI untuk mengatur keuangan, merencanakan perjalanan ibadah, hingga menentukan menu masakan harian Anda.
      </p>
      <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        <div className="rounded-md shadow">
          <button onClick={() => setView('products')} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg">
            Lihat Template
          </button>
        </div>
        <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
          <button onClick={() => setView('tools')} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg">
            <Sparkles className="w-5 h-5 mr-2" />
            Coba AI Tools
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- TOOLS SECTION COMPONENTS ---

const FinancialTool = () => {
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [result, setResult] = useState(null);
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    const inc = parseFloat(income) || 0;
    const exp = parseFloat(expense) || 0;
    const savings = inc - exp;
    const ratio = inc > 0 ? (savings / inc) * 100 : 0;
    setResult({ savings, ratio });
    setAdvice(''); 
  };

  const askAI = async () => {
    if (!result) return;
    setLoading(true);
    const prompt = `Saya memiliki pemasukan Rp${income} dan pengeluaran Rp${expense}. Sisa uang Rp${result.savings} (Ratio tabungan ${result.ratio.toFixed(1)}%). Berikan 3 tips singkat, praktis, dan ramah untuk mengoptimalkan keuangan saya agar lebih sehat. Gunakan format poin. WAJIB Jawab menggunakan Bahasa Indonesia. JANGAN gunakan format tabel atau heading markdown (#). Cukup bullet points biasa.`;
    const response = await callGeminiAPI(prompt);
    setAdvice(response);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 h-full flex flex-col">
      <div className="flex items-center mb-4 text-blue-600">
        <TrendingUp className="w-6 h-6 mr-2" />
        <h3 className="text-xl font-bold">Cek Kesehatan Keuangan</h3>
      </div>
      <div className="space-y-4 flex-grow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Pemasukan Bulanan</label>
          <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2" placeholder="5000000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Pengeluaran Bulanan</label>
          <input type="number" value={expense} onChange={(e) => setExpense(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2" placeholder="3000000" />
        </div>
        <button onClick={calculate} className="w-full bg-blue-100 text-blue-700 py-2 rounded-md hover:bg-blue-200 font-medium">Hitung Manual</button>
        
        {result && (
          <div className={`p-4 rounded-md ${result.savings >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-bold">Sisa: Rp {result.savings.toLocaleString()}</p>
            <p className="text-sm">Ratio: {result.ratio.toFixed(1)}%</p>
            
            <button 
              onClick={askAI} 
              disabled={loading}
              className="mt-3 w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-md hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Minta Saran AI</>}
            </button>
          </div>
        )}

        {advice && (
          <div className="bg-indigo-50 p-4 rounded-md animate-fade-in-up border border-indigo-100">
            <h4 className="font-bold mb-3 flex items-center text-indigo-800"><Sparkles className="w-4 h-4 mr-1 text-indigo-500"/> Saran AI:</h4>
            <AIResponseRenderer text={advice} />
          </div>
        )}
      </div>
    </div>
  );
};

const UmrahTool = () => {
  const [target, setTarget] = useState(30000000);
  const [saving, setSaving] = useState('');
  const [months, setMonths] = useState(null);
  
  // New States for Planning
  const [tripType, setTripType] = useState('Umrah');
  const [destination, setDestination] = useState(''); 
  const [duration, setDuration] = useState('9');
  
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    const sav = parseFloat(saving) || 0;
    if (sav > 0) {
      setMonths(Math.ceil(target / sav));
    }
  };

  const generateItinerary = async () => {
    setLoading(true);
    let destinationText = tripType === 'Umrah' ? 'Umrah (Mekkah & Madinah)' : destination;
    
    if (tripType === 'Liburan' && !destination.trim()) {
        destinationText = "Destinasi Liburan Populer (Jepang/Korea)";
    }

    const prompt = `Buatkan rencana perjalanan (itinerary) untuk ${destinationText} selama ${duration} hari. Berikan poin-poin kegiatan utama per hari secara ringkas dan padat. Fokus pada tempat wajib dikunjungi. Gunakan Bahasa Indonesia sepenuhnya. Format list hari demi hari. JANGAN gunakan format tabel atau heading markdown (#).`;
    
    const response = await callGeminiAPI(prompt);
    setItinerary(response);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 h-full flex flex-col">
      <div className="flex items-center mb-4 text-blue-600">
        <Plane className="w-6 h-6 mr-2" />
        <h3 className="text-xl font-bold">Planner Perjalanan</h3>
      </div>
      <div className="space-y-4 flex-grow">
        
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tipe Perjalanan</label>
                <select 
                    value={tripType} 
                    onChange={(e) => setTripType(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 text-sm"
                >
                    <option value="Umrah">Umrah</option>
                    <option value="Liburan">Liburan</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Durasi (Hari)</label>
                <div className="relative">
                    <input 
                        type="number" 
                        value={duration} 
                        onChange={(e) => setDuration(e.target.value)} 
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 text-sm pl-8"
                    />
                    <Clock className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                </div>
            </div>
        </div>

        {tripType === 'Liburan' && (
            <div className="animate-fade-in-up">
                 <label className="block text-xs font-medium text-gray-700 mb-1">Tujuan Liburan</label>
                 <div className="relative">
                    <input 
                        type="text" 
                        value={destination} 
                        onChange={(e) => setDestination(e.target.value)} 
                        placeholder="Contoh: Jepang, Bali, Turki..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 text-sm pl-8" 
                    />
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                 </div>
            </div>
        )}

        <hr className="border-gray-100"/>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Target Dana (Rp)</label>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tabungan / Bulan</label>
          <input type="number" value={saving} onChange={(e) => setSaving(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2 text-sm" placeholder="1000000" />
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={calculate} className="bg-blue-100 text-blue-700 py-2 rounded-md hover:bg-blue-200 font-medium text-xs">Hitung Tabungan</button>
            <button onClick={generateItinerary} disabled={loading} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-md hover:from-purple-700 hover:to-indigo-700 font-medium text-xs flex items-center justify-center">
                {loading ? <Loader className="w-3 h-3 animate-spin" /> : <><Map className="w-3 h-3 mr-1" /> Buat Itinerary</>}
            </button>
        </div>
        
        {months && (
          <div className="p-3 bg-blue-50 text-blue-900 rounded-md animate-fade-in-up mt-2 text-center">
            <p className="text-xs text-gray-500">Bisa berangkat dalam:</p>
            <p className="text-lg font-bold">{months} Bulan</p>
          </div>
        )}

        {itinerary && (
            <div className="bg-purple-50 p-4 rounded-md border border-purple-100 animate-fade-in-up max-h-60 overflow-y-auto mt-4">
                 <h4 className="font-bold mb-3 flex items-center text-purple-800 text-sm"><Sparkles className="w-3 h-3 mr-1 text-purple-500"/> Rencana {tripType} {duration} Hari:</h4>
                 <AIResponseRenderer text={itinerary} />
            </div>
        )}
      </div>
    </div>
  );
};

const MealTool = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const generateRecipe = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    const prompt = `Saya punya bahan-bahan ini di kulkas: ${ingredients}. Tolong buatkan SATU ide resep masakan Indonesia yang lezat, hemat, dan mudah dibuat menggunakan bahan tersebut. Sertakan nama masakan dan cara masak singkat. Jawab dalam Bahasa Indonesia. JANGAN gunakan format tabel atau heading markdown (#).`;
    const response = await callGeminiAPI(prompt);
    setRecipe(response);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 h-full flex flex-col">
      <div className="flex items-center mb-4 text-blue-600">
        <ChefHat className="w-6 h-6 mr-2" />
        <h3 className="text-xl font-bold">Smart Chef AI</h3>
      </div>
      <div className="space-y-4 flex-grow">
        <p className="text-gray-600 text-sm">Punya bahan sisa di kulkas? Masukkan di sini, biarkan AI yang memikirkan menunya.</p>
        
        <textarea 
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
            rows="3"
            placeholder="Contoh: Telur, tempe, wortel, sisa ayam goreng..."
        ></textarea>

        <button 
            onClick={generateRecipe} 
            disabled={loading || !ingredients}
            className={`w-full flex items-center justify-center py-2 rounded-md font-medium text-white transition-all ${!ingredients ? 'bg-gray-400' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-md'}`}
        >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 mr-2" /> Buatkan Resep</>}
        </button>

        {recipe && (
             <div className="bg-orange-50 p-4 rounded-md border border-orange-100 animate-fade-in-up max-h-60 overflow-y-auto">
                <AIResponseRenderer text={recipe} />
            </div>
        )}
      </div>
    </div>
  );
};

// --- PRODUCT & CHECKOUT (Updated with Robust Image Support) ---
const ProductCard = ({ product, onBuy }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="h-48 bg-blue-100 flex items-center justify-center overflow-hidden relative">
        {/* Render Gambar: Cek jika ada property image dan belum error */}
        {product.image && !imgError ? (
          <img 
            src={`./images/${product.image}`} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null; // Mencegah loop infinite
              setImgError(true); // Ganti state jadi error agar fallback muncul
            }}
          />
        ) : (
          /* Fallback jika gambar error/tidak ada */
          <div className="flex flex-col items-center justify-center text-blue-300">
             <Calendar className="w-16 h-16 mb-2 opacity-60" />
             <span className="text-xs font-medium uppercase tracking-wide">Preview Image</span>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full uppercase tracking-wide">
            {product.category}
          </span>
          <span className="text-lg font-bold text-blue-900">
            Rp {product.price.toLocaleString()}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow">{product.description}</p>
        <ul className="mb-6 space-y-2">
          {product.features.slice(0, 3).map((feat, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              {feat}
            </li>
          ))}
        </ul>
        <button 
          onClick={() => onBuy(product)}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Beli Sekarang
        </button>
      </div>
    </div>
  );
};

const CheckoutModal = ({ product, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const handleConfirm = () => {
    const phone = "6281234567890";
    const message = `Halo HomeyTips, saya ingin membeli template: *${product.title}* seharga Rp ${product.price.toLocaleString()}. \n\nNama: ${name}\nEmail: ${email}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900">Detail Pesanan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="mb-6 bg-blue-50 p-4 rounded-md flex items-start">
            <ShoppingBag className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
                <p className="font-semibold text-blue-900">{product.title}</p>
                <p className="text-sm text-blue-700">Rp {product.price.toLocaleString()}</p>
            </div>
        </div>
        <div className="space-y-4 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Email (untuk pengiriman file)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 p-2" />
            </div>
        </div>
        <button 
            onClick={handleConfirm}
            disabled={!name || !email}
            className={`w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${(!name || !email) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
            <MessageCircle className="w-5 h-5 mr-2" />
            Beli via WhatsApp
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [currentView, setView] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const prodRes = await fetch('./data/products.json');
        if (!prodRes.ok) throw new Error('Network response was not ok');
        const prodData = await prodRes.json();
        const testiRes = await fetch('./data/testimonials.json');
        const testiData = await testiRes.json();
        setProducts(prodData);
        setTestimonials(testiData);
      } catch (error) {
        console.warn("Menggunakan data fallback karena fetch gagal:", error);
        setProducts([
            { id: 1, title: "Template Keuangan (Demo)", price: 49000, category: "Finance", description: "Deskripsi placeholder saat offline.", features: ["Fitur A"], image: "financial-sheet" },
            { id: 2, title: "Meal Prep (Demo)", price: 29000, category: "Food", description: "Deskripsi placeholder saat offline.", features: ["Fitur B"], image: "meal-sheet" },
            { id: 3, title: "Umrah Planner (Demo)", price: 35000, category: "Travel", description: "Deskripsi placeholder saat offline.", features: ["Fitur C"], image: "umrah-sheet" }
        ]);
        setTestimonials([
             { id: 1, name: "User Demo", role: "Pengunjung", text: "Konten gagal dimuat dari JSON, menampilkan data demo.", rating: 5 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-blue-600">
                <Loader className="w-12 h-12 animate-spin mb-4" />
                <p>Memuat Data...</p>
            </div>
        );
    }

    switch(currentView) {
      case 'home':
        return (
          <>
            <Hero setView={setView} />
            <div className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-extrabold text-blue-900">AI Smart Tools</h2>
                  <p className="mt-4 text-gray-500">Bukan sekadar kalkulator biasa. Ditenagai AI untuk saran yang lebih personal.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FinancialTool />
                  <UmrahTool />
                  <MealTool />
                </div>
                <div className="text-center mt-10">
                    <button onClick={() => setView('tools')} className="text-blue-600 font-semibold hover:text-blue-800 flex items-center justify-center mx-auto">
                        Lihat Semua Tools <ChevronRight className="w-4 h-4 ml-1"/>
                    </button>
                </div>
              </div>
            </div>

            <div className="py-12 bg-blue-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-extrabold text-blue-900">Template Premium</h2>
                  <p className="mt-4 text-gray-500">Upgrade produktivitas Anda dengan template siap pakai.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {products.slice(0,3).map(product => (
                    <ProductCard key={product.id} product={product} onBuy={setSelectedProduct} />
                  ))}
                </div>
                 <div className="text-center mt-10">
                    <button onClick={() => setView('products')} className="text-blue-600 font-semibold hover:text-blue-800 flex items-center justify-center mx-auto">
                        Lihat Katalog Lengkap <ChevronRight className="w-4 h-4 ml-1"/>
                    </button>
                </div>
              </div>
            </div>
            
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-center text-blue-900 mb-12">Kata Mereka</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map(testi => (
                            <div key={testi.id} className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                                <div className="flex text-yellow-400 mb-2">
                                    {[...Array(testi.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-gray-600 italic mb-4">"{testi.text}"</p>
                                <div>
                                    <p className="font-bold text-gray-900">{testi.name}</p>
                                    <p className="text-xs text-gray-500">{testi.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </>
        );
      case 'tools':
        return (
          <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
             <h2 className="text-3xl font-bold text-blue-900 mb-8 text-center">Tools Perencanaan AI</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FinancialTool />
                <UmrahTool />
                <MealTool />
             </div>
          </div>
        );
      case 'products':
        return (
          <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
            <h2 className="text-3xl font-bold text-blue-900 mb-4 text-center">Katalog Template</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {products.map(product => (
                  <ProductCard key={product.id} product={product} onBuy={setSelectedProduct} />
               ))}
            </div>
          </div>
        );
        case 'testimonials':
            return (
                <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
                    <h2 className="text-3xl font-bold text-blue-900 mb-12 text-center">Pengalaman Pengguna</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {testimonials.map(testi => (
                            <div key={testi.id} className="bg-white shadow-lg p-8 rounded-xl border-l-4 border-blue-500">
                                <div className="flex items-center mb-4">
                                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                                        {testi.name.charAt(0)}
                                     </div>
                                     <div>
                                        <p className="font-bold text-gray-900 text-lg">{testi.name}</p>
                                        <p className="text-sm text-blue-600">{testi.role}</p>
                                     </div>
                                </div>
                                <div className="flex text-yellow-400 mb-4">
                                    {[...Array(testi.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                </div>
                                <p className="text-gray-700 text-lg leading-relaxed">"{testi.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      <Styles />
      <Header 
        currentView={currentView} 
        setView={setView} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <main>{renderContent()}</main>
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <div className="flex items-center mb-4">
                        <Home className="w-6 h-6 mr-2" />
                        <span className="font-bold text-xl">HomeyTips</span>
                    </div>
                    <p className="text-blue-200 text-sm">
                        Membantu keluarga Indonesia merencanakan masa depan dengan lebih baik melalui tools digital sederhana dan AI.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-lg">Menu</h4>
                    <ul className="space-y-2 text-blue-200 text-sm">
                        <li><button onClick={() => setView('tools')} className="hover:text-white">Smart Tools</button></li>
                        <li><button onClick={() => setView('products')} className="hover:text-white">Template Excel</button></li>
                        <li><button onClick={() => setView('testimonials')} className="hover:text-white">Testimoni</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 text-lg">Hubungi Kami</h4>
                    <div className="flex space-x-4 mb-4">
                        <a href="#" className="text-blue-200 hover:text-white"><Instagram className="w-5 h-5"/></a>
                        <a href="#" className="text-blue-200 hover:text-white"><MessageCircle className="w-5 h-5"/></a>
                        <a href="#" className="text-blue-200 hover:text-white"><Github className="w-5 h-5"/></a>
                    </div>
                    <p className="text-xs text-blue-400">&copy; 2024 HomeyTips. All rights reserved.</p>
                </div>
            </div>
        </div>
      </footer>
      {selectedProduct && (
        <CheckoutModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

export default App;