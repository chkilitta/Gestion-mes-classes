import React, { useState, useEffect, useContext, createContext, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, Calendar, FileText, Settings, BarChart2, Search, 
  ChevronRight, Upload, Download, Trash2, Check, X, 
  Clock, AlertTriangle, Shield, Sun, Moon, Languages,
  FileSpreadsheet, Folder, FolderPlus, ArrowLeft, AlertCircle,
  File as FileIcon, Camera, Loader2, Save,
  ZoomIn, ZoomOut, Maximize, Layers, UserCircle,
  Copy, Edit2, ArrowRight
} from 'lucide-react';

// --- Types ---

type StatusType = 'present' | 'absent' | 'late' | 'sick' | 'no_kit' | 'exempted';

interface Student {
  id: string; // local uuid
  massarId: string; // Mapped to Massar Number (Col C)
  firstName: string;
  lastName: string;
  birthDate: string; // Mapped to Date of Birth (Col F)
  className: string;
  photoUrl?: string;
  photoData?: string; // Base64 image data
}

interface CycleEntity {
  id: string;
  name: string;
}

interface ClassEntity {
  id: string;
  name: string;
  cycleId?: string; // Link to Cycle
}

interface AttendanceRecord {
  studentId: string;
  status: StatusType;
  note?: string;
}

interface Session {
  id: string;
  date: string;
  time?: string;
  className: string;
  cycleId?: string; // Link to Cycle (New: Context isolation)
  notes: string;
  attendance: AttendanceRecord[];
}

interface DocumentFile {
  id: string;
  name: string;
  category: string; // 'folder' or 'file'
  type: string;
  parentId: string | null; // null for root
  dateAdded: string;
  size: string;
  contentBlob?: Blob; // For offline storage
}

// --- Constants & Translations ---

const ATTENDANCE_STATUSES: { key: StatusType; color: string; labelFr: string; labelAr: string; icon: any }[] = [
  { key: 'present', color: 'bg-green-500', labelFr: 'Présent', labelAr: 'حاضر', icon: Check },
  { key: 'late', color: 'bg-yellow-500', labelFr: 'En retard', labelAr: 'متأخر', icon: Clock },
  { key: 'sick', color: 'bg-orange-500', labelFr: 'Malade', labelAr: 'مريض', icon: AlertTriangle },
  { key: 'no_kit', color: 'bg-purple-500', labelFr: 'Sans tenue', labelAr: 'بدون بذلة', icon: Shield },
  { key: 'exempted', color: 'bg-gray-500', labelFr: 'Dispensé', labelAr: 'معفى', icon: FileText },
  { key: 'absent', color: 'bg-red-500', labelFr: 'Absent', labelAr: 'غائب', icon: X },
];

const TRANSLATIONS = {
  fr: {
    dashboard: "Tableau de bord",
    students: "Élèves",
    sessions: "Séances",
    docs: "Documents",
    settings: "Paramètres",
    search: "Rechercher...",
    addStudent: "Ajouter élève",
    importMassar: "Importer Excel",
    exportStats: "Exporter Stats",
    newSession: "Nouvelle Séance",
    editSession: "Modifier la Séance",
    selectClass: "Sélectionner une classe",
    date: "Date",
    create: "Créer",
    update: "Mettre à jour",
    cancel: "Annuler",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    totalStudents: "Total Élèves",
    sessionsThisMonth: "Séances ce mois",
    avgAttendance: "Taux de présence",
    firstName: "Prénom",
    lastName: "Nom",
    fullNameLabel: "Nom & Prénom",
    massarId: "Code Massar",
    birthDate: "Date de naissance",
    class: "Classe",
    actions: "Actions",
    noData: "Aucune donnée trouvée",
    confirmDelete: "Supprimer cet élément ?",
    confirmDeleteMsg: "Cette action est irréversible. Êtes-vous sûr de vouloir continuer ?",
    language: "Langue",
    theme: "Thème",
    darkMode: "Mode Sombre",
    lightMode: "Mode Clair",
    exportExcel: "Télécharger Excel",
    mapColumns: "Mapper les colonnes",
    preview: "Aperçu",
    importSuccess: "Importation réussie !",
    docUpload: "Téléverser Document",
    docName: "Nom du document",
    stats: "Statistiques",
    addClass: "Ajouter une Classe",
    className: "Nom de la classe",
    enterClassName: "Ex: 2BAC-PC-1",
    classes: "Classes",
    backToClasses: "Retour aux classes",
    importInClass: "Importer dans",
    deleteClass: "Supprimer la classe",
    selectCol: "Sélectionner Colonne",
    warningDate: "Attention: Colonne Date non détectée",
    warningMassar: "Attention: Code Massar manquant",
    newFolder: "Nouveau Dossier",
    folderName: "Nom du dossier",
    root: "Documents",
    emptyFolder: "Ce dossier est vide",
    open: "Ouvrir",
    download: "Télécharger",
    unsupportedPreview: "Aperçu non disponible.",
    loadingPreview: "Chargement de l'aperçu...",
    previewError: "Impossible de convertir le document.",
    downloadFile: "Télécharger le fichier",
    converting: "Préparation du document...",
    formatError: "Format non pris en charge.",
    cycles: "Cycles",
    addCycle: "Ajouter un Cycle",
    cycleName: "Nom du Cycle",
    enterCycleName: "Ex: Handball, Basketball...",
    backToCycles: "Retour aux cycles",
    deleteCycle: "Supprimer le cycle",
    unassigned: "Non classé",
    massarMode: "Mode Massar (Officiel)",
    massarDetected: "Format Massar détecté",
    manualMode: "Mode Manuel",
    studentDetails: "Détails de l'élève",
    photo: "Photo",
    attendanceSummary: "Résumé des présences",
    totalSessions: "Total Séances",
    absences: "Absences",
    atRisk: "À Risque",
    attendanceRate: "Taux de Présence",
    highAbsenceAlert: "Alerte: Plus de 3 absences",
    viewSessions: "Voir les séances",
    summary: "ملخص",
    copy: "Copier",
    copyClass: "Copier la classe",
    selectTargetCycle: "Sélectionner le cycle de destination",
    copySuccess: "Classe copiée avec succès !",
    copyConflict: "Cette classe existe déjà dans le cycle de destination.",
    myClasses: "Mes Classes",
    recentSessions: "Séances Récentes",
    quickAccess: "Accès Rapide",
    goToClass: "Voir la classe"
  },
  ar: {
    dashboard: "لوحة القيادة",
    students: "التلاميذ",
    sessions: "الحصص",
    docs: "الوثائق",
    settings: "الإعدادات",
    search: "بحث...",
    addStudent: "إضافة تلميذ",
    importMassar: "استيراد إكسل",
    exportStats: "تصدير الإحصائيات",
    newSession: "حصة جديدة",
    editSession: "تعديل الحصة",
    selectClass: "اختر القسم",
    date: "التاريخ",
    create: "إنشاء",
    update: "تحديث",
    cancel: "إلغاء",
    save: "حفظ",
    delete: "حذف",
    edit: "تعديل",
    totalStudents: "مجموع التلاميذ",
    sessionsThisMonth: "حصص هذا الشهر",
    avgAttendance: "معدل الحضور",
    firstName: "الاسم الشخصي",
    lastName: "الاسم العائلي",
    fullNameLabel: "الاسم الكامل",
    massarId: "رقم مسار",
    birthDate: "تاريخ الازدياد",
    class: "القسم",
    actions: "إجراءات",
    noData: "لا توجد بيانات",
    confirmDelete: "حذف هذا العنصر؟",
    confirmDeleteMsg: "هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد أنك تريد المتابعة؟",
    language: "اللغة",
    theme: "المظهر",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع الفاتح",
    exportExcel: "تحميل إكسل",
    mapColumns: "تعيين الأعمدة",
    preview: "معاينة",
    importSuccess: "تم الاستيراد بنجاح!",
    docUpload: "رفع وثيقة",
    docName: "اسم الوثيقة",
    stats: "إحصائيات",
    addClass: "إضافة قسم",
    className: "اسم القسم",
    enterClassName: "مثال: 2BAC-PC-1",
    classes: "الأقسام",
    backToClasses: "العودة للأقسام",
    importInClass: "استيراد في",
    deleteClass: "حذف القسم",
    selectCol: "اختر العمود",
    warningDate: "تنبيه: لم يتم العثور على عمود التاريخ",
    warningMassar: "تنبيه: رقم مسار مفقود",
    newFolder: "مجلد جديد",
    folderName: "اسم المجلد",
    root: "الوثائق",
    emptyFolder: "هذا المجلد فارغ",
    open: "فتح",
    download: "تحميل",
    unsupportedPreview: "المعاينة غير متاحة.",
    loadingPreview: "جاري تحميل المعاينة...",
    previewError: "تعذر تحويل المستند.",
    downloadFile: "تحميل الملف",
    converting: "جاري إعداد الوثيقة...",
    formatError: "تنسيق غير مدعوم.",
    cycles: "الأسلاك",
    addCycle: "إضافة سلك",
    cycleName: "اسم السلك",
    enterCycleName: "مثال: كرة اليد، كرة السلة...",
    backToCycles: "العودة للأسلاك",
    deleteCycle: "حذف السلك",
    unassigned: "غير مصنف",
    massarMode: "وضع مسار (الرسمي)",
    massarDetected: "تم كشف تنسيق مسار",
    manualMode: "وضع يدوي",
    studentDetails: "تفاصيل التلميذ",
    photo: "الصورة",
    attendanceSummary: "ملخص الحضور",
    totalSessions: "مجموع الحصص",
    absences: "الغياب",
    atRisk: "في خطر",
    attendanceRate: "نسبة الحضور",
    highAbsenceAlert: "تنبيه: أكثر من 3 غيابات",
    viewSessions: "عرض الحصص",
    summary: "ملخص",
    copy: "نسخ",
    copyClass: "نسخ القسم",
    selectTargetCycle: "اختر السلك الوجهة",
    copySuccess: "تم نسخ القسم بنجاح!",
    copyConflict: "هذا القسم موجود بالفعل في السلك الوجهة.",
    myClasses: "أقسامي",
    recentSessions: "حصص حديثة",
    quickAccess: "وصول سريع",
    goToClass: "عرض القسم"
  }
};

