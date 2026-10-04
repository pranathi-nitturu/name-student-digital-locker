import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Search,
  FileText,
  ShieldCheck,
  Lock,
  Download,
  Eye,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  User,
  LogOut,
  Bell,
  Menu,
  ChevronDown,
  Clock,
  HardDrive,
  Plus,
  RefreshCw,
  FileImage,
  File,
  ScanLine
} from "lucide-react";

const initialDocuments = [
  {
    id: 1,
    name: "Aadhaar Card.pdf",
    category: "Aadhaar / ID Proof",
    type: "PDF",
    size: "1.8 MB",
    date: "04 Oct 2026",
    status: "Verified"
  },
  {
    id: 2,
    name: "Intermediate Marksheet.pdf",
    category: "Marksheets",
    type: "PDF",
    size: "2.4 MB",
    date: "28 Sep 2026",
    status: "Verified"
  },
  {
    id: 3,
    name: "B.Tech Admission Letter.pdf",
    category: "College Documents",
    type: "PDF",
    size: "1.2 MB",
    date: "20 Sep 2026",
    status: "Pending"
  },
  {
    id: 4,
    name: "SSC Certificate.pdf",
    category: "Education Certificates",
    type: "PDF",
    size: "1.5 MB",
    date: "12 Sep 2026",
    status: "Verified"
  },
  {
    id: 5,
    name: "Resume.pdf",
    category: "Resume",
    type: "PDF",
    size: "840 KB",
    date: "08 Sep 2026",
    status: "Verified"
  }
];

