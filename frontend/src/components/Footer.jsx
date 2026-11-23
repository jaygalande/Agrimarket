import { Link, useLocation } from "react-router-dom";
import { Mail, Sprout } from "lucide-react";

const Footer = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const userRole = localStorage.getItem("role")?.toLowerCase();
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    return (
        <footer className="w-full mt-6 sm:mt-12 border-t border-slate-800 bg-slate-950">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center">
                                <Sprout className="h-4 w-4 text-emerald-400" />
                            </div>

                            <span className="text-base sm:text-lg font-black bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent tracking-tight leading-tight">
                                AgriMarket
                            </span>
                        </div>

                        <p className="mt-3 text-slate-400 leading-relaxed text-xs sm:text-sm">
                            Connecting farmers and customers through technology,
                            creating a transparent and efficient agricultural
                            marketplace.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-2 text-xs sm:text-sm font-bold">

                        <Link
                            to="/home"
                            className={`block pl-2 border-l-2 transition-all duration-300 ${
                                isActive("/home")
                                    ? "border-emerald-400 text-emerald-400"
                                    : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                            }`}
                        >
                            Home
                        </Link>

                        <Link
                            to="/customer/marketplace"
                            className={`block pl-2 border-l-2 transition-all duration-300 ${
                                location.pathname.startsWith("/customer")
                                    ? "border-emerald-400 text-emerald-400"
                                    : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                            }`}
                        >
                            Marketplace
                        </Link>

                        {isLoggedIn && userRole === "farmer" && (
                            <Link
                                to="/farmer/dashboard"
                                className={`block pl-2 border-l-2 transition-all duration-300 ${
                                    location.pathname.startsWith("/farmer")
                                        ? "border-emerald-400 text-emerald-400"
                                        : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                                }`}
                            >
                                Farmer Dashboard
                            </Link>
                        )}

                        {isLoggedIn && userRole === "admin" && (
                            <Link
                                to="/admin/dashboard"
                                className={`block pl-2 border-l-2 transition-all duration-300 ${
                                    location.pathname.startsWith("/admin")
                                        ? "border-emerald-400 text-emerald-400"
                                        : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                                }`}
                            >
                                Admin Dashboard
                            </Link>
                        )}

                        <Link
                            to="/login"
                            className={`block pl-2 border-l-2 transition-all duration-300 ${
                                isActive("/login")
                                    ? "border-emerald-400 text-emerald-400"
                                    : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                            }`}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className={`block pl-2 border-l-2 transition-all duration-300 ${
                                isActive("/register")
                                    ? "border-emerald-400 text-emerald-400"
                                    : "border-transparent text-slate-400 hover:text-emerald-500 hover:border-emerald-500"
                            }`}
                        >
                            Register
                        </Link>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider mb-3 text-slate-200">
                            Contact
                        </h3>

                        <div className="space-y-2 text-slate-400 text-xs sm:text-sm font-medium">
                            <a
                                href="mailto:jay@gmail.com"
                                className="flex items-center gap-2 hover:text-emerald-400 transition"
                            >
                                <Mail className="w-3.5 h-3.5" />
                                jay@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Sub-footer */}
                <div className="mt-8 pt-4 border-t border-slate-900 flex flex-col lg:flex-row justify-between items-center gap-2 text-center text-xs text-slate-400 font-medium">
                    <p>
                        © {new Date().getFullYear()} AgriMarket.
                    </p>

                    <p className="text-slate-600">
                        Found an issue? Feel free to get in touch.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;