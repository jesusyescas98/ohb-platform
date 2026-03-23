"use client";

import { useState, useEffect, useRef } from 'react';
import styles from '../Dashboard.module.css';
import { FilesDB, FoldersDB, ActivityLogDB, type FileRecord, type FolderRecord } from '../../../lib/database';
import { useAuth } from '../../../context/AuthContext';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.ms-powerpoint', // ppt
  'text/csv',
];

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📕',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📙',
  'application/vnd.ms-powerpoint': '📙',
  'text/csv': '📋',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function FilesPage() {
  const { email: userEmail, fullName } = useAuth();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    reload();
  }, [currentPath]);

  const reload = () => {
    setFolders(FoldersDB.getByParent(currentPath));
    setFiles(FilesDB.getByFolder(currentPath));
  };

  const logAction = (action: string, details: string) => {
    ActivityLogDB.add({ userEmail: userEmail || '', userName: fullName || '', action, details, module: 'files' });
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    FoldersDB.add({
      id: `FLD-${Date.now().toString(36).toUpperCase()}`,
      name: newFolderName.trim(),
      parentPath: currentPath,
      createdBy: userEmail || '',
      createdAt: Date.now(),
    });
    logAction('FOLDER_CREATED', `Carpeta "${newFolderName}" creada en ${currentPath}`);
    setNewFolderName('');
    setIsNewFolderModalOpen(false);
    reload();
  };

  const handleDeleteFolder = (folder: FolderRecord) => {
    if (window.confirm(`¿Eliminar la carpeta "${folder.name}" y todo su contenido?`)) {
      FoldersDB.delete(folder.id);
      logAction('FOLDER_DELETED', `Carpeta "${folder.name}" eliminada`);
      reload();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles) return;
    setUploading(true);

    let processed = 0;
    const total = uploadFiles.length;

    Array.from(uploadFiles).forEach(file => {
      // 5MB limit per file for localStorage
      if (file.size > 5 * 1024 * 1024) {
        alert(`El archivo "${file.name}" excede 5MB. Máximo permitido: 5MB.`);
        processed++;
        if (processed === total) { setUploading(false); reload(); }
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(xlsx|xls|docx|doc|pptx|ppt|pdf|csv)$/i)) {
        alert(`El archivo "${file.name}" no es un tipo permitido. Solo: PDF, Excel, Word, PowerPoint, CSV.`);
        processed++;
        if (processed === total) { setUploading(false); reload(); }
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const record: FileRecord = {
          id: `FILE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          folder: currentPath,
          dataUrl: ev.target?.result as string,
          uploadedBy: userEmail || '',
          uploadedByName: fullName || '',
          createdAt: Date.now(),
        };
        FilesDB.add(record);
        logAction('FILE_UPLOADED', `Archivo "${file.name}" subido a ${currentPath}`);
        processed++;
        if (processed === total) { setUploading(false); reload(); }
      };
      reader.onerror = () => {
        processed++;
        if (processed === total) { setUploading(false); reload(); }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteFile = (file: FileRecord) => {
    if (window.confirm(`¿Eliminar el archivo "${file.name}"?`)) {
      FilesDB.delete(file.id);
      logAction('FILE_DELETED', `Archivo "${file.name}" eliminado`);
      reload();
    }
  };

  const handleDownload = (file: FileRecord) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    link.click();
    logAction('FILE_DOWNLOADED', `Archivo "${file.name}" descargado`);
  };

  const navigateToFolder = (folder: FolderRecord) => {
    const newPath = currentPath === '/' ? `/${folder.name}` : `${currentPath}/${folder.name}`;
    setCurrentPath(newPath);
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
  };

  // Breadcrumb
  const pathParts = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Raíz', path: '/' }];
  let buildPath = '';
  for (const part of pathParts) {
    buildPath += '/' + part;
    breadcrumbs.push({ name: part, path: buildPath });
  }

  // Search filter
  const filteredFiles = searchTerm
    ? files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : files;
  const filteredFolders = searchTerm
    ? folders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : folders;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>📁 Gestor de <span className="text-gradient-silver">Archivos</span></h1>
          <p className={styles.subtitle}>Sube, organiza y descarga documentos Excel, PDF, Word y PowerPoint.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className={styles.secondaryBtn} onClick={() => setIsNewFolderModalOpen(true)}>📁 Nueva Carpeta</button>
          <button className={styles.primaryBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? '⏳ Subiendo...' : '📤 Subir Archivos'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </header>

      {/* Breadcrumb + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.88rem', flexWrap: 'wrap' }}>
          {breadcrumbs.map((bc, idx) => (
            <span key={bc.path}>
              {idx > 0 && <span style={{ color: 'var(--text-secondary)', margin: '0 0.2rem' }}>/</span>}
              <button
                onClick={() => setCurrentPath(bc.path)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--accent-silver)',
                  fontWeight: idx === breadcrumbs.length - 1 ? 'bold' : 'normal',
                  fontSize: '0.88rem', textDecoration: idx < breadcrumbs.length - 1 ? 'underline' : 'none',
                }}
              >
                {bc.name}
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="🔍 Buscar archivos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={styles.formInput}
          style={{ maxWidth: '250px' }}
        />
      </div>

      {/* Back button */}
      {currentPath !== '/' && (
        <button
          onClick={navigateUp}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem',
            background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)',
            padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem',
          }}
        >
          ← Subir un nivel
        </button>
      )}

      {/* Content Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {/* Folders */}
        {filteredFolders.length > 0 && (
          <>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', marginBottom: '0.8rem' }}>
              📁 Carpetas ({filteredFolders.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
              {filteredFolders.map(folder => (
                <div
                  key={folder.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem',
                    position: 'relative',
                  }}
                  onClick={() => navigateToFolder(folder)}
                >
                  <span style={{ fontSize: '2rem' }}>📁</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{folder.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      {new Date(folder.createdAt).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.5 }}
                    title="Eliminar carpeta"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Files */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold', marginBottom: '0.8rem' }}>
          📄 Archivos ({filteredFiles.length})
        </div>

        {filteredFiles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredFiles.map(file => {
              const icon = FILE_ICONS[file.type] || '📄';
              return (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.8rem',
                    padding: '0.7rem 1rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {formatFileSize(file.size)} • Subido por {file.uploadedByName} • {new Date(file.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button
                      onClick={() => handleDownload(file)}
                      className={styles.secondaryBtn}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      ⬇️ Descargar
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className={styles.dangerBtn}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📁</div>
            <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              {searchTerm ? 'Sin resultados para la búsqueda.' : 'Esta carpeta está vacía.'}
            </p>
            <p style={{ fontSize: '0.8rem' }}>
              Sube archivos PDF, Excel, Word o PowerPoint con el botón de arriba.
            </p>
          </div>
        )}
      </div>

      {/* Storage Info */}
      <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        💡 Máximo 5MB por archivo • Almacenamiento local del navegador
      </div>

      {/* New Folder Modal */}
      {isNewFolderModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsNewFolderModalOpen(false)}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', margin: '1rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>📁 Nueva Carpeta</h3>
            <form onSubmit={handleCreateFolder}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre de la carpeta *</label>
                <input
                  required
                  className={styles.formInput}
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="Ej: Contratos Marzo"
                  autoFocus
                  maxLength={50}
                />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Se creará dentro de: <strong>{currentPath}</strong>
              </p>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button type="button" onClick={() => setIsNewFolderModalOpen(false)} className={styles.secondaryBtn} style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className={styles.primaryBtn} style={{ flex: 1 }}>Crear Carpeta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