const categories = [
  "All Documents",
  "Aadhaar / ID Proof",
  "Education Certificates",
  "Marksheets",
  "College Documents",
  "Government Documents",
  "Resume",
  "Other Documents"
];

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [documents, setDocuments] = useState(initialDocuments);
  const [showUpload, setShowUpload] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showFileForm, setShowFileForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Documents");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [documentCategory, setDocumentCategory] =
    useState("Other Documents");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "Pranathi",
    dob: "12 March 2007",
    phone: "+91 98765 43210",
    email: "pranathi@example.com",
    address: "Tirupati, Andhra Pradesh",
    studentId: "RGUKT2026CS101",
    college: "RGUKT",
    course: "B.Tech Computer Science",
    emergency: "+91 91234 56789"
  });

  const notify = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  /*
   * ============================================================
   * REAL CAMERA IMPLEMENTATION
   * ============================================================
   */

  const startCamera = async () => {
    setCameraError("");
    setCapturedImage(null);
    setShowCamera(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("CAMERA_NOT_SUPPORTED");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "environment"
          },
          width: {
            ideal: 1920
          },
          height: {
            ideal: 1080
          }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Camera error:", error);

      setCameraActive(false);

      if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        setCameraError(
          "Camera permission is required. Please allow camera access in your browser settings."
        );
      } else if (
        error.name === "NotFoundError" ||
        error.name === "DevicesNotFoundError"
      ) {
        setCameraError(
          "No camera was found on this device."
        );
      } else {
        setCameraError(
          "Camera access is unavailable. Please try uploading from files."
        );
      }
    }
  };

  const captureDocument = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {
      notify("Camera is not ready yet.", "error");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image = canvas.toDataURL("image/jpeg", 0.92);

    setCapturedImage(image);

    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
  };

  const closeCamera = () => {
    stopCamera();
    setShowCamera(false);
    setCapturedImage(null);
    setCameraError("");
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const useCapturedDocument = () => {
    if (!capturedImage) return;

    setDocumentName("Scanned Document");
    setDocumentCategory("Other Documents");

    setShowCamera(false);
    setShowFileForm(true);
  };

  /*
   * ============================================================
   * FILE UPLOAD
   * ============================================================
   */

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg"
    ];

    if (!allowedTypes.includes(file.type)) {
      notify("File type not supported.", "error");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      notify("File is too large. Maximum size is 10 MB.", "error");
      return;
    }

    setSelectedFile(file);
    setDocumentName(file.name);
    setShowUpload(false);
    setShowFileForm(true);
  };

  const saveDocument = () => {
    if (!documentName.trim()) {
      notify("Please enter a document name.", "error");
      return;
    }

    const newDocument = {
      id: Date.now(),
      name: documentName,
      category: documentCategory,
      type: capturedImage
        ? "JPG"
        : selectedFile
        ? selectedFile.type.includes("pdf")
          ? "PDF"
          : "IMAGE"
        : "PDF",
      size: selectedFile
        ? formatBytes(selectedFile.size)
        : "1.1 MB",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }),
      status: "Pending"
    };

    setDocuments((previous) => [
      newDocument,
      ...previous
    ]);

    setSelectedFile(null);
    setCapturedImage(null);
    setDocumentName("");
    setDocumentCategory("Other Documents");

    setShowFileForm(false);

    notify("Document uploaded successfully.");
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 KB";

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return (
      Math.round(
        (bytes / Math.pow(1024, index)) * 10
      ) / 10 +
      " " +
      units[index]
    );
  };

  /*
   * ============================================================
   * DOCUMENT ACTIONS
   * ============================================================
   */

  const deleteDocument = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmed) return;

    setDocuments((previous) =>
      previous.filter((document) => document.id !== id)
    );

    notify("Document deleted.");
  };

  const renameDocument = (document) => {
    const newName = window.prompt(
      "Enter new document name:",
      document.name
    );

    if (!newName?.trim()) return;

    setDocuments((previous) =>
      previous.map((item) =>
        item.id === document.id
          ? {
              ...item,
              name: newName.trim()
            }
          : item
      )
    );

    notify("Document renamed successfully.");
  };

  const downloadDocument = (document) => {
    const blob = new Blob(
      [`LockerX demo document: ${document.name}`],
      {
        type: "text/plain"
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = document.name;

    link.click();

    URL.revokeObjectURL(url);

    notify("Download started.");
  };

  /*
   * ============================================================
   * SEARCH
   * ============================================================
   */

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch = document.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All Documents" ||
      document.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  if (!loggedIn) {
    return (
      <>
        <LoginScreen
          onLogin={() => setLoggedIn(true)}
        />
      </>
    );
  }

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Lock size={22} />
          </div>

          <div>
            <strong>LockerX</strong>
            <span>Digital Locker</span>
          </div>
        </div>

        <nav>
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            <HardDrive size={19} />
            Dashboard
          </button>

          <button
            className={page === "documents" ? "active" : ""}
            onClick={() => setPage("documents")}
          >
            <FileText size={19} />
            My Documents
          </button>

          <button
            className={page === "information" ? "active" : ""}
            onClick={() => setPage("information")}
          >
            <User size={19} />
            My Information
          </button>
        </nav>

        <div className="security-card">
          <ShieldCheck size={24} />

          <div>
            <strong>Locker Protected</strong>
            <span>Your documents are private.</span>
          </div>
        </div>

        <button
          className="logout"
          onClick={() => setLoggedIn(false)}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* MAIN */}

      <main className="main">

        <header className="topbar">
          <div>
            <span className="mobile-brand">
              LockerX
            </span>

            <h1>
              {page === "dashboard"
                ? "Good morning, Pranathi 👋"
                : page === "documents"
                ? "My Documents"
                : "My Information"}
            </h1>

            <p>
              Your documents. Your privacy. Your control.
            </p>
          </div>

          <div className="top-actions">
            <button className="icon-button">
              <Bell size={19} />
            </button>

            <div className="profile">
              <div className="avatar">P</div>

              <div>
                <strong>Pranathi</strong>
                <span>Student</span>
              </div>

              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        {page === "dashboard" && (
          <Dashboard
            documents={documents}
            filteredDocuments={filteredDocuments}
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            openUpload={() => setShowUpload(true)}
            openInformation={() => setPage("information")}
            deleteDocument={deleteDocument}
            renameDocument={renameDocument}
            downloadDocument={downloadDocument}
            notify={notify}
          />
        )}

        {page === "documents" && (
          <Documents
            documents={filteredDocuments}
            search={search}
            setSearch={setSearch}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            openUpload={() => setShowUpload(true)}
            deleteDocument={deleteDocument}
            renameDocument={renameDocument}
            downloadDocument={downloadDocument}
          />
        )}

        {page === "information" && (
          <Information
            profile={profile}
            setProfile={setProfile}
            notify={notify}
          />
        )}
      </main>

      {/* UPLOAD CHOICE MODAL */}

      {showUpload && (
        <Modal
          title="Add Document"
          onClose={() => setShowUpload(false)}
        >
          <div className="upload-options">

            <button
              className="upload-option camera-option"
              onClick={() => {
                setShowUpload(false);
                startCamera();
              }}
            >
              <div className="upload-option-icon">
                <Camera size={30} />
              </div>

              <div>
                <strong>Scan with Camera</strong>
                <span>
                  Use your device camera to scan a document.
                </span>
              </div>

              <span className="arrow">→</span>
            </button>

            <label className="upload-option">
              <div className="upload-option-icon file-option">
                <Upload size={30} />
              </div>

              <div>
                <strong>Upload from Files</strong>
                <span>
                  Select PDF, JPG or PNG from your device.
                </span>
              </div>

              <span className="arrow">→</span>

              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </label>

          </div>

          <div className="drop-zone">
            <Upload size={25} />
            <strong>Drag & drop your document</strong>
            <span>PDF, JPG, JPEG or PNG · Max 10 MB</span>
          </div>
        </Modal>
      )}

      {/* CAMERA MODAL */}

      {showCamera && (
        <CameraModal
          videoRef={videoRef}
          canvasRef={canvasRef}
          capturedImage={capturedImage}
          cameraError={cameraError}
          cameraActive={cameraActive}
          onCapture={captureDocument}
          onRetake={retakePhoto}
          onUse={useCapturedDocument}
          onClose={closeCamera}
          onFallback={() => {
            closeCamera();
            setShowUpload(true);
          }}
        />
      )}

      {/* DOCUMENT DETAILS */}

      {showFileForm && (
        <Modal
          title="Save Document"
          onClose={() => {
            setShowFileForm(false);
            setCapturedImage(null);
            setSelectedFile(null);
          }}
        >
          <div className="preview-container">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured document"
              />
            ) : selectedFile ? (
              <div className="file-preview">
                <FileText size={50} />
                <strong>{selectedFile.name}</strong>
                <span>
                  {formatBytes(selectedFile.size)}
                </span>
              </div>
            ) : null}
          </div>

          <div className="form-grid">
            <label>
              Document Name
              <input
                value={documentName}
                onChange={(event) =>
                  setDocumentName(event.target.value)
                }
                placeholder="Enter document name"
              />
            </label>

            <label>
              Category
              <select
                value={documentCategory}
                onChange={(event) =>
                  setDocumentCategory(event.target.value)
                }
              >
                {categories
                  .filter(
                    (category) =>
                      category !== "All Documents"
                  )
                  .map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button
              className="secondary-button"
              onClick={() =>
                setShowFileForm(false)
              }
            >
              Cancel
            </button>

            <button
              className="primary-button"
              onClick={saveDocument}
            >
              <CheckCircle size={18} />
              Save to Locker
            </button>
          </div>
        </Modal>
      )}

      {/* TOAST */}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === "error" ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}

          {toast.message}
        </div>
      )}
    </div>
  );
}

/*
 * ============================================================
 * LOGIN
 * ============================================================
 */

function LoginScreen({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">

      <div className="login-decoration">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>

        <div className="hero-lock">
          <Lock size={80} />
        </div>

        <h1>LockerX</h1>

        <p>
          Your Documents.
          <br />
          Your Privacy.
          <br />
          Your Control.
        </p>

        <div className="security-pill">
          <ShieldCheck size={17} />
          Secure Student Document Locker
        </div>
      </div>

      <div className="login-card">

        <div className="login-logo">
          <Lock size={25} />
        </div>

        <h2>Welcome back</h2>

        <p>
          Sign in to access your digital locker.
        </p>

        <label>
          Email or Phone

          <input
            placeholder="Enter email or phone"
            defaultValue="pranathi@example.com"
          />
        </label>

        <label>
          Password

          <div className="password-input">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }