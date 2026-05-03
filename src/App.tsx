import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Lottie from 'lottie-react';
import { 
  ShoppingBag, 
  PlusCircle, 
  History, 
  Building2, 
  Menu, 
  X, 
  LogOut, 
  TrendingUp,
  LayoutDashboard,
  User,
  Phone,
  Search,
  MapPin,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';

// --- Components ---

function NavItem({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-white/20 text-white font-bold' 
          : 'text-emerald-100 hover:bg-white/10'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { logout, profit, userRole } = useApp();
  
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-64 bg-emerald-600 shadow-2xl z-50 p-6 flex flex-col gap-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl w-full">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-inner">
                  {userRole === 'clinic' ? '🏥' : '🐾'}
                </div>
                <span className="text-white font-bold text-lg">
                  {userRole === 'clinic' ? 'لوحة العيادة' : 'متجر البيطرة'}
                </span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 text-white rounded-full transition-colors lg:hidden mr-2">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex flex-col gap-2">
              <NavItem to="/" icon={LayoutDashboard} label="الرئيسية" onClick={onClose} />
              {userRole === 'clinic' ? (
                <>
                  <NavItem to="/orders" icon={History} label="سجل المبيعات" onClick={onClose} />
                  <NavItem to="/add-product" icon={PlusCircle} label="إضافة منتج" onClick={onClose} />
                </>
              ) : (
                <>
                  <NavItem to="/cart" icon={ShoppingBag} label="سلة المشتريات" onClick={onClose} />
                  <NavItem to="/clinics" icon={Building2} label="العيادات" onClick={onClose} />
                </>
              )}
            </nav>
            
            <div className="mt-auto space-y-4">
              {userRole === 'clinic' && (
                <div className="bg-emerald-700/50 p-4 rounded-2xl border border-emerald-400/30 text-right">
                  <p className="text-emerald-200 text-xs mb-1">الأرباح الحالية</p>
                  <p className="text-white text-2xl font-black">{profit.toLocaleString()} <span className="text-sm font-normal">د.ع</span></p>
                </div>
              )}
              
              <button
                onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/10 transition-all duration-200 font-medium"
              >
                <LogOut size={20} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartPage() {
  const { cart, removeFromCart, clearCart, addOrder } = useApp();
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const fee = 250;
  const itemsSum = cart.reduce((sum, item) => sum + item.price, 0);
  const deliverySum = cart.reduce((sum, item) => sum + (item.deliveryFee || 0), 0);
  const total = itemsSum + fee + deliverySum;

  const handlePlaceOrder = () => {
    cart.forEach(item => addOrder(item));
    setShowConfirmation(true);
    clearCart();
  };

  if (cart.length === 0 && !showConfirmation) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center text-6xl shadow-inner">🛒</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-emerald-900">سلة التسوق فارغة</h2>
          <p className="text-emerald-600/60 font-medium">ابدأ بإضافة المنتجات التي تحبها إلى سلتك</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          اكتشف المنتجات
        </button>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 bg-white rounded-[3rem] p-10 border border-emerald-100 shadow-xl"
      >
        <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-6xl animate-bounce">
          ✅
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-emerald-900">تم الطلب بنجاح!</h2>
          <p className="text-emerald-700 font-bold text-lg">سيتم الدفع وتأكيد الطلب عبر (Ki Card) </p>
          <p className="text-emerald-600/60 font-medium italic">نشكرك على ثقتك بمتجرنا</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all text-lg"
        >
          العودة للرئيسية
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-emerald-900">سلة الطلبات 🛒</h2>
        <button onClick={clearCart} className="text-emerald-400 hover:text-red-500 font-bold text-sm transition-colors">مسح السلة</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => (
            <motion.div 
              layout
              key={`${item.id}-${idx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-5 rounded-3xl border border-emerald-50 shadow-sm flex items-center gap-5 flex-row-reverse"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl overflow-hidden flex items-center justify-center text-3xl">
                {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : '📦'}
              </div>
              <div className="flex-1 text-right">
                <h4 className="font-bold text-emerald-900 text-lg">{item.name}</h4>
                <p className="text-emerald-500 font-black font-mono">{item.price.toLocaleString()} د.ع</p>
                <p className="text-[10px] text-emerald-400 mt-1">توصيل: {item.deliveryFee || 0} د.ع</p>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-emerald-300 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-6 sticky top-24">
            <h3 className="text-2xl font-bold border-b border-emerald-800 pb-4 text-center">ملخص الطلب</h3>
            
            <div className="space-y-4 text-right">
              <div className="flex justify-between items-center flex-row-reverse">
                <span className="text-emerald-200">سعر المنتجات</span>
                <span className="font-black font-mono">{itemsSum.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between items-center flex-row-reverse">
                <span className="text-emerald-200">عمولة التطبيق</span>
                <span className="font-black font-mono">{fee.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between items-center flex-row-reverse">
                <span className="text-emerald-200">سعر التوصيل</span>
                <span className="font-black font-mono">{deliverySum.toLocaleString()} د.ع</span>
              </div>
              <div className="pt-6 border-t border-emerald-800 flex justify-between items-center flex-row-reverse">
                <span className="text-xl font-black">المجموع الكلي</span>
                <span className="text-3xl font-black text-orange-400 font-mono">{total.toLocaleString()} د.ع</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-emerald-950 active:scale-95 text-lg flex items-center justify-center gap-3"
            >
              <span>تأكيد الطلب (Ki Card) 💳</span>
            </button>
            <p className="text-[10px] text-emerald-400 text-center italic opacity-60">سيتم توجيهك لبوابة الدفع الآمنة</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { cart, userRole } = useApp();
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageTitles: Record<string, string> = {
    '/': 'الرئيسية',
    '/orders': 'سجل الطلبات',
    '/cart': 'سلة المشتريات',
    '/clinics': 'دليل العيادات',
    '/add-product': 'إضافة منتج'
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-row-reverse overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col lg:mr-64 transition-all duration-300 h-screen overflow-y-auto">
        <header className="h-20 bg-white border-b border-emerald-100 flex items-center px-4 lg:px-8 shadow-sm justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-row-reverse">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl lg:text-2xl font-black text-emerald-900">{pageTitles[location.pathname] || 'المتجر'}</h1>
          </div>
          
          <div className="flex items-center gap-4 flex-row-reverse">
            {userRole === 'clinic' ? (
              <Link 
                to="/add-product"
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-orange-200 transition-all flex items-center gap-2"
              >
                <PlusCircle size={18} />
                <span className="hidden sm:inline">إضافة منتج</span>
              </Link>
            ) : (
              <Link 
                to="/cart"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 relative"
              >
                <ShoppingBag size={18} />
                <span className="hidden sm:inline">سلة الطلبات</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}
            <div className="w-10 h-10 bg-emerald-200 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-700">
              <User size={20} />
            </div>
          </div>
        </header>
        
        <div className="p-6 lg:p-8 flex-1" dir="rtl">
          {children}
        </div>
      </main>
    </div>
  );
}

// --- Pages ---

function LoginPage() {
  const { login, registerClinic, checkClinicStatus } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<'user' | 'clinic'>('user');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [clinicCode, setClinicCode] = useState('');
  const [clinicImage, setClinicImage] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'denied' | 'none'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (role === 'clinic') {
      // 1. Check clinic code
      if (clinicCode !== '10320') {
        setErrorMsg('كود العيادة غير صحيح ❌');
        return;
      }

      // 2. Check if already registered and approved
      const currentStatus = await checkClinicStatus(phone);
      
      if (currentStatus === 'none') {
        // Registering for the first time
        if (!clinicImage) {
          setErrorMsg('يجب رفع صورة العيادة ❌');
          return;
        }
        await registerClinic({ name, phone, address, clinicCode, clinicImage });
        setStatus('pending');
        return;
      }

      if (currentStatus === 'pending') {
        setStatus('pending');
        return;
      }

      if (currentStatus !== 'approved') {
        setErrorMsg('حسابك قيد المراجعة أو مرفوض ❌');
        return;
      }
    }

    // Normal login for user or approved clinic
    try {
      await login(role, role === 'user' ? { name, phone, address } : { name, phone, address });
      navigate('/');
    } catch (error) {
      setErrorMsg('فشل تسجيل الدخول ❌');
    }
  };

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-200 to-white p-6 text-center" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white p-12 rounded-[3rem] shadow-2xl space-y-8"
        >
          <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <ShieldAlert size={48} />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-emerald-900">تم إرسال الطلب بنجاح ✅</h2>
            <p className="text-emerald-700 font-bold text-lg">طلبك قيد المراجعة حالياً من قبل الإدارة.</p>
            <p className="text-emerald-600/60 font-medium">سيتم تفعيل حسابك فور التأكد من التفاصيل.</p>
          </div>
          <button 
            onClick={() => setStatus('idle')}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg"
          >
            العودة
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-200 to-white p-6" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden"
      >
        <div className="p-8 text-center bg-emerald-50/30">
          {/* 🐶🐱 انيميشن */}
          <div className="max-w-[250px] mx-auto -mb-10">
            <Lottie 
              animationData={null}
              loop={true}
              style={{ height: 200 }}
              path="https://lottie.host/79075797-0a9e-4e4b-9721-6789b782982d/XNfEqj3v1Z.json"
            />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-emerald-900">🐾 متجر الحيوانات</h1>
            <p className="text-emerald-600/70 font-bold mb-6">رفيقك الأول في عالم الحيوان</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          {/* 🧾 الحقول */}
          <div className="space-y-4">
            <div className="relative group">
              <label className="text-sm font-bold text-emerald-900 mr-2 mb-1 block">الاسم</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-12 py-4 rounded-3xl bg-white border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-right shadow-sm group-hover:shadow-md"
                  placeholder="الاسم الثلاثي..."
                />
                <User className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              </div>
            </div>

            <div className="relative group">
              <label className="text-sm font-bold text-emerald-900 mr-2 mb-1 block">رقم الهاتف</label>
              <div className="relative">
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-12 py-4 rounded-3xl bg-white border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-right shadow-sm group-hover:shadow-md"
                  placeholder="07xxxxxxxx"
                />
                <Phone className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              </div>
            </div>

            <div className="relative group">
              <label className="text-sm font-bold text-emerald-900 mr-2 mb-1 block">العنوان</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-12 py-4 rounded-3xl bg-white border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-right shadow-sm group-hover:shadow-md"
                  placeholder="مثلاً: بغداد - الكرادة"
                />
                <MapPin className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              </div>
            </div>

            {/* 👤 نوع الحساب */}
            <div className="relative group">
              <label className="text-sm font-bold text-emerald-900 mr-2 mb-1 block">نوع الحساب</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-12 py-4 rounded-3xl bg-white border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-right shadow-sm appearance-none cursor-pointer font-bold"
                >
                  <option value="user">زبون</option>
                  <option value="clinic">صاحب عيادة</option>
                </select>
                <ShieldCheck className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
              </div>
            </div>

            {role === 'clinic' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2"
              >
                <div className="relative group">
                  <label className="text-sm font-bold text-emerald-900 mr-2 mb-1 block">كود العيادة</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      value={clinicCode}
                      onChange={(e) => setClinicCode(e.target.value)}
                      className="w-full px-12 py-4 rounded-3xl bg-emerald-50 border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-right shadow-sm"
                      placeholder="أدخل كود العيادة المخصص"
                    />
                    <LayoutDashboard className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-400" size={20} />
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-sm font-bold text-emerald-900 mr-2 mb-1 block">رابط صورة العيادة</label>
                  <div className="relative">
                    <input 
                      type="url" 
                      required
                      value={clinicImage}
                      onChange={(e) => setClinicImage(e.target.value)}
                      className="w-full px-12 py-4 rounded-3xl bg-emerald-50 border border-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-right shadow-sm"
                      placeholder="https://example.com/clinic.jpg"
                    />
                    <Building2 className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-400" size={20} />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setClinicImage('https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=400')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-bold"
                  >
                    صورة تجريبية
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-center font-bold text-sm border border-red-100 animate-shake">
              {errorMsg}
            </div>
          )}

          {/* 🚀 زر الدخول */}
          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] mt-6 text-xl flex items-center justify-center gap-3"
          >
            دخول للمنصة 🚀
          </button>
          
          <p className="text-center text-[10px] text-emerald-400 font-medium opacity-60">
            بالدخول، أنت توافق على شروط الاستخدام وسياسة الخصوصية
          </p>
        </form>
      </motion.div>
    </div>
  );
}

function UserHomePage() {
  const { products, addToCart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("قطط");
  const [search, setSearch] = useState("");
  const [showToast, setShowToast] = useState(false);
  const categories = ["قطط", "كلاب", "ابقار", "اغنام"];

  const searchFilter = (items: any[]) => {
    if (!search) return items;
    const s = search.toLowerCase().replace(/\s/g, "");
    return items.filter(p => {
      const name = (p.name || "").toLowerCase().replace(/\s/g, "");
      const desc = (p.desc || "").toLowerCase().replace(/\s/g, "");
      const benefits = (p.benefits || "").toLowerCase().replace(/\s/g, "");
      const illness = (p.illness || "").toLowerCase().replace(/\s/g, "");
      return name.includes(s) || desc.includes(s) || benefits.includes(s) || illness.includes(s);
    });
  };

  const filteredProducts = searchFilter(products.filter(p => p.category === selectedCategory));

  const handleAddToCart = (product: any) => {
    addToCart(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-8 relative">
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 border border-white/20"
          >
            <span>تمت الإضافة للسلة 🛒</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h2 className="text-3xl font-black text-emerald-900">🐾 المتجر البيطري</h2>
          <p className="text-emerald-600/70 font-medium">منتجات أصلية وتوصيل سريع لباب بيتك</p>
        </div>

        <div className="relative">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 rounded-[2rem] border-none bg-emerald-50 focus:ring-2 focus:ring-emerald-500 text-right pr-14 transition-all shadow-inner"
            placeholder="🔍 ابحث عن علاج او مرض..."
          />
          <Search className="absolute top-1/2 right-6 -translate-y-1/2 text-emerald-400" size={20} />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none flex-row-reverse">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white shadow-emerald-200 scale-105' 
                  : 'bg-white text-emerald-800 border border-emerald-100 hover:bg-emerald-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div 
            layout
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-emerald-50 hover:border-emerald-200 hover:shadow-md transition-all group overflow-hidden flex flex-col"
          >
            <div className="h-48 bg-emerald-50 relative overflow-hidden flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-6xl group-hover:scale-110 transition-transform">
                  {product.category === 'قطط' ? '🐱' : product.category === 'كلاب' ? '🐶' : product.category === 'ابقار' ? '🐄' : '🐑'}
                </span>
              )}
              <div className="absolute top-4 right-4">
                <span className="bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] px-3 py-1.5 rounded-full font-black uppercase shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="mb-4 text-right">
                <h3 className="font-bold text-xl text-emerald-900 mb-2">{product.name}</h3>
                <p className="text-emerald-600/70 text-sm line-clamp-2 leading-relaxed">📄 {product.desc || 'وصف مميز للمنتج لضمان أفضل جودة'}</p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <span className="bg-emerald-50 text-emerald-600 text-[10.5px] px-2 py-0.5 rounded-md font-bold">✨ {product.benefits || 'يقوي المناعة'}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-emerald-50 flex items-center justify-between flex-row-reverse">
                <div className="text-left">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase mb-px text-left">السعر</p>
                  <p className="text-emerald-600 font-black text-2xl font-mono">{product.price.toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 text-sm"
                >
                  إضافة للسلة 🛒
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-white/50 rounded-[2.5rem] border border-dashed border-emerald-200">
            <Search className="mx-auto text-emerald-200 opacity-30" size={80} />
            <p className="text-emerald-900/40 font-bold text-lg">😕 لا توجد نتائج مطابقة لبحثك</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClinicHomePage() {
  const { products, addProduct } = useApp();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-right">
          <h2 className="text-3xl font-black text-emerald-900">🏥 لوحة العيادة</h2>
          <p className="text-emerald-600/70 font-medium">إدارة المنتجات والمبيعات الخاصة بعيادتك</p>
        </div>
        <button 
          onClick={() => navigate('/add-product')}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex flex-col gap-3">
             <div className="flex justify-between items-center flex-row-reverse">
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">{p.category}</span>
                <h3 className="font-bold text-lg text-emerald-900">{p.name}</h3>
             </div>
             <p className="text-emerald-700 font-black text-xl">{p.price.toLocaleString()} د.ع</p>
             <p className="text-xs text-emerald-500 font-medium line-clamp-1">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersPage() {
  const { orders } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-black text-emerald-900">سجل الطلبات</h2>
        <div className="bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-black shadow-lg shadow-emerald-100">
          {orders.length} طلب
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden flex flex-col md:flex-row-reverse"
          >
            <div className="p-6 flex-1 flex flex-col md:flex-row-reverse items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5 flex-row-reverse">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2.5xl flex items-center justify-center shadow-inner text-2xl">
                  📦
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-emerald-900 text-xl">{order.productName}</h4>
                  <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium mt-1">
                    <span>{order.timestamp.toLocaleTimeString('ar-IQ')}</span>
                    <span>•</span>
                    <span>{order.timestamp.toLocaleDateString('ar-IQ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto text-right border-t border-emerald-50 md:border-t-0 pt-4 md:pt-0">
                <div className="space-y-1">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">الزبون</p>
                  <p className="text-emerald-900 font-bold text-sm">👤 {order.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">رقم الهاتف</p>
                  <p className="text-emerald-900 font-bold text-sm font-mono">📞 {order.customerPhone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase">العنوان</p>
                  <p className="text-emerald-900 font-bold text-sm">📍 {order.customerAddress}</p>
                </div>
              </div>

              <div className="bg-emerald-50 px-6 py-3 rounded-2xl flex items-center justify-center min-w-[120px]">
                <span className="text-emerald-700 font-black text-xl font-mono whitespace-nowrap">{order.price.toLocaleString()} د.ع</span>
              </div>
            </div>
          </motion.div>
        ))}
        {orders.length === 0 && (
          <div className="p-20 text-center text-emerald-200 bg-white/50 rounded-[3rem] border border-dashed border-emerald-200">
            <History className="mx-auto mb-4 opacity-30" size={80} />
            <p className="font-bold text-emerald-900/30 text-lg">لا توجد طلبات واردة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddProductPage() {
  const { addProduct } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [benefits, setBenefits] = useState('');
  const [illness, setIllness] = useState('');
  const [category, setCategory] = useState("قطط");
  const [deliveryFee, setDeliveryFee] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && price) {
      addProduct({
        name,
        price: parseInt(price),
        desc,
        benefits,
        illness,
        category,
        image: imageUrl || undefined,
        deliveryFee: parseInt(deliveryFee) || 0
      });
      navigate('/');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white rounded-[3rem] p-10 border border-emerald-100 shadow-lg space-y-10">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-50">
            <PlusCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-emerald-900">إضافة منتج جديد</h2>
          <p className="text-emerald-600/60 font-medium mt-2">قم بملء تفاصيل المنتج لإدراجه في المتجر</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
            <label className="text-sm font-bold text-emerald-900 mr-2 block">اسم المنتج</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-6 py-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right"
              placeholder="مثلاً: فيتامين للطيور"
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-emerald-900 mr-2 block">رابط صورة المنتج (اختياري)</label>
            <div className="flex gap-2">
               <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-6 py-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right flex-1"
                placeholder="https://example.com/image.jpg"
              />
              <button 
                type="button"
                onClick={() => setImageUrl('https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=400')}
                className="bg-emerald-100 text-emerald-700 px-4 rounded-2xl hover:bg-emerald-200 transition-all text-xs font-bold"
              >
                صورة تجريبية
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 text-right">
              <label className="text-sm font-bold text-emerald-900 mr-2 block">السعر (د.ع)</label>
              <input 
                type="number" 
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-6 py-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right"
                placeholder="0"
              />
            </div>
            <div className="space-y-2 text-right">
              <label className="text-sm font-bold text-emerald-900 mr-2 block">سعر التوصيل (اختياري)</label>
              <input 
                type="number" 
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-6 py-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-emerald-900 mr-2 block">الفئة</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-6 py-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right appearance-none font-bold"
            >
              <option value="قطط">قطط</option>
              <option value="كلاب">كلاب</option>
              <option value="ابقار">ابقار</option>
              <option value="اغنام">اغنام</option>
            </select>
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-emerald-900 mr-2 block">وصف المنتج</label>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              className="w-full px-6 py-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right resize-none"
              placeholder="وصف مختصر لمميزات المنتج..."
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-emerald-900 mr-2 block">فوائد المنتج</label>
            <input 
              type="text" 
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="w-full px-6 py-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right"
              placeholder="مثلاً: مكمل غذائي، دواء فعال..."
            />
          </div>

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-emerald-900 mr-2 block">المرض (للطلبات البحثية)</label>
            <input 
              type="text" 
              value={illness}
              onChange={(e) => setIllness(e.target.value)}
              className="w-full px-6 py-4 rounded-[1.5rem] bg-emerald-50/50 border border-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right"
              placeholder="مثلاً: إسهال، زكام، ديدان..."
            />
          </div>

          <div className="flex gap-4 pt-6 flex-row-reverse">
            <button 
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
            >
              حفظ وتثبيت المنتج
            </button>
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="px-10 py-5 bg-emerald-100 text-emerald-700 font-black rounded-[1.5rem] hover:bg-emerald-200 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

function ClinicsPage() {
  const clinics = [
    { name: "عيادة بغداد المركزية", phone: "0770000000", location: "الكرادة، بغداد", status: "مفتوح الآن", color: "emerald" },
    { name: "عيادة ديالى البيطرية", phone: "0780000000", location: "بعقوبة، ديالى", status: "مغلق حالياً", color: "orange" },
    { name: "مركز حي أور التخصصي", phone: "0750000000", location: "حي أور، بغداد", status: "مفتوح الآن", color: "emerald" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-emerald-900">العيادات المعتمدة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clinics.map((clinic, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-white rounded-3xl p-6 border-r-4 ${clinic.color === 'emerald' ? 'border-emerald-500' : 'border-orange-400'} shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all group`}
          >
            <div className="flex items-center justify-between flex-row-reverse">
              <div className="flex items-center gap-4 flex-row-reverse">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-emerald-900 text-lg">{clinic.name}</h3>
                  <p className="text-xs text-emerald-500/70 font-medium">📍 {clinic.location}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-2 border-t border-emerald-50 pt-4 flex-row-reverse">
              <span className="text-emerald-600 font-bold italic underline text-sm">{clinic.phone}</span>
              <span className={`text-xs font-black uppercase ${clinic.color === 'emerald' ? 'text-emerald-500' : 'text-orange-500'}`}>
                {clinic.status}
              </span>
            </div>
            
            <button className="w-full mt-2 bg-emerald-50 text-emerald-700 py-3 rounded-2xl font-black hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 flex items-center justify-center gap-2">
              <Phone size={18} />
              <span>اتصال مباشر</span>
            </button>
          </motion.div>
        ))}
        
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden mt-6">
           <TrendingUp className="text-white opacity-10 absolute -left-10 -bottom-10" size={240} />
           <div className="relative z-10 space-y-6">
             <p className="text-emerald-100 text-lg font-medium opacity-80">إحصائيات اليوم</p>
             <div className="flex justify-between items-end">
               <div className="space-y-1">
                <h3 className="text-6xl font-black">12</h3>
                <p className="text-sm font-bold opacity-70">طلبات جديدة تمت معالجتها</p>
               </div>
               <div className="hidden sm:block">
                 <div className="flex gap-2 items-end">
                   <div className="w-3 h-12 bg-white/20 rounded-full"></div>
                   <div className="w-3 h-20 bg-white/40 rounded-full"></div>
                   <div className="w-3 h-16 bg-white/60 rounded-full"></div>
                   <div className="w-3 h-24 bg-white rounded-full shadow-lg shadow-white/20"></div>
                 </div>
               </div>
             </div>
             <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: '66%' }}
                 className="h-full bg-white"
               />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function MainRoutes() {
  const location = useLocation();
  const { userRole, loading } = useApp();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-600">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white text-6xl"
        >
          🐾
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            {userRole === 'clinic' ? <ClinicHomePage /> : <UserHomePage />}
          </ProtectedRoute>
        } />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/clinics" element={<ProtectedRoute><ClinicsPage /></ProtectedRoute>} />
        <Route path="/add-product" element={<ProtectedRoute><AddProductPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
