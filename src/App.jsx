import { useState, useEffect, useRef } from 'react'
import { supabase } from './lib/supabase'
import { Plus, Flame, Calendar, Moon, Sun, Menu, ArrowLeft, Trash2, Edit2, CheckCircle, Circle, Save, Bold, List, X, AlertTriangle, BarChart2, BookOpen, Book, GraduationCap, Layout, Search, FileText, Download, File, Activity, ClipboardList, UserCircle, Underline } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
    return twMerge(clsx(inputs))
}

const PALETTE = [
    { grad: 'linear-gradient(135deg,#7a5c00,#ffd700,#b38600,#ffe87c,#7a5c00)', hex: '#c8a600', label: 'Oro' },
    { grad: 'linear-gradient(135deg,#5a5a5a,#e8e8e8,#9e9e9e,#ffffff,#5a5a5a)', hex: '#b0b0b0', label: 'Plata' },
    { grad: 'linear-gradient(135deg,#5c2800,#cd7f32,#8b4513,#e8a068,#5c2800)', hex: '#a05020', label: 'Bronce' },
    { grad: 'linear-gradient(135deg,#1a2e5c,#4a90d9,#1e4080,#79b8ff,#1a2e5c)', hex: '#1e4080', label: 'Acero' },
    { grad: 'linear-gradient(135deg,#003d20,#00e676,#00692f,#69ffa8,#003d20)', hex: '#006b30', label: 'Esmeralda' },
    { grad: 'linear-gradient(135deg,#5c0000,#e60026,#8b0000,#ff5566,#5c0000)', hex: '#8b0000', label: 'Rubí' },
    { grad: 'linear-gradient(135deg,#2d0060,#9b59b6,#4b0082,#cc88ff,#2d0060)', hex: '#4b0082', label: 'Amatista' },
    { grad: 'linear-gradient(135deg,#1a1a1a,#6e6e6e,#2a2a2a,#aaaaaa,#1a1a1a)', hex: '#303030', label: 'Titanio' },
]

const COLORS = {
    GREEN: PALETTE[4],
    YELLOW: PALETTE[0],
    RED: PALETTE[5]
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const BOLD_MAP = {
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': 'Ｊ', 'K': 'Ｋ', 'L': 'Ｌ', 'M': 'Ｍ', 'N': 'Ｎ', 'O': 'Ｏ', 'P': 'Ｐ', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': 'Ｖ', 'W': 'Ｗ', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
}
const REVERSE_BOLD_MAP = Object.fromEntries(Object.entries(BOLD_MAP).map(([k, v]) => [v, k]))
const STRIKE = '\u0336'
const UNDERLINE = '\u0332'

export default function App() {
    const [habits, setHabits] = useState(() => JSON.parse(localStorage.getItem('habitos_h') || '[]'))
    const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('habitos_n') || '[]'))
    const [activities, setActivities] = useState(() => JSON.parse(localStorage.getItem('mindtrack_activities') || '[]'))
    const [perfectDays, setPerfectDays] = useState(() => new Set(JSON.parse(localStorage.getItem('habitos_pd') || '[]')))
    const [isDark, setIsDark] = useState(() => localStorage.getItem('habitos_theme') !== 'light')
    const [activePage, setActivePage] = useState('habitos')
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
    const [authData, setAuthData] = useState({ email: '', password: '', fullName: '' })
    const [authError, setAuthError] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [habitFilter, setHabitFilter] = useState('all')
    const [currentNote, setCurrentNote] = useState({ title: '', body: '', grad: COLORS.GREEN.grad, hex: COLORS.GREEN.hex })
    const [currentActivity, setCurrentActivity] = useState({ title: '', body: '', grad: COLORS.GREEN.grad, hex: COLORS.GREEN.hex })
    const [editingNoteId, setEditingNoteId] = useState(null)
    const [editingActivityId, setEditingActivityId] = useState(null)
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false)
    const [newHabit, setNewHabit] = useState({ name: '', days: [], grad: PALETTE[0].grad, hex: PALETTE[0].hex })
    const [editingHabitId, setEditingHabitId] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, type: null, name: '', data: null })
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [currentCalDate, setCurrentCalDate] = useState(new Date())
    const [agendaEvents, setAgendaEvents] = useState(() => JSON.parse(localStorage.getItem('mindtrack_agenda') || '{}'))
    const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false)
    const [selectedAgendaDay, setSelectedAgendaDay] = useState(null)
    const [currentReminder, setCurrentReminder] = useState({ text: '', hex: PALETTE[0].hex, grad: PALETTE[0].grad })
    const [agendaCalDate, setAgendaCalDate] = useState(new Date())

    // Search queries
    const [noteSearchQuery, setNoteSearchQuery] = useState("")
    const [readingSearchQuery, setReadingSearchQuery] = useState("")
    const [activityPriorityFilter, setActivityPriorityFilter] = useState(null)

    // Reading section states
    const [readingCategories, setReadingCategories] = useState(() => {
        const saved = localStorage.getItem('reading_cats')
        return saved ? JSON.parse(saved) : ["Educativo", "Para mi"]
    })
    const [selectedReadingCat, setSelectedReadingCat] = useState(() => localStorage.getItem('selected_reading_cat') || "Educativo")
    const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false)
    const [newCatName, setNewCatName] = useState("")
    const [editingCatIndex, setEditingCatIndex] = useState(null)

    // PDF Management
    const [readingFiles, setReadingFiles] = useState(() => JSON.parse(localStorage.getItem('reading_files') || '[]'))
    const [isEditFileNameModalOpen, setIsEditFileNameModalOpen] = useState(false)
    const [editingFileId, setEditingFileId] = useState(null)
    const [newFileName, setNewFileName] = useState("")

    const fileInputRef = useRef(null)
    const textareaRef = useRef(null)
    const selectionRef = useRef({ start: 0, end: 0 })

    const handleSelect = (e) => {
        selectionRef.current = { start: e.target.selectionStart, end: e.target.selectionEnd }
    }

    useEffect(() => { localStorage.setItem('habitos_h', JSON.stringify(habits)) }, [habits])
    useEffect(() => { localStorage.setItem('habitos_n', JSON.stringify(notes)) }, [notes])
    useEffect(() => { localStorage.setItem('mindtrack_activities', JSON.stringify(activities)) }, [activities])
    useEffect(() => { localStorage.setItem('habitos_pd', JSON.stringify([...perfectDays])) }, [perfectDays])
    useEffect(() => { localStorage.setItem('reading_cats', JSON.stringify(readingCategories)) }, [readingCategories])
    useEffect(() => { localStorage.setItem('reading_files', JSON.stringify(readingFiles)) }, [readingFiles])
    useEffect(() => { localStorage.setItem('selected_reading_cat', selectedReadingCat) }, [selectedReadingCat])
    useEffect(() => { localStorage.setItem('mindtrack_agenda', JSON.stringify(agendaEvents)) }, [agendaEvents])

    useEffect(() => {
        localStorage.setItem('habitos_theme', isDark ? 'dark' : 'light')
        if (isDark) {
            document.documentElement.classList.add('dark')
            document.documentElement.classList.remove('light')
        } else {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
        }
    }, [isDark])

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user || null)
            setIsLoading(false)
        }
        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    const fetchUserData = async () => {
        if (!user) return

        const [
            { data: dbHabits },
            { data: dbPerfectDays },
            { data: dbNotes },
            { data: dbActivities },
            { data: dbAgenda },
            { data: dbCategories },
            { data: dbFiles }
        ] = await Promise.all([
            supabase.from('habits').select('*').order('created_at', { ascending: true }),
            supabase.from('perfect_days').select('date'),
            supabase.from('notes').select('*').order('created_at', { ascending: false }),
            supabase.from('activities').select('*').order('created_at', { ascending: false }),
            supabase.from('agenda').select('*'),
            supabase.from('reading_categories').select('*'),
            supabase.from('reading_files').select('*')
        ])

        if (dbHabits) setHabits(dbHabits)
        if (dbPerfectDays) setPerfectDays(new Set(dbPerfectDays.map(d => d.date)))
        if (dbNotes) setNotes(dbNotes)
        if (dbActivities) setActivities(dbActivities)
        if (dbAgenda) {
            const agendaObj = {}
            dbAgenda.forEach(item => { agendaObj[item.date] = { text: item.text, grad: item.grad, hex: item.hex } })
            setAgendaEvents(agendaObj)
        }
        const defaultCats = ["Educativo", "Para mi"]
        const serverCats = dbCategories ? dbCategories.map(c => c.name) : []
        // Fusión sin duplicados: predeterminadas + servidor
        const mergedCats = Array.from(new Set([...defaultCats, ...serverCats]))
        setReadingCategories(mergedCats)
        if (dbFiles) {
            // Combinamos archivos de la DB con locales que aún no se hayan subido (ids temporales)
            setReadingFiles(prev => {
                const localOnly = prev.filter(f => typeof f.id === 'number' && f.id > 1000000000000) // Filtro simple para IDs de Date.now()
                const dbIds = new Set(dbFiles.map(f => f.id))
                return [...dbFiles, ...localOnly.filter(f => !dbIds.has(f.id))]
            })
        }
    }

    const handleAuth = async (e) => {
        e.preventDefault()
        setAuthError(null)

        // Usamos el nombre de usuario como identificador único para permitir correos repetidos
        const identifier = `${authData.fullName.trim().toLowerCase()}@mindtrack.user`

        if (authMode === 'signup') {
            if (authData.password.length < 6) {
                setAuthError("La contraseña debe tener al menos 6 caracteres")
                return
            }
            if (!authData.fullName.trim()) {
                setAuthError("El nombre de usuario es obligatorio")
                return
            }

            const { data, error } = await supabase.auth.signUp({
                email: identifier,
                password: authData.password,
                options: {
                    data: {
                        full_name: authData.fullName,
                        real_email: authData.email
                    }
                }
            })

            if (error) {
                if (error.message.includes("User already registered")) {
                    setAuthError("Este nombre de usuario ya está en uso. Por favor elige otro.")
                } else if (error.message.includes("Email rate limit exceeded")) {
                    setAuthError("Límite de correos excedido. Si eres el administrador, desactiva 'Confirm Email' en el Dashboard de Supabase para registrarte instantáneamente.")
                } else {
                    setAuthError(error.message)
                }
            } else {
                setShowSuccessModal(true)
                setAuthData({ email: '', password: '', fullName: '' })
            }
        } else {
            // Para el login el usuario pone su NOMBRE en el campo email o fullName
            // Asumimos que el usuario sabe que entra con su nombre
            const loginUsername = authData.fullName || authData.email.split('@')[0]
            const loginIdentifier = `${loginUsername.trim().toLowerCase()}@mindtrack.user`

            const { error } = await supabase.auth.signInWithPassword({
                email: loginIdentifier,
                password: authData.password
            })

            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    setAuthError("Usuario o contraseña incorrectos.")
                } else {
                    setAuthError(error.message)
                }
            } else {
                setIsAuthModalOpen(false)
                setIsAccountModalOpen(false)
                setActivePage('habitos')
                setAuthData({ email: '', password: '', fullName: '' })
            }
        }
    }

    const toggleHabit = async (id) => {
        const h = habits.find(x => x.id === id)
        const updatedHabits = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h)
        setHabits(updatedHabits)

        if (user) {
            await supabase.from('habits').update({ completed: !h.completed }).eq('id', id)
            updatePerfectDays(updatedHabits)
        } else {
            updatePerfectDays(updatedHabits)
        }
    }

    const toggleNoteDone = async (id) => {
        const newNotes = notes.map(n => n.id === id ? { ...n, done: !n.done } : n)
        setNotes(newNotes)
        if (user) await supabase.from('notes').update({ done: !notes.find(n => n.id === id).done }).eq('id', id)
    }

    const toggleActivityDone = async (id) => {
        const newActivities = activities.map(a => a.id === id ? { ...a, done: !a.done } : a)
        setActivities(newActivities)
        if (user) await supabase.from('activities').update({ done: !activities.find(a => a.id === id).done }).eq('id', id)
    }

    const executeDelete = async () => {
        if (user) {
            if (deleteConfirm.type === 'habit') {
                await supabase.from('habits').delete().eq('id', deleteConfirm.id)
            } else if (deleteConfirm.type === 'note') {
                await supabase.from('notes').delete().eq('id', deleteConfirm.id)
            } else if (deleteConfirm.type === 'activity') {
                await supabase.from('activities').delete().eq('id', deleteConfirm.id)
            } else if (deleteConfirm.type === 'agenda_reminder') {
                await supabase.from('agenda').delete().match({ user_id: user.id, date: deleteConfirm.id })
            } else if (deleteConfirm.type === 'reading_cat') {
                await supabase.from('reading_categories').delete().eq('user_id', user.id).eq('name', deleteConfirm.name)
            } else if (deleteConfirm.type === 'pdf_file') {
                await supabase.from('reading_files').delete().eq('id', deleteConfirm.id)
            }
        }

        // Retrocompatibilidad local
        if (deleteConfirm.type === 'habit') {
            const newHabits = habits.filter(h => h.id !== deleteConfirm.id)
            setHabits(newHabits)
            updatePerfectDays(newHabits)
        } else if (deleteConfirm.type === 'note') {
            setNotes(notes.filter(n => n.id !== deleteConfirm.id))
        } else if (deleteConfirm.type === 'activity') {
            setActivities(activities.filter(a => a.id !== deleteConfirm.id))
        } else if (deleteConfirm.type === 'reading_cat') {
            const index = deleteConfirm.id;
            const catToDelete = readingCategories[index];
            const newCats = readingCategories.filter((_, i) => i !== index);
            setReadingCategories(newCats);
            if (selectedReadingCat === catToDelete) {
                setSelectedReadingCat(newCats.length > 0 ? newCats[0] : "");
            }
        } else if (deleteConfirm.type === 'pdf_file') {
            setReadingFiles(readingFiles.filter(f => f.id !== deleteConfirm.id))
        } else if (deleteConfirm.type === 'agenda_reminder') {
            const newEvents = { ...agendaEvents }
            delete newEvents[deleteConfirm.id]
            setAgendaEvents(newEvents)
            setIsAgendaModalOpen(false)
        }
        setDeleteConfirm({ isOpen: false, id: null, type: null, name: '' })
    }

    const openDeleteConfirm = (id, type, name) => {
        setDeleteConfirm({ isOpen: true, id, type, name })
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0]
        if (!file || file.type !== 'application/pdf') return alert("Por favor, selecciona un archivo PDF válido")

        const reader = new FileReader()
        reader.onload = async (event) => {
            const tempId = Date.now()
            const isoDate = new Date().toISOString().split('T')[0]
            const fileData = {
                id: tempId,
                name: file.name,
                category: selectedReadingCat,
                data: event.target.result,
                date: isoDate
            }

            // Actualización optimista local
            setReadingFiles(prev => [...prev, fileData])

            if (user) {
                try {
                    const { data, error } = await supabase.from('reading_files').insert([{
                        user_id: user.id,
                        name: fileData.name,
                        category: fileData.category,
                        file_url: fileData.data,
                        file_name_storage: file.name,
                        date: fileData.date
                    }]).select()
                    if (error) {
                        if (error.message.includes("payload too large")) {
                            alert("El archivo es demasiado grande para guardarse en la nube. Se guardará solo localmente en este dispositivo.")
                        } else {
                            throw error
                        }
                    }

                    if (data && data[0]) {
                        // Reemplazamos el temporal con el real de la DB
                        setReadingFiles(prev => prev.map(f => f.id === tempId ? data[0] : f))
                    }
                } catch (err) {
                    console.error("Error al subir archivo:", err)
                    alert("Error al sincronizar con Supabase. El archivo se mantendrá solo localmente.")
                }
            }
        }
        reader.readAsDataURL(file)
        e.target.value = ""
    }

    const downloadFile = (file) => {
        const link = document.createElement('a')
        link.href = file.file_url || file.data
        link.download = file.name
        link.click()
    }

    const openPdf = (file) => {
        const fileUrl = file.file_url || file.data;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && fileUrl.startsWith('data:')) {
            try {
                const arr = fileUrl.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                const blob = new Blob([u8arr], { type: mime });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.click();

                setTimeout(() => URL.revokeObjectURL(url), 2000);
            } catch (err) {
                console.error("Error convirtiendo PDF, forzando descarga:", err);
                downloadFile(file);
            }
        } else if (isMobile) {
            window.open(fileUrl, '_blank');
        } else {
            const win = window.open();
            if (win) {
                win.document.write(`<iframe src="${fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            } else {
                alert("Habilita las ventanas emergentes (pop-ups) en tu navegador para ver el PDF.");
            }
        }
    }

    const saveHabit = async () => {
        if (!newHabit.name.trim()) return alert('Nombre obligatorio')
        if (newHabit.days.length === 0) return alert('Selecciona días')

        let savedHabit;
        if (user) {
            const habitData = { ...newHabit, user_id: user.id, completed: false }
            if (editingHabitId) {
                const { data } = await supabase.from('habits').update(newHabit).eq('id', editingHabitId).select()
                savedHabit = data[0]
            } else {
                const { data } = await supabase.from('habits').insert([habitData]).select()
                savedHabit = data[0]
            }
        }

        if (editingHabitId) {
            setHabits(habits.map(h => h.id === editingHabitId ? (savedHabit || { ...h, ...newHabit }) : h))
        } else {
            const h = savedHabit || { id: Date.now(), ...newHabit, completed: false }
            setHabits([...habits, h])
        }
        setIsHabitModalOpen(false)
        setEditingHabitId(null)
        setNewHabit({ name: '', days: [], grad: PALETTE[0].grad, hex: PALETTE[0].hex })
    }

    const saveReadingCategory = async () => {
        if (!newCatName.trim()) return alert("Ingresa un nombre para la sección")

        if (user) {
            try {
                if (editingCatIndex !== null) {
                    const oldName = readingCategories[editingCatIndex];
                    const { error } = await supabase.from('reading_categories').update({ name: newCatName.trim() }).eq('user_id', user.id).eq('name', oldName)
                    if (error) throw error
                } else {
                    const { error } = await supabase.from('reading_categories').insert([{ user_id: user.id, name: newCatName.trim() }])
                    if (error) throw error
                }
            } catch (err) {
                console.error("Error al guardar categoría:", err)
                return alert("No se pudo guardar la sección en la nube.")
            }
        }

        if (editingCatIndex !== null) {
            const oldName = readingCategories[editingCatIndex];
            const newCats = [...readingCategories];
            newCats[editingCatIndex] = newCatName.trim();
            setReadingCategories(newCats);
            setReadingFiles(readingFiles.map(f => f.category === oldName ? { ...f, category: newCatName.trim() } : f));
            if (selectedReadingCat === oldName) setSelectedReadingCat(newCatName.trim());
        } else {
            if (readingCategories.includes(newCatName.trim())) return alert("Esta sección ya existe")
            setReadingCategories([...readingCategories, newCatName.trim()])
        }

        setNewCatName("")
        setEditingCatIndex(null)
        setIsNewCatModalOpen(false)
    }

    const saveFileName = async () => {
        if (!newFileName.trim()) return alert("El nombre no puede estar vacío")
        const finalName = newFileName.trim().endsWith('.pdf') ? newFileName.trim() : newFileName.trim() + '.pdf';

        if (user) {
            await supabase.from('reading_files').update({ name: finalName }).eq('id', editingFileId)
        }

        setReadingFiles(readingFiles.map(f => f.id === editingFileId ? { ...f, name: finalName } : f))
        setIsEditFileNameModalOpen(false)
        setNewFileName("")
        setEditingFileId(null)
    }

    const saveAgendaReminder = async () => {
        if (!currentReminder.text.trim()) return alert("Escribe un recordatorio")

        if (user) {
            await supabase.from('agenda').upsert({
                user_id: user.id,
                date: selectedAgendaDay,
                text: currentReminder.text,
                grad: currentReminder.grad,
                hex: currentReminder.hex
            })
        }

        setAgendaEvents({ ...agendaEvents, [selectedAgendaDay]: currentReminder })
        setIsAgendaModalOpen(false)
    }

    const updatePerfectDays = async (currentHabits) => {
        const today = new Date().toISOString().split('T')[0]
        const allDone = currentHabits.length > 0 && currentHabits.every(h => h.completed)
        const newPerfectDays = new Set(perfectDays)

        if (allDone) {
            newPerfectDays.add(today)
            if (user) await supabase.from('perfect_days').upsert({ user_id: user.id, date: today })
        } else {
            newPerfectDays.delete(today)
            if (user) await supabase.from('perfect_days').delete().match({ user_id: user.id, date: today })
        }
        setPerfectDays(newPerfectDays)
    }

    const saveNote = async () => {
        let savedNote;
        if (user) {
            const noteData = {
                user_id: user.id,
                title: currentNote.title,
                body: currentNote.body,
                grad: currentNote.grad,
                hex: currentNote.hex,
                done: editingNoteId ? notes.find(n => n.id === editingNoteId).done : false
            }
            if (editingNoteId) {
                const { data } = await supabase.from('notes').update(noteData).eq('id', editingNoteId).select()
                savedNote = data[0]
            } else {
                const { data } = await supabase.from('notes').insert([noteData]).select()
                savedNote = data[0]
            }
        }

        const noteData = savedNote || {
            ...currentNote,
            id: editingNoteId || Date.now(),
            done: editingNoteId ? notes.find(n => n.id === editingNoteId).done : false
        }
        if (editingNoteId) {
            setNotes(notes.map(n => n.id === editingNoteId ? noteData : n))
        } else {
            setNotes([noteData, ...notes])
        }
        setActivePage('notes')
    }

    const saveActivity = async () => {
        let savedActivity;
        if (user) {
            const activityData = {
                user_id: user.id,
                title: currentActivity.title,
                grad: currentActivity.grad,
                hex: currentActivity.hex,
                done: editingActivityId ? activities.find(a => a.id === editingActivityId).done : false
            }
            if (editingActivityId) {
                const { data } = await supabase.from('activities').update(activityData).eq('id', editingActivityId).select()
                savedActivity = data[0]
            } else {
                const { data } = await supabase.from('activities').insert([activityData]).select()
                savedActivity = data[0]
            }
        }

        const activityData = savedActivity || {
            ...currentActivity,
            id: editingActivityId || Date.now(),
            done: editingActivityId ? activities.find(a => a.id === editingActivityId).done : false
        }
        if (editingActivityId) {
            setActivities(activities.map(a => a.id === editingActivityId ? activityData : a))
        } else {
            setActivities([activityData, ...activities])
        }
        setActivePage('actividades')
    }

    const applyFmt = (type, target) => {
        const ta = textareaRef.current
        if (!ta) return

        let start = ta.selectionStart
        let end = ta.selectionEnd

        // Respaldo móvil: si se vació la selección por perder el foco, usamos la última selección conocida
        if (start === end && selectionRef.current.start !== selectionRef.current.end) {
            start = selectionRef.current.start
            end = selectionRef.current.end
        }

        // Ajuste móvil: si se seleccionó texto con un espacio final (común en Android/iOS), lo ignoramos del formato para no corromper la selección.
        const originalVal = ta.value;
        if (start !== end && originalVal[end - 1] === ' ' && type !== 'list') {
            end--;
        }

        if (type === 'list') {
            while (start > 0 && originalVal[start - 1] !== '\n') start--;
            while (end < originalVal.length && originalVal[end] !== '\n') end++;
        }

        const sel = originalVal.substring(start, end)
        const before = originalVal.substring(0, start)
        const after = originalVal.substring(end)

        if (!sel && type !== 'list') return

        let res = sel

        if (type === 'bold') {
            const chars = Array.from(sel)
            const isAllBold = chars.every(ch => ' \n\t\r'.includes(ch) || !!REVERSE_BOLD_MAP[ch] || ch === STRIKE || ch === UNDERLINE)
            res = chars.map(ch => isAllBold ? (REVERSE_BOLD_MAP[ch] || ch) : (BOLD_MAP[ch] || ch)).join('')
        } else if (type === 'strike') {
            const hasStrike = sel.includes(STRIKE)
            res = sel.split(STRIKE).join('')
            if (!hasStrike) {
                res = Array.from(res).map(ch => {
                    if (ch === '\n' || ch === '\r' || ch === UNDERLINE || ch === STRIKE) return ch
                    return ch + STRIKE
                }).join('')
            }
        } else if (type === 'underline') {
            const hasUnderline = sel.includes(UNDERLINE)
            res = sel.split(UNDERLINE).join('')
            if (!hasUnderline) {
                res = Array.from(res).map(ch => {
                    if (ch === '\n' || ch === '\r' || ch === STRIKE || ch === UNDERLINE) return ch
                    return ch + UNDERLINE
                }).join('')
            }
        } else if (type === 'list') {
            const lines = sel.split('\n')
            const isAllList = lines.every(l => l.startsWith('• ') || l.trim() === '')
            res = isAllList
                ? lines.map(l => l.startsWith('• ') ? l.substring(2) : l).join('\n')
                : lines.map(l => (l.startsWith('• ') || l.trim() === '') ? l : '• ' + l).join('\n')
        }

        // Si se excluyó un espacio al final por el ajuste móvil, lo re-agregamos al "after"
        let finalAfter = after;
        if (ta.selectionEnd !== end && type !== 'list') {
            finalAfter = ' ' + finalAfter.substring(1);
        }

        const finalContent = before + res + finalAfter
        if (target === 'note') setCurrentNote({ ...currentNote, body: finalContent })
        else setCurrentActivity({ ...currentActivity, body: finalContent })

        // Actualizamos el respaldo por si se presiona otro botón de formato en cadena
        const newStart = start;
        const newEnd = start + res.length + (ta.selectionEnd !== end && type !== 'list' ? 1 : 0);
        selectionRef.current = { start: newStart, end: newEnd };

        setTimeout(() => {
            ta.focus()
            ta.setSelectionRange(newStart, newEnd)
        }, 50) // Incrementamos el timeout a 50ms para teclados móviles virtuales
    }

    const getNotePriorityCount = (grad) => notes.filter(n => n.grad === grad && !n.done).length
    const getActivityPriorityCount = (grad) => activities.filter(a => a.grad === grad && !a.done).length

    const getStreak = () => {
        let streak = 0
        let checkDate = new Date()
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0]
            if (perfectDays.has(dateStr)) {
                streak++
                checkDate.setDate(checkDate.getDate() - 1)
            } else {
                break
            }
        }
        return streak
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">Sincronizando MindTrack...</span>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0f0f14] to-[#0f0f14]">
                <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-500">
                    <div className="space-y-2">
                        <div className="w-20 h-20 bg-indigo-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8 rotate-12">
                            <Layout size={40} className="text-white -rotate-12" />
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white mb-2">MindTrack</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tu mente, organizada. Tu progreso, asegurado.</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-indigo-500 mb-8">
                            {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h2>

                        <form onSubmit={handleAuth} className="space-y-5">
                            {authMode === 'login' ? (
                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Nombre de Usuario</label>
                                    <input required type="text" placeholder="Tu nombre de usuario"
                                        className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm text-white"
                                        value={authData.fullName} onChange={e => setAuthData({ ...authData, fullName: e.target.value })} />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Nombre de Usuario (Único)</label>
                                        <input required type="text" placeholder="Ej: AlexM"
                                            className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm text-white"
                                            value={authData.fullName} onChange={e => setAuthData({ ...authData, fullName: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Correo (Puede ser repetido)</label>
                                        <input type="email" placeholder="tu@ejemplo.com"
                                            className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm text-white"
                                            value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} />
                                    </div>
                                </>
                            )}
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Contraseña</label>
                                <input required type="password" placeholder="Mínimo 6 caracteres"
                                    className="w-full bg-white/5 border border-white/5 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm text-white"
                                    value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} />
                            </div>

                            {authError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce">{authError}</p>}

                            <button type="submit" className="w-full py-5 bg-indigo-500 text-white rounded-2xl font-black tracking-[0.2em] shadow-xl shadow-indigo-500/30 uppercase text-xs active:scale-95 transition-all mt-4">
                                {authMode === 'login' ? 'ENTRAR' : 'REGISTRARME Y GUARDAR'}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(null); }} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-500 transition-colors">
                                {authMode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f0f14] text-black dark:text-white transition-colors duration-300">
            <header className="sticky top-0 z-[100] bg-white/80 dark:bg-[#0f0f14]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 md:hidden text-gray-400 hover:text-indigo-500 transition-colors">
                        <Menu size={24} />
                    </button>
                    <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-full border border-indigo-500/5">
                        <button onClick={() => setActivePage('agenda')} className={cn("p-2 rounded-full transition-all", activePage === 'agenda' ? "text-white bg-indigo-500 shadow-md" : "text-gray-400 hover:text-indigo-500")} title="Agenda"><ClipboardList size={18} /></button>
                        <button onClick={() => setActivePage('habitos')} className={cn("p-2 rounded-full transition-all", activePage === 'habitos' ? "text-white bg-indigo-500 shadow-md" : "text-gray-400 hover:text-indigo-500")} title="Hábitos"><Flame size={18} /></button>
                        <button onClick={() => setActivePage('notes')} className={cn("p-2 rounded-full transition-all", activePage === 'notes' ? "text-white bg-indigo-500 shadow-md" : "text-gray-400 hover:text-indigo-500")} title="Notas"><FileText size={18} /></button>
                        <button onClick={() => setActivePage('lectura')} className={cn("p-2 rounded-full transition-all", activePage === 'lectura' ? "text-white bg-indigo-500 shadow-md" : "text-gray-400 hover:text-indigo-500")} title="Lectura"><BookOpen size={18} /></button>
                        <button onClick={() => setActivePage('actividades')} className={cn("p-2 rounded-full transition-all", activePage === 'actividades' ? "text-white bg-indigo-500 shadow-md" : "text-gray-400 hover:text-indigo-500")} title="Actividades"><Activity size={18} /></button>
                    </div>
                    <div className="md:hidden flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center rotate-12 shadow-lg shadow-indigo-500/20">
                            <Layout size={18} className="text-white -rotate-12" />
                        </div>
                    </div>
                </div>

                <h1 className="text-sm md:text-lg font-black tracking-tight uppercase italic text-center flex-1 truncate px-2">
                    {activePage === 'habitos' && 'MIS HÁBITOS'}
                    {activePage === 'notes' && 'NOTAS'}
                    {activePage === 'lectura' && 'LECTURA'}
                    {activePage === 'actividades' && 'ACTIVIDADES'}
                    {activePage === 'agenda' && 'AGENDA'}
                    {activePage === 'editor' && 'EDITOR DE NOTA'}
                    {activePage === 'editor_act' && 'EDITOR DE ACTIVIDAD'}
                </h1>

                <div className="flex gap-1 md:gap-2 justify-end items-center">
                    <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-transform active:scale-90">
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    {(activePage === 'habitos' || activePage === 'notes' || activePage === 'actividades') && (
                        <button
                            onClick={() => {
                                if (activePage === 'habitos') { setEditingHabitId(null); setNewHabit({ name: '', days: [], grad: PALETTE[0].grad, hex: PALETTE[0].hex }); setIsHabitModalOpen(true); }
                                else if (activePage === 'notes') { setEditingNoteId(null); setCurrentNote({ title: '', body: '', grad: COLORS.GREEN.grad, hex: COLORS.GREEN.hex }); setActivePage('editor'); }
                                else if (activePage === 'actividades') { setEditingActivityId(null); setCurrentActivity({ title: '', body: '', grad: COLORS.GREEN.grad, hex: COLORS.GREEN.hex }); setActivePage('editor_act'); }
                            }}
                            className="p-2 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 active:scale-90"
                        >
                            <Plus size={20} />
                        </button>
                    )}
                    <button
                        onClick={() => setIsAccountModalOpen(true)}
                        className={cn("p-2 rounded-full transition-all active:scale-90", user ? "text-indigo-500 bg-indigo-500/10" : "text-gray-400 hover:bg-black/5 dark:hover:bg-white/5")}
                    >
                        <UserCircle size={22} strokeWidth={2.5} />
                    </button>
                </div>
            </header>

            {/* MOBILE MENU DRAWER */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[150] md:hidden animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0f0f14] shadow-2xl p-8 flex flex-col animate-in slide-in-from-left duration-500 border-r border-indigo-500/10">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center rotate-12 shadow-lg shadow-indigo-500/20">
                                    <Layout size={24} className="text-white -rotate-12" />
                                </div>
                                <span className="text-2xl font-black italic tracking-tighter uppercase text-indigo-900 dark:text-white">MindTrack</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500"><X size={20} /></button>
                        </div>

                        <nav className="space-y-4 flex-1">
                            {[
                                { id: 'agenda', icon: <ClipboardList size={22} />, label: 'Agenda' },
                                { id: 'habitos', icon: <Flame size={22} />, label: 'Mis Hábitos' },
                                { id: 'notes', icon: <FileText size={22} />, label: 'Notas' },
                                { id: 'lectura', icon: <BookOpen size={22} />, label: 'Lectura' },
                                { id: 'actividades', icon: <Activity size={22} />, label: 'Actividades' },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActivePage(item.id); setIsMobileMenuOpen(false); }}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all",
                                        activePage === item.id ? "bg-indigo-500 text-white shadow-xl translate-x-1" : "text-gray-400 hover:bg-indigo-500/5 hover:text-indigo-500"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="pt-8 border-t border-indigo-500/5 space-y-4">
                            <button onClick={() => { setIsDark(!isDark); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-gray-400">
                                {isDark ? <Sun size={22} /> : <Moon size={22} />}
                                {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                            </button>
                            {user && (
                                <div className="p-5 bg-indigo-500/5 rounded-[1.5rem] border border-indigo-500/10">
                                    <p className="text-[8px] font-black uppercase opacity-40 mb-1 tracking-widest text-indigo-500">Sesión iniciada como</p>
                                    <p className="text-xs font-black truncate text-indigo-900 dark:text-white uppercase italic">{user.user_metadata?.full_name || user.email}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <main className={cn("mx-auto p-5 pb-20 transition-all duration-500", activePage === 'lectura' ? "max-w-4xl" : (activePage === 'habitos' ? "max-w-4xl" : "max-w-xl"))}>
                {activePage === 'habitos' && (
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* DASHBOARD LATERAL */}
                        <div className="w-full md:w-72 shrink-0 space-y-6">
                            <div className="bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-8 border border-indigo-500/10 shadow-inner relative overflow-hidden group">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/50 mb-6 text-center">Progreso Diario</h2>

                                <div className="relative flex items-center justify-center mb-6">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-white/5" />
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 58}
                                            strokeDashoffset={2 * Math.PI * 58 * (1 - (habits.length > 0 ? habits.filter(h => h.completed).length / habits.length : 0))}
                                            strokeLinecap="round" className="text-indigo-500 transition-all duration-1000 ease-out" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-indigo-900 dark:text-white">{habits.length > 0 ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100) : 0}%</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Completado</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-white dark:bg-white/5 p-4 rounded-2xl border border-indigo-500/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500"><BarChart2 size={16} /></div>
                                            <span className="text-[10px] font-black uppercase tracking-tight opacity-60">Total</span>
                                        </div>
                                        <span className="text-lg font-black">{habits.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white dark:bg-white/5 p-4 rounded-2xl border border-indigo-500/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500"><Flame size={16} /></div>
                                            <span className="text-[10px] font-black uppercase tracking-tight opacity-60">Récord</span>
                                        </div>
                                        <span className="text-lg font-black">{perfectDays.size}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LISTA DE HÁBITOS */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="flex justify-center bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                                {['all', 'done', 'todo'].map(f => (
                                    <button key={f} onClick={() => setHabitFilter(f)}
                                        className={cn("flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest",
                                            habitFilter === f ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "text-gray-400 dark:text-gray-500")}
                                    >{f === 'all' ? 'Todos' : f === 'done' ? 'Completas' : 'Incompletas'}</button>
                                ))}
                            </div>
                            <div className="grid gap-3">
                                {habits.filter(h => habitFilter === 'all' || (habitFilter === 'done' ? h.completed : !h.completed)).map(habit => (
                                    <div key={habit.id} className={cn("relative overflow-hidden p-4 rounded-2xl border border-white/10 shadow-xl transition-all", habit.completed ? "opacity-30 scale-[0.97]" : "hover:-translate-y-1 hover:shadow-2xl")}
                                        style={{ background: habit.grad || habit.color }}>
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-black text-white text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] uppercase tracking-tight italic">{habit.name}</h3>
                                                <div className="flex gap-1 mt-2">{habit.days.map(d => <span key={d} className="text-[6.5px] md:text-[8px] font-black px-1 md:px-1.5 py-[2px] md:py-0.5 rounded bg-black/30 text-white border border-white/10 uppercase">{d}</span>)}</div>
                                            </div>
                                            <div className="flex gap-1 items-center">
                                                <button onClick={() => toggleHabit(habit.id)} className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all">{habit.completed ? <CheckCircle size={22} /> : <Circle size={22} />}</button>
                                                <button onClick={() => { setEditingHabitId(habit.id); setNewHabit({ ...habit }); setIsHabitModalOpen(true); }} className="p-2 text-white/70 hover:text-white"><Edit2 size={16} /></button>
                                                <button onClick={() => openDeleteConfirm(habit.id, 'habit', habit.name)} className="p-2 text-white/50 hover:text-white"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {habits.length === 0 && <div className="text-center py-20 opacity-20 uppercase font-black text-sm tracking-widest">Nada por aquí</div>}
                            </div>
                        </div>
                    </div>
                )}

                {activePage === 'notes' && (
                    <div className="space-y-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="BUSCAR NOTA POR TÍTULO..."
                                className="w-full bg-gray-100 dark:bg-white/5 border border-indigo-500/10 py-5 px-6 pl-14 rounded-[2rem] outline-none focus:border-indigo-500 font-black uppercase text-[10px] tracking-widest transition-all shadow-inner group-hover:bg-gray-200/50 dark:group-hover:bg-white/10"
                                value={noteSearchQuery}
                                onChange={e => setNoteSearchQuery(e.target.value)}
                            />
                            <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500/50 group-hover:text-indigo-500 transition-colors" />
                        </div>

                        <div className="grid gap-4">
                            {notes
                                .filter(note => note.title.toLowerCase().includes(noteSearchQuery.toLowerCase()))
                                .map(note => (
                                    <div key={note.id} className={cn("p-5 rounded-3xl bg-gray-50 dark:bg-white/5 border border-indigo-100 dark:border-white/5 transition-all shadow-md relative overflow-hidden", note.done && "opacity-40 grayscale")}
                                        style={note.grad ? { background: note.grad, border: 'none' } : {}}>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className={cn("font-black uppercase tracking-tight italic", note.grad ? "text-white drop-shadow-md" : "text-indigo-900 dark:text-white")}>{note.title}</h3>
                                                <div className={cn("flex gap-1", note.grad ? "text-white/80" : "text-gray-400")}>
                                                    <button onClick={() => toggleNoteDone(note.id)}>
                                                        {note.done ? <CheckCircle size={18} /> : <Circle size={18} />}
                                                    </button>
                                                    <button onClick={() => { setEditingNoteId(note.id); setCurrentNote(note); setActivePage('editor'); }}>
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => openDeleteConfirm(note.id, 'note', note.title)} className="hover:text-red-500">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className={cn("text-xs leading-relaxed font-bold line-clamp-4", note.grad ? "text-white/90 drop-shadow-sm" : "opacity-60")}>{note.body}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {activePage === 'actividades' && (
                    <div className="space-y-6">
                        <div className="p-5 rounded-[2.5rem] bg-gray-100 dark:bg-white/5 border border-indigo-500/10 flex justify-between items-center shadow-inner">
                            <button onClick={() => setActivityPriorityFilter(activityPriorityFilter === COLORS.GREEN.grad ? null : COLORS.GREEN.grad)}
                                className={cn("flex items-center gap-3 transition-all p-2 rounded-2xl", activityPriorityFilter === COLORS.GREEN.grad ? "bg-white dark:bg-white/10 shadow-md scale-105" : "hover:bg-black/5 dark:hover:bg-white/5")}>
                                <div className="w-5 h-5 rounded-full shadow-lg" style={{ background: COLORS.GREEN.grad }}></div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-[9px] font-black uppercase tracking-tight opacity-40 leading-none">Baja prioridad</span>
                                    <span className="text-lg font-black leading-none">{getActivityPriorityCount(COLORS.GREEN.grad)}</span>
                                </div>
                            </button>
                            <div className="w-px h-8 bg-black/5 dark:bg-white/5 mx-1"></div>
                            <button onClick={() => setActivityPriorityFilter(activityPriorityFilter === COLORS.YELLOW.grad ? null : COLORS.YELLOW.grad)}
                                className={cn("flex items-center gap-3 transition-all p-2 rounded-2xl", activityPriorityFilter === COLORS.YELLOW.grad ? "bg-white dark:bg-white/10 shadow-md scale-105" : "hover:bg-black/5 dark:hover:bg-white/5")}>
                                <div className="w-5 h-5 rounded-full shadow-lg" style={{ background: COLORS.YELLOW.grad }}></div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-[9px] font-black uppercase tracking-tight opacity-40 leading-none">Media prioridad</span>
                                    <span className="text-lg font-black leading-none">{getActivityPriorityCount(COLORS.YELLOW.grad)}</span>
                                </div>
                            </button>
                            <div className="w-px h-8 bg-black/5 dark:bg-white/5 mx-1"></div>
                            <button onClick={() => setActivityPriorityFilter(activityPriorityFilter === COLORS.RED.grad ? null : COLORS.RED.grad)}
                                className={cn("flex items-center gap-3 transition-all p-2 rounded-2xl", activityPriorityFilter === COLORS.RED.grad ? "bg-white dark:bg-white/10 shadow-md scale-105" : "hover:bg-black/5 dark:hover:bg-white/5")}>
                                <div className="w-5 h-5 rounded-full shadow-lg" style={{ background: COLORS.RED.grad }}></div>
                                <div className="flex flex-col items-start text-left">
                                    <span className="text-[9px] font-black uppercase tracking-tight opacity-40 leading-none">Alta prioridad</span>
                                    <span className="text-lg font-black leading-none">{getActivityPriorityCount(COLORS.RED.grad)}</span>
                                </div>
                            </button>
                        </div>

                        {activityPriorityFilter && (
                            <div className="flex justify-center">
                                <button onClick={() => setActivityPriorityFilter(null)} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 flex items-center gap-2 bg-indigo-500/5 px-4 py-2 rounded-full border border-indigo-500/10">
                                    <X size={14} /> Quitar filtro
                                </button>
                            </div>
                        )}

                        <div className="grid gap-3">
                            {activities
                                .filter(act => !activityPriorityFilter || act.grad === activityPriorityFilter)
                                .map(act => (
                                    <div key={act.id} className={cn("p-4 rounded-2xl flex items-center justify-between transition-all", act.done ? "opacity-40 grayscale scale-[0.98] border border-gray-300 dark:border-white/5" : "shadow-md border border-transparent")}
                                        style={{ background: act.done ? 'transparent' : act.grad }}>
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <button onClick={() => toggleActivityDone(act.id)}
                                                className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", act.done ? "text-gray-500" : "bg-white/20 border border-white/30 text-white")}>
                                                {act.done ? <CheckCircle size={22} strokeWidth={3} /> : <div className="w-5 h-5 border-2 border-white/50 rounded-md"></div>}
                                            </button>
                                            <div className="flex-1 min-w-0 flex items-center">
                                                <h4 className={cn("font-black text-sm uppercase tracking-tight truncate", act.done ? "text-gray-600 dark:text-gray-400" : "text-white drop-shadow-sm")}>{act.title}</h4>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 ml-4 shrink-0">
                                            <button onClick={() => { setEditingActivityId(act.id); setCurrentActivity(act); setActivePage('editor_act'); }} className={cn("p-2 transition-colors", act.done ? "text-gray-400 hover:text-indigo-500" : "text-white/70 hover:text-white")}><Edit2 size={16} /></button>
                                            <button onClick={() => openDeleteConfirm(act.id, 'activity', act.title)} className={cn("p-2 transition-colors", act.done ? "text-gray-400 hover:text-red-500" : "text-white/50 hover:text-white hover:text-red-300")}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            {activities.length === 0 && <div className="text-center py-20 opacity-20 uppercase font-black tracking-widest text-sm">Sin actividades</div>}
                        </div>
                    </div>
                )}

                {activePage === 'lectura' && (
                    <div className="space-y-6">
                        <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    placeholder="BUSCAR EN LECTURA..."
                                    className="w-full bg-gray-100 dark:bg-white/5 border border-indigo-500/10 py-3 md:py-5 px-4 md:px-6 pl-12 md:pl-14 rounded-2xl md:rounded-[2rem] outline-none focus:border-indigo-500 font-black uppercase text-[9px] md:text-[10px] tracking-widest transition-all shadow-inner"
                                    value={readingSearchQuery}
                                    onChange={e => setReadingSearchQuery(e.target.value)}
                                />
                                <Search size={20} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-indigo-500/50" />
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square w-[44px] md:w-[60px] flex items-center justify-center bg-indigo-500 text-white rounded-2xl md:rounded-[1.5rem] shadow-xl shadow-indigo-500/30 active:scale-90 transition-all"
                                title="Subir PDF"
                            >
                                <Plus className="w-6 h-6 md:w-7 md:h-7" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:min-h-[550px]">
                            {/* RECUADRO IZQUIERDO: LISTA DE PDFS */}
                            <div className="flex-1 bg-gray-50 dark:bg-white/5 rounded-3xl md:rounded-[3rem] p-4 md:p-8 relative shadow-inner border border-indigo-500/10 h-[280px] md:h-[550px] overflow-y-auto scrollbar-hide">
                                <div className="flex items-center justify-between mb-4 md:mb-8 pb-3 md:pb-4 border-b border-indigo-500/5">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-indigo-500">{selectedReadingCat}</h2>
                                </div>
                                <div className="space-y-4">
                                    {readingFiles
                                        .filter(f => f.category === selectedReadingCat && f.name.toLowerCase().includes(readingSearchQuery.toLowerCase()))
                                        .map(file => (
                                            <div
                                                key={file.id}
                                                className="group relative flex items-center gap-3 md:gap-6 bg-white dark:bg-white/5 p-3 md:p-4 rounded-3xl md:rounded-[2.5rem] border border-indigo-500/5 cursor-pointer hover:shadow-2xl hover:bg-indigo-500/[0.02] transition-all duration-300 overflow-hidden"
                                                onClick={() => openPdf(file)}
                                            >
                                                {/* Portada del PDF */}
                                                <div className="w-10 h-14 md:w-16 md:h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-lg md:rounded-xl flex flex-col items-center justify-center text-white shrink-0 border border-white/10 shadow-lg group-hover:rotate-2 transition-transform">
                                                    <FileText className="w-5 h-5 md:w-8 md:h-8" strokeWidth={2.5} />
                                                    <span className="hidden md:block text-[8px] font-black uppercase mt-1 tracking-widest opacity-80">PDF</span>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-indigo-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                                        {file.name}
                                                    </h4>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">
                                                        {file.date}
                                                    </span>
                                                </div>

                                                <div className="flex gap-1 md:gap-2 mr-1 md:mr-2">
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingFileId(file.id); setNewFileName(file.name); setIsEditFileNameModalOpen(true); }} className="p-2 md:p-3 bg-indigo-500/10 text-indigo-500 rounded-xl md:rounded-2xl hover:bg-indigo-500 hover:text-white transition-all"><Edit2 className="w-3 h-3 md:w-4 md:h-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); downloadFile(file); }} className="p-2 md:p-3 bg-green-500/10 text-green-500 rounded-xl md:rounded-2xl hover:bg-green-500 hover:text-white transition-all"><Download className="w-3 h-3 md:w-4 md:h-4" /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); openDeleteConfirm(file.id, 'pdf_file', file.name); }} className="p-2 md:p-3 bg-red-500/10 text-red-500 rounded-xl md:rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-3 h-3 md:w-4 md:h-4" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    {readingFiles.filter(f => f.category === selectedReadingCat).length === 0 && (
                                        <div className="text-center py-20 opacity-20 uppercase font-black text-sm tracking-widest">No hay archivos en esta sección</div>
                                    )}
                                </div>
                            </div>

                            {/* RECUADRO DERECHO: SECCIONES */}
                            <div className="w-full md:w-64 bg-gray-50 dark:bg-white/5 rounded-3xl md:rounded-[3rem] p-4 md:p-8 shadow-inner border border-indigo-500/10 h-[220px] md:h-[550px] flex flex-col">
                                <h2 className="text-sm md:text-xl font-black uppercase italic tracking-tighter text-indigo-500 mb-4 md:mb-8 pb-3 md:pb-4 border-b border-indigo-500/5 text-center">Secciones</h2>
                                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
                                    {readingCategories.map((cat, index) => (
                                        <div key={cat} className="group relative">
                                            <button
                                                onClick={() => setSelectedReadingCat(cat)}
                                                className={cn(
                                                    "w-full px-4 py-3 md:px-5 md:py-5 rounded-2xl md:rounded-[1.5rem] font-black text-[9px] md:text-[11px] uppercase tracking-widest transition-all flex items-center justify-between",
                                                    selectedReadingCat === cat ? "bg-indigo-500 text-white shadow-xl scale-[1.02]" : "bg-white dark:bg-white/5 text-gray-400 hover:bg-indigo-500/5 hover:text-indigo-500"
                                                )}
                                            >
                                                <span className="truncate pr-4">{cat}</span>
                                                <div className={cn("flex gap-1.5 shrink-0 transition-opacity", selectedReadingCat === cat ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingCatIndex(index); setNewCatName(cat); setIsNewCatModalOpen(true); }} className="hover:scale-125 transition-transform"><Edit2 size={14} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); openDeleteConfirm(index, 'reading_cat', cat); }} className="hover:scale-125 transition-transform text-red-400"><Trash2 size={14} /></button>
                                                </div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => { setEditingCatIndex(null); setNewCatName(""); setIsNewCatModalOpen(true); }} className="w-full mt-4 md:mt-6 py-3 md:py-4 bg-indigo-500 text-white rounded-2xl md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                    NUEVA SECCIÓN
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {(activePage === 'editor' || activePage === 'editor_act') && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <input type="text" placeholder="TÍTULO..." className="w-full bg-transparent text-2xl font-black outline-none border-b-2 border-indigo-500/10 focus:border-indigo-500 pb-2 uppercase tracking-tighter"
                            value={activePage === 'editor' ? currentNote.title : currentActivity.title}
                            onChange={e => activePage === 'editor' ? setCurrentNote({ ...currentNote, title: e.target.value }) : setCurrentActivity({ ...currentActivity, title: e.target.value })} />

                        <div className="flex items-center justify-between">
                            {activePage === 'editor' && (
                                <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
                                    <button onMouseDown={e => e.preventDefault()} onClick={() => applyFmt('bold', 'note')} className="p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 flex items-center justify-center text-indigo-500"><Bold size={16} /></button>
                                    <button onMouseDown={e => e.preventDefault()} onClick={() => applyFmt('list', 'note')} className="p-2 rounded-xl hover:bg-white dark:hover:bg-white/10 text-indigo-500"><List size={16} /></button>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-white/5 rounded-2xl">
                                {(activePage === 'editor_act' ? Object.values(COLORS) : PALETTE).map((p, idx) => (
                                    <button key={idx}
                                        onClick={() => activePage === 'editor' ? setCurrentNote({ ...currentNote, grad: p.grad, hex: p.hex }) : setCurrentActivity({ ...currentActivity, grad: p.grad, hex: p.hex })}
                                        style={{ background: p.grad }}
                                        className={cn("w-6 h-6 rounded-full border-2 transition-all", (activePage === 'editor' ? currentNote.grad : currentActivity.grad) === p.grad ? "border-indigo-500 scale-110" : "border-transparent")} title={p.label}></button>
                                ))}
                            </div>
                        </div>

                        {activePage === 'editor' ? (
                            <textarea ref={textareaRef} placeholder="Escribe aquí..."
                                onSelect={handleSelect}
                                onBlur={handleSelect}
                                onKeyUp={handleSelect}
                                className={cn("w-full min-h-[350px] p-4 rounded-3xl outline-none font-semibold text-sm leading-8 transition-colors", currentNote.grad ? "text-white" : "bg-transparent")}
                                style={currentNote.grad ? { background: currentNote.grad } : {}}
                                value={currentNote.body}
                                onChange={e => { handleSelect(e); setCurrentNote({ ...currentNote, body: e.target.value }); }} />
                        ) : (
                            <div className="w-full min-h-[150px] p-12 rounded-[3.5rem] flex items-center justify-center border-4 border-dashed border-indigo-500/10" style={{ background: currentActivity.grad }}>
                                <Activity size={64} className="text-white/20" />
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={activePage === 'editor' ? saveNote : saveActivity} className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl font-black tracking-widest shadow-xl shadow-indigo-500/30 uppercase">GUARDAR</button>
                            <button onClick={() => setActivePage(activePage === 'editor' ? 'notes' : 'actividades')} className="px-6 py-4 bg-gray-100 dark:bg-white/5 rounded-2xl font-black text-[10px] tracking-widest uppercase">CANCELAR</button>
                        </div>
                    </div>
                )}
                {activePage === 'agenda' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col">
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-indigo-900 dark:text-white leading-none">
                                    {agendaCalDate.toLocaleString('default', { month: 'long' })}
                                </h2>
                                <span className="text-xl font-black opacity-20 uppercase tracking-[0.3em]">{agendaCalDate.getFullYear()}</span>
                            </div>
                            <div className="flex gap-2 bg-gray-100 dark:bg-white/5 p-2 rounded-2xl shadow-inner border border-indigo-500/5">
                                <button onClick={() => setAgendaCalDate(new Date(agendaCalDate.setMonth(agendaCalDate.getMonth() - 1)))} className="p-3 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all"><ArrowLeft size={18} /></button>
                                <button onClick={() => setAgendaCalDate(new Date())} className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95">Hoy</button>
                                <button onClick={() => setAgendaCalDate(new Date(agendaCalDate.setMonth(agendaCalDate.getMonth() + 1)))} className="p-3 hover:bg-white dark:hover:bg-white/10 rounded-xl transition-all select-none"><div className="rotate-180"><ArrowLeft size={18} /></div></button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-white/5 rounded-[3rem] p-4 md:p-8 border border-indigo-500/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4 md:mb-8">
                                {['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'].map(d => (
                                    <div key={d} className="text-[7px] md:text-[10px] font-black text-center opacity-30 tracking-widest truncate">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2 md:gap-4">
                                {(() => {
                                    const year = agendaCalDate.getFullYear()
                                    const month = agendaCalDate.getMonth()
                                    const firstDay = new Date(year, month, 1).getDay()
                                    const daysInMonth = new Date(year, month + 1, 0).getDate()
                                    const days = []
                                    const today = new Date().toISOString().split('T')[0]

                                    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="aspect-square opacity-0" />)

                                    for (let d = 1; d <= daysInMonth; d++) {
                                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                                        const isToday = today === dateStr
                                        const event = agendaEvents[dateStr]

                                        days.push(
                                            <div key={d}
                                                onClick={() => {
                                                    setSelectedAgendaDay(dateStr);
                                                    setCurrentReminder(event || { text: '', hex: PALETTE[0].hex, grad: PALETTE[0].grad });
                                                    setIsAgendaModalOpen(true);
                                                }}
                                                className={cn(
                                                    "aspect-square rounded-2xl md:rounded-3xl p-2 md:p-3 border transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-between group",
                                                    isToday ? "bg-indigo-500/5 border-indigo-500 shadow-lg" : "bg-gray-50/50 dark:bg-white/[0.02] border-indigo-500/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-xl hover:-translate-y-1"
                                                )}>
                                                <span className={cn("text-sm font-black transition-all", isToday ? "text-indigo-500 scale-110" : "opacity-40")}>{d}</span>
                                                {event && (
                                                    <div className="w-full flex justify-center pb-1">
                                                        <div className="w-3/4 h-2 rounded-full shadow-lg animate-in zoom-in duration-300 group-hover:scale-110 transition-transform" style={{ background: event.grad }}></div>
                                                    </div>
                                                )}
                                                {isToday && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>}
                                            </div>
                                        )
                                    }
                                    return days
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* SHARED DELETE MODAL */}
            {
                deleteConfirm.isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-xs rounded-[40px] p-8 md:p-10 shadow-2xl text-center border border-white/5">
                            <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} className="text-red-500" /></div>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-2">¿Eliminar?</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">Estás a punto de borrar <span className="text-red-500">"{deleteConfirm.name}"</span>.</p>
                            <div className="space-y-3">
                                <button onClick={executeDelete} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black tracking-widest shadow-xl shadow-red-500/20 uppercase">SÍ, ELIMINAR</button>
                                <button onClick={() => setDeleteConfirm({ isOpen: false, id: null, type: null, name: '' })} className="w-full py-4 bg-gray-100 dark:bg-white/5 text-gray-400 rounded-2xl font-black tracking-widest text-[10px] uppercase">CANCELAR</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isHabitModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-sm rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4"><button onClick={() => setIsHabitModalOpen(false)}><X size={24} className="text-gray-400" /></button></div>
                            <h2 className="text-lg font-black uppercase tracking-tighter italic mb-6">{editingHabitId ? 'Editar Hábito' : 'Añadir Hábito'}</h2>
                            <div className="space-y-6">
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nombre del Hábito</label>
                                    <input type="text" placeholder="Ej: Meditar 10 min" className="w-full bg-gray-50 dark:bg-white/5 border border-indigo-500/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={newHabit.name} onChange={e => setNewHabit({ ...newHabit, name: e.target.value })} />
                                </div>
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Frecuencia Semanal</label>
                                    <div className="flex flex-wrap gap-2">{DAYS_OF_WEEK.map(d => (
                                        <button key={d} onClick={() => setNewHabit({ ...newHabit, days: newHabit.days.includes(d) ? newHabit.days.filter(x => x !== d) : [...newHabit.days, d] })} className={cn("w-10 h-10 rounded-full text-[10px] font-black border-2 transition-all", newHabit.days.includes(d) ? "bg-indigo-500 border-indigo-500 text-white" : "border-gray-100 dark:border-white/10 text-gray-400")}>{d}</button>
                                    ))}</div>
                                </div>
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Estilo Metálico</label>
                                    <div className="flex flex-wrap gap-2">{PALETTE.map(p => (
                                        <button key={p.grad} onClick={() => setNewHabit({ ...newHabit, grad: p.grad, hex: p.hex })} style={{ background: p.grad }} className={cn("w-10 h-10 rounded-xl border-4 transition-all scale-90", newHabit.grad === p.grad ? "border-indigo-500 scale-110" : "border-transparent")}></button>
                                    ))}</div>
                                </div>
                                <button onClick={saveHabit} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 uppercase">CONFIRMAR</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isNewCatModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-xs rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4"><button onClick={() => { setIsNewCatModalOpen(false); setEditingCatIndex(null); }}><X size={24} className="text-gray-400" /></button></div>
                            <h2 className="text-lg font-black uppercase tracking-tighter italic mb-6">{editingCatIndex !== null ? 'Editar Sección' : 'Nueva Sección'}</h2>
                            <div className="space-y-6">
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Título de Sección</label>
                                    <input type="text" placeholder="Ej: Ficción" autoFocus className="w-full bg-gray-50 dark:bg-white/5 border border-indigo-500/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveReadingCategory()} />
                                </div>
                                <button onClick={saveReadingCategory} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 uppercase">GUARDAR</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                isEditFileNameModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-xs rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4"><button onClick={() => setIsEditFileNameModalOpen(false)}><X size={24} className="text-gray-400" /></button></div>
                            <h2 className="text-lg font-black uppercase tracking-tighter italic mb-6">Editar Nombre</h2>
                            <div className="space-y-6">
                                <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nombre del PDF</label>
                                    <input type="text" autoFocus className="w-full bg-gray-50 dark:bg-white/5 border border-indigo-500/10 p-4 rounded-2xl outline-none focus:border-indigo-500 font-bold" value={newFileName} onChange={e => setNewFileName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveFileName()} />
                                </div>
                                <button onClick={saveFileName} className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 uppercase">ACTUALIZAR</button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                isCalendarOpen && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-sm rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6"><button onClick={() => setIsCalendarOpen(false)}><X size={24} className="text-gray-400" /></button></div>
                            <h2 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3">
                                <Calendar className="text-indigo-500" /> Historial
                            </h2>

                            <div className="bg-indigo-500/5 rounded-3xl p-6 mb-8 flex items-center justify-between border border-indigo-500/10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 opacity-60">Racha Actual</span>
                                    <span className="text-3xl font-black italic">{getStreak()} DÍAS</span>
                                </div>
                                <Flame className="text-orange-500 w-10 h-10 drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                            </div>

                            <div className="grid grid-cols-7 gap-2 text-center mb-4">
                                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                                    <span key={d} className="text-[10px] font-black opacity-30">{d}</span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {(() => {
                                    const year = currentCalDate.getFullYear()
                                    const month = currentCalDate.getMonth()
                                    const firstDay = new Date(year, month, 1).getDay()
                                    const daysInMonth = new Date(year, month + 1, 0).getDate()
                                    const days = []
                                    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />)
                                    for (let d = 1; d <= daysInMonth; d++) {
                                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                                        const isPerfect = perfectDays.has(dateStr)
                                        days.push(
                                            <div key={d} className="aspect-square flex items-center justify-center relative">
                                                <span className={cn("text-xs font-bold", isPerfect ? "text-white z-10" : "opacity-60")}>{d}</span>
                                                {isPerfect && <div className="absolute inset-1 bg-indigo-500 rounded-full animate-in zoom-in duration-300"></div>}
                                            </div>
                                        )
                                    }
                                    return days
                                })()}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <span>{currentCalDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                <div className="flex gap-4">
                                    <button onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() - 1)))} className="hover:text-indigo-500 transition-colors cursor-pointer">Ant</button>
                                    <button onClick={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() + 1)))} className="hover:text-indigo-500 transition-colors cursor-pointer">Sig</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                isAgendaModalOpen && (
                    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-sm rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 p-6"><button onClick={() => setIsAgendaModalOpen(false)}><X size={24} className="text-gray-400 hover:text-white transition-colors" /></button></div>
                            <h2 className="text-xl font-black uppercase tracking-tighter italic mb-2 tracking-widest text-indigo-500">Recordatorio</h2>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-8">{new Date(selectedAgendaDay).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Contenido</label>
                                    <textarea autoFocus placeholder="¿Qué tienes planeado?" className="w-full bg-gray-50 dark:bg-white/5 border border-indigo-500/5 p-6 rounded-3xl outline-none focus:border-indigo-500 font-bold min-h-[120px] shadow-inner resize-none text-sm leading-relaxed"
                                        value={currentReminder.text} onChange={e => setCurrentReminder({ ...currentReminder, text: e.target.value })} />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Estilo Visual</label>
                                    <div className="flex flex-wrap gap-3">
                                        {PALETTE.map((p, idx) => (
                                            <button key={idx} onClick={() => setCurrentReminder({ ...currentReminder, hex: p.hex, grad: p.grad })} style={{ background: p.grad }} className={cn("w-10 h-10 rounded-2xl border-4 transition-all scale-95", currentReminder.grad === p.grad ? "border-indigo-500 scale-110 shadow-lg" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105")}></button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <button onClick={saveAgendaReminder} className="w-full py-5 bg-indigo-500 text-white rounded-[1.5rem] font-black tracking-[0.2em] shadow-xl shadow-indigo-500/30 uppercase text-xs active:scale-95 transition-all">GUARDAR</button>
                                    {agendaEvents[selectedAgendaDay] && (
                                        <button onClick={() => openDeleteConfirm(selectedAgendaDay, 'agenda_reminder', agendaEvents[selectedAgendaDay].text)} className="w-full py-4 text-red-500/50 hover:text-red-500 font-black text-[10px] tracking-[0.2em] uppercase transition-all">ELIMINAR RECORDATORIO</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                isAuthModalOpen && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-sm rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/5">
                            <div className="absolute top-0 right-0 p-6"><button onClick={() => setIsAuthModalOpen(false)}><X size={24} className="text-gray-400 hover:text-white transition-colors" /></button></div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-2 tracking-widest text-indigo-500">
                                {authMode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
                            </h2>
                            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-8">
                                {authMode === 'login' ? 'Inicia sesión para sincronizar' : 'Regístrate en MindTrack'}
                            </p>

                            <form onSubmit={handleAuth} className="space-y-6">
                                {authMode === 'signup' && (
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Nombre Completo</label>
                                        <input type="text" required placeholder="Tu nombre" className="w-full bg-gray-50 dark:bg-white/5 border border-indigo-500/5 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                                            value={authData.fullName} onChange={e => setAuthData({ ...authData, fullName: e.target.value })} />
                                    </div>
                                )}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Correo Electrónico</label>
                                    <input type="email" required placeholder="tu@email.com" className="w-full bg-gray-50 dark:bg-white/5 border border-indigo-500/5 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                                        value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Contraseña</label>
                                    <input type="password" required placeholder="••••••••" className="w-full bg-gray-50 dark:bg-white/5 border border-indigo-500/5 p-5 rounded-2xl outline-none focus:border-indigo-500 font-bold text-sm"
                                        value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} />
                                </div>

                                <button type="submit" className="w-full py-5 bg-indigo-500 text-white rounded-[1.5rem] font-black tracking-[0.2em] shadow-xl shadow-indigo-500/30 uppercase text-xs active:scale-95 transition-all">
                                    {authMode === 'login' ? 'ENTRAR' : 'REGISTRARME'}
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60 hover:text-indigo-500">
                                    {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                isAccountModalOpen && user && (
                    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-sm rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-white/5 text-center">
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setIsAccountModalOpen(false)}>
                                    <X size={24} className="text-gray-400 hover:text-white transition-colors" />
                                </button>
                            </div>

                            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/20">
                                <UserCircle size={48} className="text-indigo-500" />
                            </div>

                            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-indigo-500 mb-1">
                                {user.user_metadata?.full_name || 'Usuario'}
                            </h2>
                            <p className="text-xs font-bold text-gray-500 lowercase tracking-widest mb-12">
                                {user.email}
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={async () => {
                                        await supabase.auth.signOut()
                                        setIsAccountModalOpen(false)
                                        setHabits([])
                                        setNotes([])
                                        setActivities([])
                                        setAgendaEvents({})
                                        setPerfectDays(new Set())
                                        setReadingFiles([])
                                    }}
                                    className="w-full py-5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-black tracking-[0.2em] uppercase text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                >
                                    Cerrar Sesión
                                </button>
                                <button
                                    onClick={() => setIsAccountModalOpen(false)}
                                    className="w-full py-4 text-gray-400 font-black text-[10px] tracking-[0.2em] uppercase"
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showSuccessModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-[#1a1a26] w-full max-w-sm rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-white/5 text-center">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-green-500 animate-bounce" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-indigo-500 mb-2">¡REGISTRADO!</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">Tu cuenta ha sido creada exitosamente. ¡Bienvenido a la comunidad!</p>

                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setAuthMode('login');
                                }}
                                className="w-full py-5 bg-indigo-500 text-white rounded-2xl font-black tracking-[0.2em] shadow-xl shadow-indigo-500/30 uppercase text-xs active:scale-95 transition-all"
                            >
                                ENTRAR AHORA
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
