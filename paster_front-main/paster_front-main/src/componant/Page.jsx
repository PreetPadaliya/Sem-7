import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Usercontext } from "./UsrProvider";
import { CodeComponent } from "./Home";
import QRCode from "react-qr-code";
import axios from "axios";
import { BiUpvote, BiSolidUpvote } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import {
  Home,
  Copy,
  QrCode,
  Palette,
  Code,
  X,
  Share2,
  Download,
  Bookmark,
  Heart,
  MessageCircle,
  Eye,
  Calendar,
  User,
  Clock,
  Hash,
  Layers,
  ChevronDown,
  Settings,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  RotateCcw,
  Star,
  Flag,
  ExternalLink,
  FileText,
  Zap,
  Shield,
  Globe,
  Activity,
  TrendingUp,
  Users,
  GitBranch,
  Terminal,
  Sparkles,
  Save,
  Trash2,
  Edit,
  Plus,
  Tag,
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const languages = [
  "oneC",
  "abnf",
  "accesslog",
  "actionscript",
  "ada",
  "angelscript",
  "apache",
  "applescript",
  "arcade",
  "arduino",
  "armasm",
  "asciidoc",
  "aspectj",
  "autohotkey",
  "autoit",
  "avrasm",
  "awk",
  "axapta",
  "bash",
  "basic",
  "bnf",
  "brainfuck",
  "c-like",
  "c",
  "cal",
  "capnproto",
  "ceylon",
  "clean",
  "clojure-repl",
  "clojure",
  "cmake",
  "coffeescript",
  "coq",
  "cos",
  "cpp",
  "crmsh",
  "crystal",
  "csharp",
  "csp",
  "css",
  "d",
  "dart",
  "delphi",
  "diff",
  "django",
  "dns",
  "dockerfile",
  "dos",
  "dsconfig",
  "dts",
  "dust",
  "ebnf",
  "elixir",
  "elm",
  "erb",
  "erlang-repl",
  "erlang",
  "excel",
  "fix",
  "flix",
  "fortran",
  "fsharp",
  "gams",
  "gauss",
  "gcode",
  "gherkin",
  "glsl",
  "gml",
  "go",
  "golo",
  "gradle",
  "groovy",
  "haml",
  "handlebars",
  "haskell",
  "haxe",
  "hsp",
  "htmlbars",
  "http",
  "hy",
  "inform7",
  "ini",
  "irpf90",
  "isbl",
  "java",
  "javascript",
  "jboss-cli",
  "json",
  "julia-repl",
  "julia",
  "kotlin",
  "lasso",
  "latex",
  "ldif",
  "leaf",
  "less",
  "lisp",
  "livecodeserver",
  "livescript",
  "llvm",
  "lsl",
  "lua",
  "makefile",
  "markdown",
  "mathematica",
  "matlab",
  "maxima",
  "mel",
  "mercury",
  "mipsasm",
  "mizar",
  "mojolicious",
  "monkey",
  "moonscript",
  "n1ql",
  "nginx",
  "nim",
  "nix",
  "node-repl",
  "nsis",
  "objectivec",
  "ocaml",
  "openscad",
  "oxygene",
  "parser3",
  "perl",
  "pf",
  "pgsql",
  "php-template",
  "php",
  "plaintext",
  "pony",
  "powershell",
  "processing",
  "profile",
  "prolog",
  "properties",
  "protobuf",
  "puppet",
  "purebasic",
  "python-repl",
  "python",
  "q",
  "qml",
  "r",
  "reasonml",
  "rib",
  "roboconf",
  "routeros",
  "rsl",
  "ruby",
  "ruleslanguage",
  "rust",
  "sas",
  "scala",
  "scheme",
  "scilab",
  "scss",
  "shell",
  "smali",
  "smalltalk",
  "sml",
  "sqf",
  "sql",
  "sql_more",
  "stan",
  "stata",
  "step21",
  "stylus",
  "subunit",
  "swift",
  "taggerscript",
  "tap",
  "tcl",
  "thrift",
  "tp",
  "twig",
  "typescript",
  "vala",
  "vbnet",
  "vbscript-html",
  "vbscript",
  "verilog",
  "vhdl",
  "vim",
  "x86asm",
  "xl",
  "xml",
  "xquery",
  "yaml",
  "zephir",
];

const styles = [
  "a11yDark",
  "a11yLight",
  "agate",
  "anOldHope",
  "androidstudio",
  "arduinoLight",
  "arta",
  "ascetic",
  "atelierCaveDark",
  "atelierCaveLight",
  "atelierDuneDark",
  "atelierDuneLight",
  "atelierEstuaryDark",
  "atelierEstuaryLight",
  "atelierForestDark",
  "atelierForestLight",
  "atelierHeathDark",
  "atelierHeathLight",
  "atelierLakesideDark",
  "atelierLakesideLight",
  "atelierPlateauDark",
  "atelierPlateauLight",
  "atelierSavannaDark",
  "atelierSavannaLight",
  "atelierSeasideDark",
  "atelierSeasideLight",
  "atelierSulphurpoolDark",
  "atelierSulphurpoolLight",
  "atomOneDarkReasonable",
  "atomOneDark",
  "atomOneLight",
  "brownPaper",
  "codepenEmbed",
  "colorBrewer",
  "darcula",
  "dark",
  "defaultStyle",
  "docco",
  "dracula",
  "far",
  "foundation",
  "githubGist",
  "github",
  "gml",
  "googlecode",
  "gradientDark",
  "gradientLight",
  "grayscale",
  "gruvboxDark",
  "gruvboxLight",
  "hopscotch",
  "hybrid",
  "idea",
  "irBlack",
  "isblEditorDark",
  "isblEditorLight",
  "kimbieDark",
  "kimbieLight",
  "lightfair",
  "lioshi",
  "magula",
  "monoBlue",
  "monokaiSublime",
  "monokai",
  "nightOwl",
  "nnfxDark",
  "nnfx",
  "nord",
  "obsidian",
  "ocean",
  "paraisoDark",
  "paraisoLight",
  "pojoaque",
  "purebasic",
  "qtcreatorDark",
  "qtcreatorLight",
  "railscasts",
  "rainbow",
  "routeros",
  "schoolBook",
  "shadesOfPurple",
  "solarizedDark",
  "solarizedLight",
  "srcery",
  "stackoverflowDark",
  "stackoverflowLight",
  "sunburst",
  "tomorrowNightBlue",
  "tomorrowNightBright",
  "tomorrowNightEighties",
  "tomorrowNight",
  "tomorrow",
  "vs",
  "vs2015",
  "xcode",
  "xt256",
  "zenburn",
];

const API_URL = import.meta.env.VITE_API_URL;

const ActionButton = ({
  onClick,
  icon: Icon,
  label,
  variant = "default",
  disabled = false,
}) => {
  const variants = {
    default:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    purple: "bg-purple-600 text-white hover:bg-purple-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md
        ${variants[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const StatCard = ({ icon: Icon, label, value, color = "blue" }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    red: "from-red-500 to-red-600",
    yellow: "from-yellow-500 to-yellow-600",
  };

  return (
    <div
      className={`bg-gradient-to-r ${colors[color]} p-4 rounded-xl text-white`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const { user } = useContext(Usercontext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [upvotecount, setUpvotecount] = useState(0);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [style, setStyle] = useState("atomOneDark");
  const [title, setTitle] = useState("New Document");
  const [showQr, setShowQr] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [is_upvoted, setIsUpvoted] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("darkMode") === "true"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [views, setViews] = useState(1247);
  const [comments, setComments] = useState(23);
  const [shares, setShares] = useState(45);
  const [author, setAuthor] = useState({ name: "Anonymous", avatar: "" });
  const [createdAt, setCreatedAt] = useState(new Date());
  const [tags, setTags] = useState(["javascript", "frontend", "react"]);
  const [description, setDescription] = useState("");
  const [lineNumbers, setLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLanguage, setEditLanguage] = useState("javascript");
  const [editTags, setEditTags] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    fetchUpvotedata();
  }, [id]);

  async function fetchUpvotedata() {
    try {
      const res = await axios.get(
        `${API_URL}/post/upvotes/data/${Number(id)}`,
        { withCredentials: true }
      );
      const { upvotecount, userupvote } = res.data;
      setIsUpvoted(userupvote);
      setUpvotecount(upvotecount);
    } catch (error) {
      console.error(error);
    }
  }

  async function upvote() {
    try {
      const res = await axios.post(
        `${API_URL}/post/upvote`,
        {
          postId: Number(id),
          userId: Number(user.id),
        },
        { withCredentials: true }
      );
      if (res.data.message === "Upvoted") {
        setIsUpvoted(true);
        setUpvotecount((prev) => prev + 1);
      } else {
        setIsUpvoted(false);
        setUpvotecount((prev) => prev - 1);
      }
      toast.success(
        res.data.message === "Upvoted" ? "Upvoted! ⬆️" : "Vote removed"
      );
    } catch (error) {
      toast.error("Failed to vote");
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchNote = async () => {
    try {
      const res = await axios.get(`${API_URL}/post/${id}`, {
        withCredentials: true,
      });

      if (res.data.message) {
        navigate("/home");
      } else {
        setTitle(res.data.title || "Untitled");
        setText(res.data.content || "");
        setLanguage(res.data.language || "javascript");
        setDescription(res.data.description || "");
        setTags(res.data.tags || []);
        setViews(res.data.views || 0);
        setCreatedAt(new Date(res.data.createdAt));

        // Set author information if available
        if (res.data.author) {
          setAuthor({
            name:
              res.data.author.name || res.data.author.username || "Anonymous",
            avatar: res.data.author.avatar || "",
          });
        }

        // Check if current user is the owner
        if (user && res.data.authorId === user.id) {
          setIsOwner(true);
        }

        // Initialize edit form with current values
        setEditTitle(res.data.title || "Untitled");
        setEditContent(res.data.content || "");
        setEditDescription(res.data.description || "");
        setEditLanguage(res.data.language || "javascript");
        setEditTags(res.data.tags || []);
      }
    } catch (error) {
      toast.error("Note not found", { icon: "📋" });
      navigate("/home");
    }
  };

  useEffect(() => {
    fetchNote();
  }, [id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard! 📋");
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, "_")}.${language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("File downloaded! 📥");
  };

  const shareNote = async () => {
    const url = `${window.location.origin}/page/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
        setShares((prev) => prev + 1);
        toast.success("Shared successfully! 🚀");
      } catch (error) {
        if (error.name !== "AbortError") {
          navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard! 📋");
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard! 📋");
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(
      isBookmarked ? "Removed from bookmarks" : "Added to bookmarks! ⭐"
    );
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Like removed" : "Liked! ❤️");
  };

  const reportNote = () => {
    toast.info(
      "Report submitted. Thank you for keeping our community safe! 🛡️"
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset edit form to original values
    setEditTitle(title);
    setEditContent(text);
    setEditDescription(description);
    setEditLanguage(language);
    setEditTags(tags);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const res = await axios.put(
        `${API_URL}/post/${id}`,
        {
          title: editTitle,
          content: editContent,
          description: editDescription,
          language: editLanguage,
          tags: editTags,
        },
        { withCredentials: true }
      );

      // Update the display with new values
      setTitle(editTitle);
      setText(editContent);
      setDescription(editDescription);
      setLanguage(editLanguage);
      setTags(editTags);

      setIsEditing(false);
      toast.success("Note updated successfully! 📝");
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403) {
        toast.error("You are not authorized to edit this note");
      } else if (error.response?.status === 404) {
        toast.error("Note not found");
      } else {
        toast.error("Failed to update note");
      }
    }
  };

  const handleDeleteNote = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/post/${id}`, {
        withCredentials: true,
        data: {
          userId: user.id,
          single_post: { authorId: user.id },
        },
      });

      toast.success("Note deleted successfully");
      navigate("/home");
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403 || error.response?.status === 401) {
        toast.error("You are not authorized to delete this note");
      } else {
        toast.error("Failed to delete note");
      }
    }
  };

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: "bg-yellow-100 text-yellow-800 border-yellow-200",
      python: "bg-blue-100 text-blue-800 border-blue-200",
      java: "bg-red-100 text-red-800 border-red-200",
      cpp: "bg-purple-100 text-purple-800 border-purple-200",
      css: "bg-pink-100 text-pink-800 border-pink-200",
      html: "bg-orange-100 text-orange-800 border-orange-200",
      typescript: "bg-indigo-100 text-indigo-800 border-indigo-200",
      default: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[lang] || colors.default;
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900"
          : "bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header
          className={`${
            darkMode
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white/80 border-gray-200"
          } backdrop-blur-xl rounded-2xl border shadow-xl mb-6 `}
        >
          <div className="p-6">
            <div className="flex flex-col  lg:flex-row gap-4">
              <div className="flex flex-wrap ">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <Link to="/home">
                    <ActionButton icon={Home} label="Home" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <div>
                      <h1
                        className={`text-2xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {title}
                      </h1>
                      {description && (
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User
                      className={`w-4 h-4 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {author.name}
                    </span>
                  </div>

                  <div className="flex  items-center gap-2">
                    <Calendar
                      className={`w-4 h-4 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      {createdAt.toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getLanguageColor(
                      language
                    )}`}
                  >
                    {language}
                  </span>

                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 rounded-md text-xs ${
                        darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isOwner && !isEditing && (
                  <>
                    <ActionButton
                      onClick={handleEdit}
                      icon={Code}
                      label="Edit"
                      variant="purple"
                    />
                    <ActionButton
                      onClick={handleDeleteNote}
                      icon={Trash2}
                      label="Delete"
                      variant="danger"
                    />
                  </>
                )}

                {isEditing && (
                  <>
                    <ActionButton
                      onClick={handleSaveEdit}
                      icon={Save}
                      label="Save"
                      variant="success"
                    />
                    <ActionButton
                      onClick={handleCancelEdit}
                      icon={X}
                      label="Cancel"
                      variant="danger"
                    />
                  </>
                )}

                {!isEditing && (
                  <>
                    <ActionButton
                      onClick={copyToClipboard}
                      icon={Copy}
                      label="Copy"
                      variant="primary"
                    />

                    <ActionButton
                      onClick={downloadCode}
                      icon={Download}
                      label="Download"
                      variant="success"
                    />

                    <ActionButton
                      onClick={shareNote}
                      icon={Share2}
                      label="Share"
                    />

                    <ActionButton
                      onClick={() => setShowSettings(!showSettings)}
                      icon={showSettings ? X : Settings}
                      label="Settings"
                    />

                    <ActionButton
                      onClick={() => setShowQr(!showQr)}
                      icon={showQr ? X : QrCode}
                      label="QR Code"
                    />
                  </>
                )}

                <ActionButton
                  onClick={() => setDarkMode(!darkMode)}
                  icon={darkMode ? Sun : Moon}
                  label="Theme"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {showSettings && (
            <div className="xl:col-span-1">
              <div
                className={`${
                  darkMode
                    ? "bg-gray-800/50 border-gray-700"
                    : "bg-white/80 border-gray-200"
                } backdrop-blur-xl rounded-2xl border shadow-xl p-6 space-y-6`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Palette
                    className={`w-5 h-5 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <h2
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Editor Settings
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-all ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-blue-500/20`}
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Theme
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-all ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } focus:ring-2 focus:ring-blue-500/20`}
                    >
                      {styles.map((sty) => (
                        <option key={sty} value={sty}>
                          {sty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lineNumbers}
                        onChange={(e) => setLineNumbers(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Show line numbers
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wordWrap}
                        onChange={(e) => setWordWrap(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Word wrap
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-4 h-4" />
                      ) : (
                        <Maximize2 className="w-4 h-4" />
                      )}
                      {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className={`${showSettings ? "xl:col-span-3" : "xl:col-span-4"}`}
          >
            <div
              className={`${
                darkMode
                  ? "bg-gray-800/50 border-gray-700"
                  : "bg-white/80 border-gray-200"
              } backdrop-blur-xl rounded-2xl border shadow-xl overflow-hidden ${
                isFullscreen ? "fixed inset-4 z-50" : ""
              }`}
            >
              <div
                className={`p-4 border-b ${
                  darkMode
                    ? "border-gray-700 bg-gray-800/30"
                    : "border-gray-200 bg-gray-50/50"
                } flex flex-wrap items-center justify-between`}
              >
                <div className="flex items-center flex-wrap gap-3">
                  <span
                    className={`text-sm py-2  font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {title}.{language}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Engagement Actions */}
                  <button
                    onClick={upvote}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      is_upvoted
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <BiSolidUpvote
                      className={`w-5 h-5 ${is_upvoted ? "text-blue-600" : ""}`}
                    />
                    <span className="text-sm font-medium">{upvotecount}</span>
                  </button>

                  <button
                    onClick={toggleLike}
                    className={`p-2 rounded-lg transition-colors ${
                      isLiked
                        ? "text-red-500"
                        : darkMode
                        ? "text-gray-400 hover:text-red-400"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                    />
                  </button>

                  <button
                    onClick={toggleBookmark}
                    className={`p-2 rounded-lg transition-colors ${
                      isBookmarked
                        ? "text-yellow-500"
                        : darkMode
                        ? "text-gray-400 hover:text-yellow-400"
                        : "text-gray-400 hover:text-yellow-500"
                    }`}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  <button
                    onClick={reportNote}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-red-400"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <Flag className="w-5 h-5" />
                  </button>

                  {isFullscreen && (
                    <button
                      onClick={() => setIsFullscreen(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                {isEditing ? (
                  <div className="p-6 space-y-6">
                    <h3
                      className={`text-lg font-semibold mb-4 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Edit Note
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Title *
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Description
                        </label>
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          rows={3}
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Language
                          </label>
                          <select
                            value={editLanguage}
                            onChange={(e) => setEditLanguage(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border transition-all ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:ring-2 focus:ring-blue-500/20`}
                          >
                            {languages.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Tags (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={editTags.join(", ")}
                            onChange={(e) =>
                              setEditTags(
                                e.target.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                                  .filter(Boolean)
                              )
                            }
                            placeholder="javascript, react, frontend"
                            className={`w-full px-4 py-3 rounded-xl border transition-all ${
                              darkMode
                                ? "bg-gray-700 border-gray-600 text-white"
                                : "bg-white border-gray-300 text-gray-900"
                            } focus:ring-2 focus:ring-blue-500/20`}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Code *
                        </label>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={20}
                          className={`w-full px-4 py-3 rounded-xl border font-mono text-sm transition-all ${
                            darkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          } focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <CodeComponent
                    text={text}
                    language={language}
                    style={style}
                    darkMode={darkMode}
                    showLineNumbers={lineNumbers}
                    wrapLongLines={wordWrap}
                  />
                )}
              </div>
            </div>

            {showQr && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div
                  className={`${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } rounded-2xl border shadow-2xl p-6 max-w-sm w-full`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`text-lg font-semibold ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Share QR Code
                    </h3>
                    <button
                      onClick={() => setShowQr(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? "text-gray-400 hover:text-white hover:bg-gray-700"
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white rounded-xl">
                      <QRCode
                        size={200}
                        value={`${window.location.origin}/page/${id}`}
                        level="M"
                      />
                    </div>
                  </div>

                  <p
                    className={`text-center text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Scan to view this code snippet
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
          className="!z-50"
        />
      </div>
    </div>
  );
}