// --- Utilities ---

const parseExcelDate = (val: any): string => {
    if (!val) return '2000-01-01'; // Default fallback
    
    // 1. Excel Serial Date (e.g. 43567)
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    }
    
    const str = String(val).trim();
    if (!str) return '2000-01-01';
    
    // 2. DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const month = dmyMatch[2].padStart(2, '0');
        const year = dmyMatch[3];
        return `${year}-${month}-${day}`;
    }
    
    // 3. YYYY-MM-DD
    const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (ymdMatch) {
         const year = ymdMatch[1];
         const month = ymdMatch[2].padStart(2, '0');
         const day = ymdMatch[3].padStart(2, '0');
         return `${year}-${month}-${day}`;
    }
    
    // 4. Fallback JS Date
    const jsDate = new Date(str);
    if (!isNaN(jsDate.getTime())) {
        return jsDate.toISOString().split('T')[0];
    }
    
    return '2000-01-01';
};

// --- Database (Simulated IndexedDB Wrapper) ---

const DB_NAME = 'PE_Teacher_App_DB';
const DB_VERSION = 4; // Upgraded to support Cycles

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('students')) db.createObjectStore('students', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('documents')) db.createObjectStore('documents', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('classes')) db.createObjectStore('classes', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('cycles')) db.createObjectStore('cycles', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const dbAction = async <T,>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = action(store);
    tx.oncomplete = () => resolve(request ? (request as IDBRequest<T>).result : undefined as any);
    tx.onerror = () => reject(tx.error);
  });
};

const API = {
  getStudents: () => dbAction('students', 'readonly', (store) => store.getAll()) as Promise<Student[]>,
  saveStudent: (s: Student) => dbAction('students', 'readwrite', (store) => store.put(s)),
  deleteStudent: (id: string) => dbAction('students', 'readwrite', (store) => store.delete(id)),
  
  getClasses: () => dbAction('classes', 'readonly', (store) => store.getAll()) as Promise<ClassEntity[]>,
  saveClass: (c: ClassEntity) => dbAction('classes', 'readwrite', (store) => store.put(c)),
  deleteClass: (id: string) => dbAction('classes', 'readwrite', (store) => store.delete(id)),

  getCycles: () => dbAction('cycles', 'readonly', (store) => store.getAll()) as Promise<CycleEntity[]>,
  saveCycle: (c: CycleEntity) => dbAction('cycles', 'readwrite', (store) => store.put(c)),
  deleteCycle: (id: string) => dbAction('cycles', 'readwrite', (store) => store.delete(id)),

  getSessions: () => dbAction('sessions', 'readonly', (store) => store.getAll()) as Promise<Session[]>,
  saveSession: (s: Session) => dbAction('sessions', 'readwrite', (store) => store.put(s)),
  deleteSession: (id: string) => dbAction('sessions', 'readwrite', (store) => store.delete(id)),

  getDocs: () => dbAction('documents', 'readonly', (store) => store.getAll()) as Promise<DocumentFile[]>,
  saveDoc: (d: DocumentFile) => dbAction('documents', 'readwrite', (store) => store.put(d)),
  deleteDoc: (id: string) => dbAction('documents', 'readwrite', (store) => store.delete(id)),
};

// --- Context ---

const AppContext = createContext<{
  lang: 'fr' | 'ar';
  setLang: (l: 'fr' | 'ar') => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  t: any;
}>({} as any);

// --- Smart Document Viewer (Unified: PDF & DOCX-to-PDF Simulator) ---

const SmartDocumentViewer = ({ file }: { file: DocumentFile }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { t } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  // Auto-fit function
  const fitToWidth = () => {
    if (!contentRef.current || !containerRef.current) return;
    
    // Find the first page/section
    const firstPage = contentRef.current.querySelector('section, canvas, .pdf-canvas');
    if (!firstPage) return;

    const contentWidth = firstPage.getBoundingClientRect().width / scale; // Unscaled width
    const containerWidth = containerRef.current.clientWidth - 40; // Minus padding
    
    if (contentWidth > 0) {
      const newScale = containerWidth / contentWidth;
      setScale(Math.min(Math.max(newScale, 0.2), 3)); // Clamp scale
    }
  };

  useEffect(() => {
    if (!file || !file.contentBlob) return;
    let active = true;

    const render = async () => {
      setLoading(true);
      setError(null);
      setScale(1); // Reset scale
      
      // Reset content
      if(contentRef.current) {
        contentRef.current.innerHTML = '';
        contentRef.current.classList.remove('docx-wrapper');
      }

      try {
         const isPdf = file.name.match(/\.pdf$/i) || file.type === 'application/pdf';
         const isWord = file.name.match(/\.(docx|doc)$/i) || file.type.includes('wordprocessing');
         
         const arrayBuffer = await file.contentBlob.arrayBuffer();
         if (!active) return;

         if (isPdf) {
            // --- PDF RENDERER (via PDF.js) ---
            const loadingTask = (window as any).pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
               if(!active) break;
               const page = await pdf.getPage(pageNum);
               
               const viewport = page.getViewport({ scale: 1.5 }); // High quality base scale

               const canvas = document.createElement('canvas');
               canvas.className = 'pdf-canvas';
               canvas.height = viewport.height;
               canvas.width = viewport.width;
               
               if(contentRef.current) contentRef.current.appendChild(canvas);

               const context = canvas.getContext('2d');
               await page.render({ canvasContext: context, viewport: viewport }).promise;
            }
            setLoading(false);
            // Fit to width after render
            setTimeout(fitToWidth, 100);

         } else if (isWord) {
             // --- DOCX "VISUAL CONVERSION" (via docx-preview) ---
             if (contentRef.current) {
                 await (window as any).docx.renderAsync(arrayBuffer, contentRef.current, null, {
                    className: "docx-viewer-content",
                    inWrapper: false, 
                    ignoreWidth: false, // Important: Let document define its width (e.g. A4)
                    breakPages: true,
                    experimental: true,
                    useBase64URL: true,
                    trimXmlDeclaration: true,
                    debug: false
                 });
             }
             setLoading(false);
             // Fit to width after render
             setTimeout(fitToWidth, 100);

         } else {
             throw new Error("Unsupported format");
         }

      } catch (err) {
         console.error("Smart Viewer Error", err);
         if(active) {
            setError(t.previewError);
            setLoading(false);
         }
      }
    };

    render();
    
    // Handle Resize
    const handleResize = () => fitToWidth();
    window.addEventListener('resize', handleResize);

    return () => { 
        active = false; 
        window.removeEventListener('resize', handleResize);
    };
  }, [file]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.2));

  if (error) {
     return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
            <AlertCircle size={48} className="text-red-500" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">{error}</p>
            <a 
                href={URL.createObjectURL(file.contentBlob!)} 
                download={file.name}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
                <Download size={18} /> {t.downloadFile}
            </a>
        </div>
     );
  }

  return (
    <div className="relative w-full h-full bg-[#525659] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-center gap-4 bg-[#333] text-white p-2 shadow-md z-30">
             <button onClick={handleZoomOut} className="p-1 hover:bg-white/10 rounded" title="Zoom Out">
                 <ZoomOut size={20} />
             </button>
             <span className="text-xs font-mono min-w-[3ch]">{Math.round(scale * 100)}%</span>
             <button onClick={handleZoomIn} className="p-1 hover:bg-white/10 rounded" title="Zoom In">
                 <ZoomIn size={20} />
             </button>
             <div className="w-px h-4 bg-gray-500 mx-2"></div>
             <button onClick={fitToWidth} className="p-1 hover:bg-white/10 rounded flex items-center gap-1 text-xs" title="Fit Width">
                 <Maximize size={16} /> Fit
             </button>
        </div>

        {/* Scrollable Container */}
        <div 
            ref={containerRef}
            className="flex-1 overflow-auto w-full relative bg-[#525659] p-8"
        >
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#525659] z-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-white" size={40} />
                        <span className="font-medium text-lg text-white animate-pulse">
                        {file.name.match(/\.(docx|doc)$/i) ? t.converting : t.loadingPreview}
                        </span>
                    </div>
                </div>
            )}
            
            {/* Scaled Content Wrapper */}
            <div 
                style={{ transform: `scale(${scale})` }}
                className="document-transform-wrapper"
            >
                <div ref={contentRef} />
            </div>
        </div>
    </div>
  );
};

// --- Components ---

const Layout = ({ children, activeTab, setActiveTab }: any) => {
  const { lang, theme, t } = useContext(AppContext);
  
  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''} ${lang === 'ar' ? 'font-arabic' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <main className="flex-1 bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text p-4 pb-24 overflow-y-auto no-scrollbar">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-dark-card border-t dark:border-dark-border flex justify-around py-3 pb-safe z-50 shadow-lg">
        {[
          { id: 'dashboard', icon: BarChart2, label: t.dashboard },
          { id: 'students', icon: Layers, label: t.cycles }, 
          { id: 'sessions', icon: Calendar, label: t.sessions },
          { id: 'docs', icon: FileText, label: t.docs },
          { id: 'settings', icon: Settings, label: t.settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-1 ${activeTab === item.id ? 'text-primary-600 dark:text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const Card = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick} className={`bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-dark-border p-4 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false }: any) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary: "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:ring-gray-500",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 focus:ring-red-500",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} className="mr-2 rtl:ml-2 rtl:mr-0" />}
      {children}
    </button>
  );
};

const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm, title, message }: any) => {
  const { t } = useContext(AppContext);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-dark-card rounded-3xl p-6 max-w-sm w-full shadow-xl scale-100 opacity-100 transition-all">
         <div className="mb-2 flex items-center gap-3">
             <AlertTriangle className="text-red-500" size={24} />
             <h2 className="text-xl font-normal text-gray-900 dark:text-white">{title || t.confirmDelete}</h2>
         </div>
         <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
            {message || t.confirmDeleteMsg}
         </p>
         <div className="flex justify-end gap-2">
            <button 
               onClick={onClose}
               className="px-4 py-2 rounded-full text-primary-600 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
               {t.cancel}
            </button>
            <button 
               onClick={() => { onConfirm(); onClose(); }}
               className="px-4 py-2 rounded-full text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
               {t.delete}
            </button>
         </div>
      </div>
    </div>
  );
};

// --- Screens ---

const Dashboard = ({ stats, onNavigateClass, onNavigateSession, rawData }: any) => {
  const { t } = useContext(AppContext);
  const { sessions, classes, cycles } = rawData || { sessions: [], classes: [], cycles: [] };

  // Helper to get last 3 sessions
  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Group classes by Cycle
  const classesByCycle = cycles.map((cycle: CycleEntity) => ({
      ...cycle,
      classes: classes.filter((c: ClassEntity) => c.cycleId === cycle.id)
  }));
  // Unassigned
  const unassigned = classes.filter((c: ClassEntity) => !c.cycleId);
  if (unassigned.length > 0) {
      classesByCycle.push({ id: 'unassigned', name: t.unassigned, classes: unassigned });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard}</h1>
      
      {/* Global Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-none">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-lg"><Users size={20} /></div>
            <span className="text-3xl font-bold">{stats.totalStudents}</span>
          </div>
          <p className="mt-2 text-sm text-primary-50">{t.totalStudents}</p>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-lg"><Calendar size={20} /></div>
            <span className="text-3xl font-bold">{stats.sessionsCount}</span>
          </div>
          <p className="mt-2 text-sm text-blue-50">{t.sessionsThisMonth}</p>
        </Card>
      </div>

      {/* RECENT SESSIONS - INTERACTIVE */}
      <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Clock size={20} className="text-blue-500"/> {t.recentSessions}
          </h2>
          <div className="grid gap-3">
              {recentSessions.length > 0 ? recentSessions.map((session: Session) => (
                  <Card key={session.id} onClick={() => onNavigateSession(session)} className="flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors py-3">
                      <div>
                          <div className="font-bold text-gray-800 dark:text-white">
                              {session.className} 
                              <span className="text-xs font-normal text-gray-500 ml-2">({session.date})</span>
                          </div>
                          <div className="text-xs text-gray-500">
                              {session.attendance.filter(a => a.status === 'present').length} / {session.attendance.length} Présents
                          </div>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
                          <Edit2 size={16} />
                      </div>
                  </Card>
              )) : <p className="text-sm text-gray-500 italic">{t.noData}</p>}
          </div>
      </div>

      {/* MY CLASSES - INTERACTIVE ACCORDION-STYLE LIST */}
      <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Layers size={20} className="text-primary-500"/> {t.myClasses}
          </h2>
          <div className="space-y-4">
              {classesByCycle.map((group: any) => (
                  <div key={group.id} className="space-y-2">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{group.name}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {group.classes.map((cls: ClassEntity) => (
                              <Card 
                                  key={cls.id} 
                                  onClick={() => onNavigateClass(group.id !== 'unassigned' ? group : null, cls)}
                                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex flex-col items-center justify-center p-3 text-center active:scale-95 duration-150"
                              >
                                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-2">
                                      <Users size={20} />
                                  </div>
                                  <span className="font-bold text-sm truncate w-full">{cls.name}</span>
                                  <span className="text-[10px] text-primary-600 mt-1 flex items-center gap-1">
                                      {t.goToClass} <ArrowRight size={10} />
                                  </span>
                              </Card>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>
      
      {/* Absence Alerts */}
      <Card className="border-l-4 border-l-red-500">
        <div className="flex items-center gap-2 mb-4">
           <AlertTriangle className="text-red-500" size={20} />
           <h3 className="font-semibold">{t.highAbsenceAlert}</h3>
        </div>
        <div className="space-y-3">
           {stats.atRiskStudents && stats.atRiskStudents.length > 0 ? (
             stats.atRiskStudents.map((s: any) => (
               <div key={s.id} className="flex items-center justify-between border-b dark:border-gray-700 last:border-0 pb-2 last:pb-0">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                          {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div>
                          <div className="font-medium text-sm">{s.lastName} {s.firstName}</div>
                          <div className="text-xs text-gray-500">{s.className}</div>
                      </div>
                  </div>
                  <div className="font-bold text-red-600">{s.absences} {t.absences}</div>
               </div>
             ))
           ) : (
             <p className="text-green-600 text-sm flex items-center gap-2"><Check size={16}/> Good attendance!</p>
           )}
        </div>
      </Card>
    </div>
  );
};

const StudentsScreen = ({ 
    selectedCycle, setSelectedCycle, 
    selectedClass, setSelectedClass 
}: any) => {
  const { t } = useContext(AppContext);
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [classList, setClassList] = useState<ClassEntity[]>([]);
  const [cycles, setCycles] = useState<CycleEntity[]>([]);
  
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddCycle, setShowAddCycle] = useState(false);
  
  // Detail/Edit Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'student' | 'class' | 'cycle', id: string, name?: string } | null>(null);

  // Copy Class State
  const [classToCopy, setClassToCopy] = useState<ClassEntity | null>(null);

  // Import Logic State
  const [fileData, setFileData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isMassarMode, setIsMassarMode] = useState(true);
  
  // MAPPING STATE
  const [mapping, setMapping] = useState({ lastName: '', firstName: '', birthDate: '', massarId: '', className: '' });
  const [newClassName, setNewClassName] = useState("");
  const [newCycleName, setNewCycleName] = useState("");
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await API.getStudents();
    const c = await API.getClasses();
    const cy = await API.getCycles();
    setStudents(s);
    setCycles(cy);
    
    // Virtual Classes Calculation:
    const explicitClassNames = new Set(c.map(cls => cls.name));
    const studentClassNames = new Set(s.map(stu => stu.className));
    
    const virtualClasses: ClassEntity[] = [];
    studentClassNames.forEach(name => {
        if (!explicitClassNames.has(name)) {
            virtualClasses.push({ id: `virtual-${name}`, name });
        }
    });

    setClassList([...c, ...virtualClasses]);
  };

  const handleCreateCycle = async () => {
      if(!newCycleName.trim()) return;
      const newCycle = { id: crypto.randomUUID(), name: newCycleName.trim() };
      await API.saveCycle(newCycle);
      setNewCycleName("");
      setShowAddCycle(false);
      loadData();
  };

  const handleCreateClass = async () => {
    if(!newClassName.trim()) return;
    
    const existsElsewhere = classList.some(c => 
        c.name === newClassName.trim() && 
        c.cycleId && c.cycleId !== selectedCycle?.id
    );

    if(existsElsewhere) {
        alert("Note: This class name already exists in another cycle. It will be added to this cycle as well without removing the other.");
    }

    const newClass: ClassEntity = { 
        id: crypto.randomUUID(), 
        name: newClassName.trim(),
        cycleId: selectedCycle?.id !== 'unassigned' ? selectedCycle?.id : undefined
    };

    await API.saveClass(newClass);
    setNewClassName("");
    setShowAddClass(false);
    loadData();
  };

  const handleCopyClass = async (targetCycleId: string) => {
      if (!classToCopy) return;

      const existsInTarget = classList.some(c => 
          c.name === classToCopy.name && 
          (targetCycleId === 'unassigned' ? !c.cycleId : c.cycleId === targetCycleId)
      );

      if (existsInTarget) {
          alert(t.copyConflict);
          return;
      }

      const newClass: ClassEntity = {
          id: crypto.randomUUID(),
          name: classToCopy.name,
          cycleId: targetCycleId === 'unassigned' ? undefined : targetCycleId
      };

      await API.saveClass(newClass);

      const sessions = await API.getSessions();
      const sourceSessions = sessions.filter(s => 
          s.className === classToCopy.name && 
          (classToCopy.cycleId ? s.cycleId === classToCopy.cycleId : (!s.cycleId && !classToCopy.cycleId))
      );

      for (const sess of sourceSessions) {
          const duplicatedSession: Session = { 
              ...sess, 
              id: crypto.randomUUID(), // New ID for the copy
              cycleId: targetCycleId === 'unassigned' ? undefined : targetCycleId 
          };
          await API.saveSession(duplicatedSession);
      }

      setClassToCopy(null);
      await loadData();
      alert(t.copySuccess);
  };

  const handleUpdateStudent = async () => {
    if(!editingStudent) return;
    await API.saveStudent(editingStudent);
    setEditingStudent(null);
    loadData();
  };

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt: any) => {
      const bstr = evt.target.result;
      const wb = (window as any).XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = (window as any).XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length > 0) {
        let seemsMassar = false;
        if (data.length > 15 && data[15] && (data[15][2])) {
           seemsMassar = true;
        }

        setIsMassarMode(seemsMassar);
        
        if (!seemsMassar) {
            const hdrs = data[0] as string[];
            setHeaders(hdrs);
            setFileData(data.slice(1));
            
            const lowerHeaders = hdrs.map(h => String(h).toLowerCase());
            const newMap = { lastName: '', firstName: '', birthDate: '', massarId: '', className: '' };

            const idxMassar = lowerHeaders.findIndex(h => h.includes('massar') || h.includes('code') || h === 'id');
            if(idxMassar > -1) newMap.massarId = hdrs[idxMassar];

            const idxDate = lowerHeaders.findIndex(h => 
            (h.includes('date') && (h.includes('naissance') || h.includes('birth'))) || 
            h === 'ddn' || h === 'dob' || h === 'date'
            );
            if(idxDate > -1) newMap.birthDate = hdrs[idxDate];

            const idxLast = lowerHeaders.findIndex(h => h === 'nom' || h.includes('nom') || h.includes('name'));
            if(idxLast > -1) newMap.lastName = hdrs[idxLast];

            setMapping(newMap);
        } else {
             setFileData(data); 
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const executeImport = async () => {
    const targetClassName = selectedClass ? selectedClass.name : "Imported";
    let newStudents: Student[] = [];

    if (isMassarMode) {
        const massarData = fileData.slice(15);
        newStudents = massarData.map((row: any) => {
             const rawName = String(row[3] || '').trim(); // Col D
             const rawMassar = String(row[2] || '').trim(); // Col C
             const rawDob = row[5]; // Col F

             if (!rawName || rawName.match(/nom|prenom/i)) return null; 

             let fName = '', lName = '';
             const parts = rawName.split(/\s+/);
             if (parts.length > 1) {
                 lName = parts[0]; 
                 fName = parts.slice(1).join(' ');
             } else {
                 lName = rawName;
             }

             return {
                id: crypto.randomUUID(),
                firstName: fName,
                lastName: lName,
                massarId: rawMassar,
                birthDate: parseExcelDate(rawDob),
                className: targetClassName
             };
        }).filter(s => s !== null) as Student[];

    } else {
        if (!mapping.massarId) return;
        const idxLast = headers.indexOf(mapping.lastName);
        const idxBirth = headers.indexOf(mapping.birthDate);
        const idxMassar = headers.indexOf(mapping.massarId);
        const idxClass = (!selectedClass && mapping.className) ? headers.indexOf(mapping.className) : -1;

        newStudents = fileData.map((row: any) => {
        let fName = '', lName = '';
        const val = String(row[idxLast] || '').trim();
        if (idxLast > -1) {
            const parts = val.split(/\s+/);
            if (parts.length > 1) {
                fName = parts.pop() || '';
                lName = parts.join(' ');
            } else {
                lName = val;
                fName = '';
            }
        }
        let bDay = '2000-01-01';
        if(idxBirth > -1 && row[idxBirth]) {
            bDay = parseExcelDate(row[idxBirth]);
        }
        return {
            id: crypto.randomUUID(),
            firstName: fName,
            lastName: lName,
            massarId: String(row[idxMassar]),
            className: idxClass > -1 ? String(row[idxClass]) : targetClassName,
            birthDate: bDay
        };
        }).filter(s => s.massarId && (s.firstName || s.lastName));
    }

    for (const s of newStudents) {
      await API.saveStudent(s);
    }
    
    await loadData();
    setShowImport(false);
    setFileData([]);
  };

  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'student') {
        await API.deleteStudent(deleteTarget.id);
    } else if (deleteTarget.type === 'class') {
        if(!deleteTarget.id.startsWith('virtual-')) {
            await API.deleteClass(deleteTarget.id);
        }
        const studentsInClass = students.filter(s => s.className === deleteTarget.name);
        for(const s of studentsInClass) {
            await API.deleteStudent(s.id);
        }
    } else if (deleteTarget.type === 'cycle') {
        await API.deleteCycle(deleteTarget.id);
        const classesInCycle = classList.filter(c => c.cycleId === deleteTarget.id);
        for (const c of classesInCycle) {
            await API.deleteClass(c.id);
            const studentsInClass = students.filter(s => s.className === c.name);
            for(const s of studentsInClass) {
                await API.deleteStudent(s.id);
            }
        }
    }
    loadData();
  };

  const handlePhotoUpload = async (studentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            alert("Image too large (max 2MB)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            // Update in DB
            const student = students.find(s => s.id === studentId);
            if (student) {
                const updated = { ...student, photoData: base64 };
                await API.saveStudent(updated);
                
                if(editingStudent && editingStudent.id === studentId) {
                    setEditingStudent(updated);
                }
                setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const unassignedClasses = classList.filter(c => !c.cycleId);

  return (
    <div className="space-y-4">
      <ConfirmDeleteDialog 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeleteAction}
        message={deleteTarget?.type === 'class' ? `${t.confirmDeleteMsg} (${t.class}: ${deleteTarget.name})` : deleteTarget?.type === 'cycle' ? `${t.confirmDeleteMsg} (${t.cycles}: ${deleteTarget.name})` : undefined}
      />

      {/* 1. Root Level: Cycles List */}
      {!selectedCycle ? (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">{t.cycles}</h1>
                <Button onClick={() => setShowAddCycle(true)} icon={FolderPlus} className="!px-3">
                    {t.addCycle}
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Real Cycles */}
                {cycles.map(cycle => {
                    // Count classes in this cycle
                    const clsCount = classList.filter(c => c.cycleId === cycle.id).length;
                    return (
                        <Card key={cycle.id} onClick={() => setSelectedCycle(cycle)} className="active:scale-95 transition-transform cursor-pointer relative group bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-dark-bg">
                            <div className="flex flex-col items-center p-2 text-center space-y-2">
                                <Layers size={40} className="text-blue-500 fill-blue-50 dark:fill-blue-900/20" />
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate w-full">{cycle.name}</h3>
                                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{clsCount} {t.classes}</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'cycle', id: cycle.id, name: cycle.name }); }}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </Card>
                    );
                })}

                {/* Virtual "Unassigned" Cycle */}
                {unassignedClasses.length > 0 && (
                    <Card onClick={() => setSelectedCycle({ id: 'unassigned', name: t.unassigned })} className="active:scale-95 transition-transform cursor-pointer relative group border-dashed border-2">
                        <div className="flex flex-col items-center p-2 text-center space-y-2">
                            <Folder size={40} className="text-gray-400" />
                            <h3 className="font-bold text-lg text-gray-600 dark:text-gray-400 truncate w-full">{t.unassigned}</h3>
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{unassignedClasses.length} {t.classes}</span>
                        </div>
                    </Card>
                )}
            </div>

            {/* Add Cycle Modal */}
            {showAddCycle && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-sm space-y-4">
                <h3 className="font-bold text-lg">{t.addCycle}</h3>
                <div>
                    <label className="text-sm text-gray-500 mb-1 block">{t.cycleName}</label>
                    <input 
                        autoFocus
                        className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                        placeholder={t.enterCycleName}
                        value={newCycleName}
                        onChange={e => setNewCycleName(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleCreateCycle}>{t.create}</Button>
                    <Button variant="secondary" className="flex-1" onClick={() => setShowAddCycle(false)}>{t.cancel}</Button>
                </div>
                </Card>
            </div>
            )}
        </div>
      ) : !selectedClass ? (
        /* 2. Cycle Level: Class List View */
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <Button variant="secondary" icon={ArrowLeft} onClick={() => setSelectedCycle(null)} className="!px-2" />
                     <h1 className="text-xl font-bold dark:text-white leading-tight">{selectedCycle.name}</h1>
                 </div>
                 {/* Only allow adding classes if it's a real cycle */}
                 {selectedCycle.id !== 'unassigned' && (
                     <Button onClick={() => setShowAddClass(true)} icon={FolderPlus} className="!px-3">
                         {t.addClass}
                     </Button>
                 )}
            </div>

            <div className="grid grid-cols-2 gap-3">
            {/* Show only classes belonging to this cycle */}
            {classList
                .filter(c => selectedCycle.id === 'unassigned' ? !c.cycleId : c.cycleId === selectedCycle.id)
                .map(cls => {
                const count = students.filter(s => s.className === cls.name).length;
                return (
                    <Card key={cls.id} onClick={() => setSelectedClass(cls)} className="active:scale-95 transition-transform cursor-pointer relative group">
                        <div className="flex flex-col items-center p-2 text-center space-y-2">
                            <Folder size={40} className="text-primary-500 fill-primary-50 dark:fill-primary-900/20" />
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate w-full">{cls.name}</h3>
                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{count} {t.students}</span>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setClassToCopy(cls); }}
                                className="text-gray-400 hover:text-blue-500 p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                                title={t.copyClass}
                            >
                                <Copy size={16} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'class', id: cls.id, name: cls.name }); }}
                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </Card>
                )
            })}
            </div>

            {/* Copy Class Modal */}
            {classToCopy && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <Card className="w-full max-w-sm space-y-4">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                            <Copy className="text-blue-500" size={20} />
                            {t.copyClass}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {classToCopy.name}
                        </p>
                        
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                            <label className="text-xs font-bold text-gray-400 uppercase">{t.selectTargetCycle}</label>
                            
                            {cycles
                                .filter(c => c.id !== selectedCycle.id) // Exclude current cycle
                                .map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handleCopyClass(c.id)}
                                    className="w-full text-left p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 transition-colors flex items-center gap-3"
                                >
                                    <Layers size={18} className="text-blue-500" />
                                    <span className="font-medium">{c.name}</span>
                                </button>
                            ))}
                            
                            {/* Option to move to Unassigned if not already there */}
                            {selectedCycle.id !== 'unassigned' && (
                                <button
                                    onClick={() => handleCopyClass('unassigned')}
                                    className="w-full text-left p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3 text-gray-500"
                                >
                                    <Folder size={18} />
                                    <span className="font-medium">{t.unassigned}</span>
                                </button>
                            )}

                            {cycles.length === 0 && selectedCycle.id === 'unassigned' && (
                                <p className="text-sm text-gray-400 italic text-center py-4">No other cycles available.</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t dark:border-gray-700">
                            <Button variant="secondary" onClick={() => setClassToCopy(null)}>{t.cancel}</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Add Class Modal */}
            {showAddClass && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-sm space-y-4">
                <h3 className="font-bold text-lg">{t.addClass}</h3>
                <div>
                    <label className="text-sm text-gray-500 mb-1 block">{t.className}</label>
                    <input 
                        autoFocus
                        className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                        placeholder={t.enterClassName}
                        value={newClassName}
                        onChange={e => setNewClassName(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleCreateClass}>{t.create}</Button>
                    <Button variant="secondary" className="flex-1" onClick={() => setShowAddClass(false)}>{t.cancel}</Button>
                </div>
                </Card>
            </div>
            )}
        </div>
      ) : (
          /* 3. Student List View (Inside a Class) */
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
                <Button variant="secondary" icon={ArrowLeft} onClick={() => setSelectedClass(null)} className="!px-2" />
                <div>
                <h1 className="text-xl font-bold dark:text-white leading-tight">{selectedClass.name}</h1>
                <p className="text-xs text-gray-500">{students.filter(s => s.className === selectedClass.name).length} {t.students} • {selectedCycle.name}</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-3 text-gray-400" size={18} />
                    <input 
                    type="text" 
                    placeholder={t.search} 
                    className="w-full pl-9 rtl:pr-9 rtl:pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setShowImport(true)} icon={Upload} className="whitespace-nowrap">
                    {t.importMassar}
                </Button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {students.filter(s => s.className === selectedClass.name && (s.lastName.toLowerCase().includes(search.toLowerCase()) || s.massarId.includes(search))).length === 0 ? (
                <div className="text-center py-10 flex flex-col items-center opacity-50">
                    <FileSpreadsheet size={48} className="text-gray-300 mb-2"/>
                    <p>{t.noData}</p>
                </div>
                ) : (
                students
                    .filter(s => s.className === selectedClass.name)
                    .filter(s => s.lastName.toLowerCase().includes(search.toLowerCase()) || s.firstName.toLowerCase().includes(search.toLowerCase()) || s.massarId.includes(search))
                    .map(student => (
                    <Card key={student.id} onClick={() => setEditingStudent(student)} className="flex items-center justify-between p-3 cursor-pointer hover:border-primary-500 transition-colors">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <div className="relative shrink-0">
                                {student.photoData ? (
                                    <img 
                                        src={student.photoData} 
                                        alt="Profile" 
                                        className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 shadow-sm" 
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm border border-transparent">
                                        {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                )}
                            </div>
                            
                            <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{student.lastName.toUpperCase()} {student.firstName}</h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">{student.massarId}</span>
                                <span>•</span>
                                <span>{student.birthDate}</span>
                            </div>
                            </div>
                        </div>
                        <div onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'student', id: student.id }); }} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors">
                            <Trash2 size={18} />
                        </div>
                    </Card>
                    ))
                )}
            </div>

            {/* Edit / Details Student Modal */}
            {editingStudent && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <Card className="w-full max-w-md space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b dark:border-dark-border">
                             <h3 className="font-bold text-lg">{t.studentDetails}</h3>
                             <button onClick={() => setEditingStudent(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                        </div>

                        <div className="flex flex-col items-center gap-4 py-2">
                             {/* Photo */}
                             <div className="relative group">
                                <label htmlFor="edit-upload" className="cursor-pointer">
                                    {editingStudent.photoData ? (
                                        <img src={editingStudent.photoData} className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-dark-border" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-dark-bg flex items-center justify-center">
                                            <UserCircle size={48} className="text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                                        <Camera size={16} />
                                    </div>
                                </label>
                                <input id="edit-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(editingStudent.id, e)} />
                             </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-1">
                                <label className="text-xs text-gray-500 mb-1 block">{t.lastName}</label>
                                <input 
                                    className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                                    value={editingStudent.lastName}
                                    onChange={e => setEditingStudent({...editingStudent, lastName: e.target.value})}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs text-gray-500 mb-1 block">{t.firstName}</label>
                                <input 
                                    className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                                    value={editingStudent.firstName}
                                    onChange={e => setEditingStudent({...editingStudent, firstName: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500 mb-1 block">{t.massarId}</label>
                                <input 
                                    className="w-full p-2 border rounded bg-gray-50 dark:bg-dark-bg dark:border-dark-border font-mono"
                                    value={editingStudent.massarId}
                                    onChange={e => setEditingStudent({...editingStudent, massarId: e.target.value})}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500 mb-1 block">{t.birthDate}</label>
                                <input 
                                    type="date"
                                    className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                                    value={editingStudent.birthDate}
                                    onChange={e => setEditingStudent({...editingStudent, birthDate: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1" onClick={handleUpdateStudent}>{t.save}</Button>
                            <Button variant="secondary" className="flex-1" onClick={() => setEditingStudent(null)}>{t.cancel}</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Import Modal */}
            {showImport && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">{t.importInClass} <span className="text-primary-600">{selectedClass.name}</span></h2>
                        <button onClick={() => {setShowImport(false); setFileData([]);}}><X size={20}/></button>
                    </div>
                    
                    {fileData.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-dark-bg">
                        <input type="file" id="fileImport" accept=".xlsx,.csv" onChange={handleFileUpload} className="hidden" />
                        <label htmlFor="fileImport" className="cursor-pointer flex flex-col items-center">
                            <Upload size={32} className="text-gray-400 mb-2" />
                            <span className="text-sm font-medium text-primary-600">{t.exportExcel} (Massar)</span>
                        </label>
                    </div>
                    ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            <p className="text-sm text-gray-600">
                                {isMassarMode ? fileData.slice(15).length : fileData.length - 1} students detected
                            </p>
                            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                                <input type="checkbox" checked={isMassarMode} onChange={e => setIsMassarMode(e.target.checked)} className="rounded text-primary-600" />
                                {isMassarMode ? t.massarDetected : t.manualMode}
                            </label>
                        </div>

                        {isMassarMode ? (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center space-y-2">
                                <Check size={32} className="mx-auto text-green-600" />
                                <h3 className="font-bold text-green-800 dark:text-green-300">{t.massarMode}</h3>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                    Columns detected automatically:<br/>
                                    Name (Col D), ID (Col C), Date (Col F)<br/>
                                    Starting from Row 16
                                </p>
                            </div>
                        ) : (
                            // MANUAL MAPPING
                            <div className="grid gap-3">
                                {!mapping.birthDate && (
                                    <div className="flex items-center gap-2 text-orange-600 text-xs bg-orange-50 p-2 rounded">
                                        <AlertCircle size={14}/> {t.warningDate}
                                    </div>
                                )}
                                {!mapping.massarId && (
                                    <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded">
                                        <AlertCircle size={14}/> {t.warningMassar}
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs font-semibold uppercase text-gray-500 mb-1">{t.fullNameLabel}</label>
                                    <select 
                                    className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                                    value={mapping.lastName}
                                    onChange={e => setMapping({...mapping, lastName: e.target.value})}
                                    >
                                    <option value="">{t.selectCol}</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-gray-500 mb-1 flex justify-between">
                                        {t.birthDate}
                                    </label>
                                    <select 
                                    className={`w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border ${!mapping.birthDate ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : ''}`}
                                    value={mapping.birthDate}
                                    onChange={e => setMapping({...mapping, birthDate: e.target.value})}
                                    >
                                    <option value="">{t.selectCol}</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-gray-500 mb-1">{t.massarId}</label>
                                    <select 
                                    className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                                    value={mapping.massarId}
                                    onChange={e => setMapping({...mapping, massarId: e.target.value})}
                                    >
                                    <option value="">{t.selectCol}</option>
                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-2 mt-4 pt-2 border-t dark:border-gray-700">
                        <Button onClick={executeImport} className="flex-1" disabled={!isMassarMode && !mapping.massarId}>
                            {t.save}
                        </Button>
                        <Button variant="secondary" onClick={() => {setShowImport(false); setFileData([]);}} className="flex-1">{t.cancel}</Button>
                        </div>
                    </div>
                    )}
                </Card>
                </div>
            )}
         </div>
      )}
    </div>
  );
};

const SessionsScreen = ({ 
    initialSession, 
    onClearInitialSession 
}: any) => {
  const { t, lang } = useContext(AppContext);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [cycles, setCycles] = useState<CycleEntity[]>([]);
  
  const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [newSessionDate, setNewSessionDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  // Handle Deep Linking from Dashboard
  useEffect(() => {
      if (initialSession) {
          setCurrentSession(initialSession);
          setViewMode('edit');
      }
  }, [initialSession]);

  const loadData = async () => {
    const s = await API.getSessions();
    const c = await API.getClasses();
    const stu = await API.getStudents();
    const cy = await API.getCycles();
    setSessions(s.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setClasses(c);
    setStudents(stu);
    setCycles(cy);
  };

  const handleCreateSession = async () => {
     if (!selectedClassId) return;
     const cls = classes.find(c => c.id === selectedClassId);
     if(!cls) return;

     // Get students for this class
     const classStudents = students.filter(s => s.className === cls.name);
     
     const newSession: Session = {
         id: crypto.randomUUID(),
         date: newSessionDate,
         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         className: cls.name,
         cycleId: cls.cycleId,
         notes: '',
         attendance: classStudents.map(s => ({ studentId: s.id, status: 'present' }))
     };

     await API.saveSession(newSession);
     setCurrentSession(newSession);
     setViewMode('edit');
     loadData();
  };

  const handleUpdateSession = async () => {
      if(!currentSession) return;
      await API.saveSession(currentSession);
      setViewMode('list');
      setCurrentSession(null);
      if(onClearInitialSession) onClearInitialSession(); // Clear parent state if linked
      loadData();
  };

  const handleBack = () => {
      setViewMode('list'); 
      setCurrentSession(null);
      if(onClearInitialSession) onClearInitialSession();
  };

  const handleDeleteSession = async (id: string) => {
      if(confirm(t.confirmDeleteMsg)) {
          await API.deleteSession(id);
          loadData();
      }
  };
  
  const updateAttendance = (studentId: string, status: StatusType) => {
      if(!currentSession) return;
      const updatedAttendance = currentSession.attendance.map(a => 
          a.studentId === studentId ? { ...a, status } : a
      );
      setCurrentSession({ ...currentSession, attendance: updatedAttendance });
  };

  if (viewMode === 'edit' && currentSession) {
      const clsName = currentSession.className;
      const cycle = cycles.find(c => c.id === currentSession.cycleId);
      const displayTitle = cycle ? `${cycle.name} - ${clsName}` : clsName;

      // Filter students relevant to this session
      const sessionStudents = currentSession.attendance.map(rec => {
          const s = students.find(st => st.id === rec.studentId);
          return s ? { ...s, status: rec.status } : null;
      }).filter(Boolean) as (Student & { status: StatusType })[];
      
      sessionStudents.sort((a,b) => a.lastName.localeCompare(b.lastName));

      return (
          <div className="space-y-4">
              <div className="sticky top-0 z-20 bg-gray-50 dark:bg-dark-bg py-3 -mt-4 -mx-4 px-4 border-b dark:border-dark-border shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" icon={ArrowLeft} onClick={handleBack} />
                    <div>
                        <h2 className="text-xl font-bold dark:text-white">{displayTitle}</h2>
                        <p className="text-sm text-gray-500">{currentSession.date}</p>
                    </div>
                  </div>
                  <Button onClick={handleUpdateSession} icon={Save}>{t.save}</Button>
              </div>

              <div className="grid gap-2">
                  {sessionStudents.map(student => (
                      <Card key={student.id} className="flex flex-col gap-3 p-3">
                          <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-800 dark:text-white">{student.lastName} {student.firstName}</span>
                              <span className="text-xs text-gray-400">{student.massarId}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {ATTENDANCE_STATUSES.map(status => (
                                  <button
                                      key={status.key}
                                      onClick={() => updateAttendance(student.id, status.key)}
                                      className={`flex-1 py-2 px-1 rounded text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                                          student.status === status.key 
                                          ? `${status.color} text-white shadow-md scale-105` 
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      }`}
                                  >
                                      <status.icon size={14} />
                                      <span className={student.status === status.key ? 'block' : 'hidden sm:block'}>
                                        {lang === 'ar' ? status.labelAr : status.labelFr}
                                      </span>
                                  </button>
                              ))}
                          </div>
                      </Card>
                  ))}
              </div>

              <div className="mt-4 pt-2 border-t dark:border-gray-700">
                  <Button onClick={handleUpdateSession} icon={Save} className="w-full py-4 text-lg font-bold shadow-md">
                      {t.save}
                  </Button>
              </div>
          </div>
      );
  }

  return (
      <div className="space-y-6">
          <h1 className="text-2xl font-bold dark:text-white">{t.sessions}</h1>

          <Card className="space-y-4 border-l-4 border-l-primary-500">
              <h3 className="font-bold text-lg">{t.newSession}</h3>
              <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs text-gray-500 mb-1 block">{t.date}</label>
                      <input 
                          type="date" 
                          className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                          value={newSessionDate}
                          onChange={e => setNewSessionDate(e.target.value)}
                      />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs text-gray-500 mb-1 block">{t.class}</label>
                      <select 
                          className="w-full p-2 border rounded dark:bg-dark-bg dark:border-dark-border"
                          value={selectedClassId}
                          onChange={e => setSelectedClassId(e.target.value)}
                      >
                          <option value="">{t.selectClass}</option>
                          {classes.sort((a,b) => {
                              const cyA = cycles.find(c => c.id === a.cycleId)?.name || '';
                              const cyB = cycles.find(c => c.id === b.cycleId)?.name || '';
                              if (cyA !== cyB) return cyA.localeCompare(cyB);
                              return a.name.localeCompare(b.name);
                          }).map(c => {
                              const cycle = cycles.find(cy => cy.id === c.cycleId);
                              const displayName = cycle ? `${cycle.name} - ${c.name}` : c.name;
                              return (
                                  <option key={c.id} value={c.id}>{displayName}</option>
                              );
                          })}
                      </select>
                  </div>
              </div>
              <Button onClick={handleCreateSession} disabled={!selectedClassId} className="w-full">
                  {t.create}
              </Button>
          </Card>

          <div className="space-y-3">
              <h3 className="font-bold text-lg">{t.sessionsThisMonth}</h3>
              {sessions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">{t.noData}</p>
              ) : (
                  sessions.map(session => {
                      const presentCount = session.attendance.filter(a => a.status === 'present').length;
                      const totalCount = session.attendance.length;
                      const rate = totalCount ? Math.round((presentCount / totalCount) * 100) : 0;
                      
                      const cycle = cycles.find(c => c.id === session.cycleId);
                      const displayClassName = cycle ? `${cycle.name} - ${session.className}` : session.className;
                      
                      return (
                          <Card key={session.id} onClick={() => { setCurrentSession(session); setViewMode('edit'); }} className="cursor-pointer hover:border-primary-500 transition-colors">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h4 className="font-bold text-lg">{displayClassName}</h4>
                                      <div className="text-sm text-gray-500 flex items-center gap-2">
                                          <Calendar size={14} /> {session.date}
                                          {session.time && <><Clock size={14} /> {session.time}</>}
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className={`text-lg font-bold ${rate < 50 ? 'text-red-500' : 'text-green-500'}`}>
                                          {rate}%
                                      </div>
                                      <div className="text-xs text-gray-400">{t.attendanceRate}</div>
                                  </div>
                              </div>
                              <div className="flex justify-end mt-2 pt-2 border-t dark:border-gray-700">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                                      className="text-red-500 p-2 hover:bg-red-50 rounded-full"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                              </div>
                          </Card>
                      );
                  })
              )}
          </div>
      </div>
  );
};

const DocumentsScreen = () => {
  const { t } = useContext(AppContext);
  const [docs, setDocs] = useState<DocumentFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewingFile, setViewingFile] = useState<DocumentFile | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentFile | null>(null);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const d = await API.getDocs();
    setDocs(d);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newDoc: DocumentFile = {
        id: crypto.randomUUID(),
        name: file.name,
        category: 'file',
        type: file.type,
        parentId: currentFolderId,
        dateAdded: new Date().toISOString().split('T')[0],
        size: (file.size / 1024).toFixed(1) + ' KB',
        contentBlob: file
      };
      await API.saveDoc(newDoc);
      loadDocs();
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const newFolder: DocumentFile = {
      id: crypto.randomUUID(),
      name: newFolderName.trim(),
      category: 'folder',
      type: 'folder',
      parentId: currentFolderId,
      dateAdded: new Date().toISOString().split('T')[0],
      size: '-'
    };
    await API.saveDoc(newFolder);
    setNewFolderName("");
    setShowNewFolder(false);
    loadDocs();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    // Recursive delete simulator
    const toDeleteIds = [deleteTarget.id];
    const findChildren = (pid: string) => {
        const children = docs.filter(d => d.parentId === pid);
        children.forEach(c => {
            toDeleteIds.push(c.id);
            if(c.category === 'folder') findChildren(c.id);
        });
    };
    if (deleteTarget.category === 'folder') findChildren(deleteTarget.id);

    for (const id of toDeleteIds) {
        await API.deleteDoc(id);
    }
    setDeleteTarget(null);
    loadDocs();
  };

  const filteredDocs = docs.filter(d => d.parentId === currentFolderId);
  const currentFolder = docs.find(d => d.id === currentFolderId);

  if (viewingFile) {
      return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <div className="flex justify-between items-center p-4 text-white bg-gray-900">
                  <h3 className="font-bold truncate">{viewingFile.name}</h3>
                  <button onClick={() => setViewingFile(null)}><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-hidden">
                  <SmartDocumentViewer file={viewingFile} />
              </div>
          </div>
      );
  }

  return (
      <div className="space-y-4">
          <ConfirmDeleteDialog 
            isOpen={!!deleteTarget} 
            onClose={() => setDeleteTarget(null)} 
            onConfirm={handleDelete}
            title={t.confirmDelete}
            message={deleteTarget?.category === 'folder' ? "Deleting a folder will delete all its contents." : undefined}
          />

          <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                  {currentFolderId && (
                      <Button variant="secondary" icon={ArrowLeft} onClick={() => setCurrentFolderId(currentFolder?.parentId || null)} className="!px-2" />
                  )}
                  <h1 className="text-2xl font-bold dark:text-white">{currentFolder ? currentFolder.name : t.root}</h1>
              </div>
              <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setShowNewFolder(true)} icon={FolderPlus} className="!px-3" />
                  <label className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                      <Upload size={20} />
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                  </label>
              </div>
          </div>
          
          {showNewFolder && (
            <Card className="flex gap-2 items-center p-2 animate-in fade-in slide-in-from-top-2">
                <Folder size={24} className="text-yellow-500" />
                <input 
                    autoFocus
                    className="flex-1 p-1 border-b border-primary-500 outline-none bg-transparent" 
                    placeholder={t.folderName}
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                />
                <button onClick={handleCreateFolder} className="text-green-500 hover:bg-green-50 p-1 rounded"><Check size={18}/></button>
                <button onClick={() => setShowNewFolder(false)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={18}/></button>
            </Card>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredDocs.length === 0 ? (
                  <div className="col-span-full py-10 text-center text-gray-400 flex flex-col items-center">
                      <Folder size={48} className="mb-2 opacity-20" />
                      <p>{t.emptyFolder}</p>
                  </div>
              ) : (
                  filteredDocs.map(doc => (
                      <Card key={doc.id} onClick={() => doc.category === 'folder' ? setCurrentFolderId(doc.id) : setViewingFile(doc)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors group relative">
                          <div className="flex flex-col items-center p-2 text-center space-y-2">
                              {doc.category === 'folder' ? (
                                  <Folder size={40} className="text-yellow-500 fill-yellow-50 dark:fill-yellow-900/20" />
                              ) : (
                                  <FileIcon size={40} className="text-blue-500 fill-blue-50 dark:fill-blue-900/20" />
                              )}
                              <span className="font-medium text-sm truncate w-full">{doc.name}</span>
                              <span className="text-xs text-gray-400">{doc.dateAdded} • {doc.size}</span>
                          </div>
                          <button 
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(doc); }}
                              className="absolute top-2 right-2 text-gray-300 group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                          >
                              <Trash2 size={16} />
                          </button>
                      </Card>
                  ))
              )}
          </div>
      </div>
  );
};

const SettingsScreen = () => {
  const { lang, setLang, theme, setTheme, t } = useContext(AppContext);

  return (
      <div className="space-y-6">
          <h1 className="text-2xl font-bold dark:text-white">{t.settings}</h1>
          
          <Card className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                  <Languages size={20} /> {t.language}
              </h3>
              <div className="flex gap-2">
                  <button 
                      onClick={() => setLang('fr')}
                      className={`flex-1 py-2 rounded-lg border-2 transition-colors ${lang === 'fr' ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                      Français
                  </button>
                  <button 
                      onClick={() => setLang('ar')}
                      className={`flex-1 py-2 rounded-lg border-2 transition-colors font-arabic ${lang === 'ar' ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                      العربية
                  </button>
              </div>
          </Card>

          <Card className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                  {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />} {t.theme}
              </h3>
              <div className="flex gap-2">
                  <button 
                      onClick={() => setTheme('light')}
                      className={`flex-1 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${theme === 'light' ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                      <Sun size={18} /> {t.lightMode}
                  </button>
                  <button 
                      onClick={() => setTheme('dark')}
                      className={`flex-1 py-2 rounded-lg border-2 transition-colors flex items-center justify-center gap-2 ${theme === 'dark' ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                      <Moon size={18} /> {t.darkMode}
                  </button>
              </div>
          </Card>
          
          <div className="text-center text-xs text-gray-400 mt-8 space-y-2">
              <p>v1.0.0</p>
              <p>© 2025 Gestion mes classes. All rights reserved.</p>
          </div>
      </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lang, setLang] = useState<'fr' | 'ar'>('fr');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // --- LIFTED STATE FOR DEEP LINKING ---
  // Students Tab State (controlled by App)
  const [selectedCycle, setSelectedCycle] = useState<CycleEntity | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(null);
  
  // Sessions Tab State (controlled by App)
  const [sessionToEdit, setSessionToEdit] = useState<Session | null>(null);

  const [stats, setStats] = useState<any>({});
  const [rawData, setRawData] = useState<any>(null); // For dashboard lists

  // Calculate stats whenever tab changes to dashboard or periodically
  const calculateStats = async () => {
    const students = await API.getStudents();
    const sessions = await API.getSessions();
    const classes = await API.getClasses();
    const cycles = await API.getCycles();
    
    // Store raw data for dashboard interactivity
    setRawData({ students, sessions, classes, cycles });

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    
    const sessionsThisMonth = sessions.filter(s => s.date.startsWith(currentMonth)).length;
    
    let totalAttendance = 0;
    let totalRecords = 0;
    
    // Calculate global attendance rate
    sessions.forEach(s => {
        s.attendance.forEach(a => {
            totalRecords++;
            if (a.status === 'present') totalAttendance++;
        });
    });
    const avgAttendance = totalRecords ? Math.round((totalAttendance / totalRecords) * 100) : 0;
    
    // Calculate per-student absences for "At Risk"
    const studentAbsences: Record<string, number> = {};
    sessions.forEach(s => {
        s.attendance.forEach(a => {
            if (a.status === 'absent') {
                studentAbsences[a.studentId] = (studentAbsences[a.studentId] || 0) + 1;
            }
        });
    });
    
    const atRiskStudents = students
        .filter(s => (studentAbsences[s.id] || 0) > 3)
        .map(s => ({
            ...s,
            absences: studentAbsences[s.id]
        }))
        .sort((a,b) => b.absences - a.absences)
        .slice(0, 5);
        
    // Cycle stats (simplified)
    const cycleStats = cycles.map(c => {
        const cycleSessions = sessions.filter(s => s.cycleId === c.id);
        return {
            name: c.name,
            sessionCount: cycleSessions.length,
            rate: 0 // Simplification
        };
    });

    setStats({
        totalStudents: students.length,
        sessionsCount: sessionsThisMonth,
        avgAttendance,
        classCount: classes.length,
        cycleStats,
        atRiskStudents
    });
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
        calculateStats();
    }
  }, [activeTab]);

  // --- NAVIGATION HANDLERS ---
  
  const handleNavigateClass = (cycle: CycleEntity | null, cls: ClassEntity) => {
      setSelectedCycle(cycle);
      setSelectedClass(cls);
      setActiveTab('students');
  };

  const handleNavigateSession = (session: Session) => {
      setSessionToEdit(session);
      setActiveTab('sessions');
  };

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, t: TRANSLATIONS[lang] }}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && (
            <Dashboard 
                stats={stats} 
                rawData={rawData} 
                onNavigateClass={handleNavigateClass}
                onNavigateSession={handleNavigateSession}
            />
        )}
        {activeTab === 'students' && (
            <StudentsScreen 
                selectedCycle={selectedCycle} 
                setSelectedCycle={setSelectedCycle}
                selectedClass={selectedClass}
                setSelectedClass={setSelectedClass}
            />
        )}
        {activeTab === 'sessions' && (
            <SessionsScreen 
                initialSession={sessionToEdit}
                onClearInitialSession={() => setSessionToEdit(null)}
            />
        )}
        {activeTab === 'docs' && <DocumentsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </Layout>
    </AppContext.Provider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);