import { useState } from "react";

type Folder = {
  id: string;
  name: string;
  isExpanded: boolean;
};

type Channel = {
  id: string;
  folderId: string | null;
  name: string;
};

type Props = {
  folders: Folder[];
  channels: Channel[];
  active: string | null;
  setActive: (id: string | null) => void;
  query: string;
  setQuery: (s: string) => void;
  addChannel: () => void;
  deleteChannel: (id: string) => void;
  reloadChannel: (id: string) => Promise<void>;
  reorderChannels: (fromId: string, toId: string) => void;
  createFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  toggleFolder: (id: string) => void;
  moveChannelToFolder: (channelId: string, folderId: string | null) => void;
  maxResults: number;
  setMaxResults: (n: number) => void;
  dateAfter: string;
  setDateAfter: (s: string) => void;
  dateBefore: string;
  setDateBefore: (s: string) => void;
};

export function QueryTabs({
  folders,
  channels,
  active,
  setActive,
  query,
  setQuery,
  addChannel,
  deleteChannel,
  reloadChannel,
  reorderChannels,
  createFolder,
  deleteFolder,
  toggleFolder,
  moveChannelToFolder,
  maxResults,
  setMaxResults,
  dateAfter,
  setDateAfter,
  dateBefore,
  setDateBefore,
}: Props) {
  const [reloadingIndex, setReloadingIndex] = useState<string | null>(null);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedChannel, setDraggedChannel] = useState<string | null>(null);
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName("");
      setShowFolderDialog(false);
    }
  };

  const handleChannelDragStart = (channelId: string) => {
    setDraggedChannel(channelId);
  };

  const handleChannelDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    setDraggedOverFolder(folderId);
  };

  const handleChannelDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    if (draggedChannel) {
      moveChannelToFolder(draggedChannel, targetFolderId);
    }
    setDraggedChannel(null);
    setDraggedOverFolder(null);
  };

  const handleFolderDragStart = (folderId: string) => {
    setDraggedFolder(folderId);
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    if (draggedFolder && targetFolderId && draggedFolder !== targetFolderId) {
      // チャンネルをフォルダから別のフォルダへ移動
      // ここでは簡単のためスキップ（必要に応じて実装）
    }
    setDraggedFolder(null);
  };

  return (
    <div style={{
      width: "320px",
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(10px)",
      boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      height: "100vh"
    }}>
      <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0, 0, 0, 0.06)" }}>
        <h2 style={{
          margin: 0,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "1.5em",
          fontWeight: "bold"
        }}>
          arXiv WebApp
        </h2>
      </div>

      <div style={{ padding: "1rem", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1em", color: "#666", fontWeight: "600" }}>
            クエリ一覧
          </h3>
          <button
            onClick={() => setShowFolderDialog(true)}
            style={{
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "0.4rem 0.8rem",
              cursor: "pointer",
              fontSize: "0.85em",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#764ba2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#667eea"}
          >
            📁 フォルダ作成
          </button>
        </div>

        {/* フォルダダイアログ */}
        {showFolderDialog && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "12px",
              width: "300px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>新規フォルダ</h3>
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="フォルダ名"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "0.9em",
                  marginBottom: "1rem"
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleCreateFolder}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9em",
                    fontWeight: "500"
                  }}
                >
                  作成
                </button>
                <button
                  onClick={() => {
                    setShowFolderDialog(false);
                    setNewFolderName("");
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "transparent",
                    color: "#666",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9em"
                  }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* フォルダ外へのドロップゾーン */}
        {draggedChannel && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDraggedOverFolder(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedChannel) {
                moveChannelToFolder(draggedChannel, null);
              }
              setDraggedChannel(null);
              setDraggedOverFolder(null);
            }}
            style={{
              padding: "0.5rem",
              background: "rgba(102, 126, 234, 0.15)",
              borderRadius: "6px",
              marginBottom: "1rem",
              border: "2px dashed rgba(102, 126, 234, 0.3)",
              textAlign: "center",
              color: "#667eea",
              fontSize: "0.85em",
              fontWeight: "500",
              cursor: "default"
            }}
          >
            📤 フォルダの外にドロップ
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          {/* フォルダとその中のチャンネルを表示 */}
          {folders.map((folder) => {
            const folderChannels = channels.filter(c => c.folderId === folder.id);
            return (
              <div
                key={folder.id}
                style={{ marginBottom: "0.5rem" }}
                draggable
                onDragStart={() => handleFolderDragStart(folder.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!draggedFolder) {
                    handleChannelDragOver(e, folder.id);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedChannel) {
                    handleChannelDrop(e, folder.id);
                  }
                }}
              >
                {/* フォルダヘッダー */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                  background: draggedOverFolder === folder.id
                    ? "rgba(102, 126, 234, 0.2)"
                    : "rgba(102, 126, 234, 0.1)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span onClick={() => toggleFolder(folder.id)} style={{ cursor: "pointer" }}>
                      {folder.isExpanded ? "📂" : "📁"}
                    </span>
                    <span style={{ fontSize: "0.9em", fontWeight: "500", color: "#333" }}>
                      {folder.name}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder.id);
                    }}
                    style={{
                      background: "rgba(255, 0, 0, 0.1)",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.25rem 0.5rem",
                      cursor: "pointer",
                      fontSize: "0.85em",
                      color: "#e63946"
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* フォルダの中のチャンネル */}
                {folder.isExpanded && folderChannels.map((ch) => (
                  <div
                    key={ch.id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleChannelDragStart(ch.id);
                    }}
                    onDragEnd={() => {
                      setDraggedChannel(null);
                      setDraggedOverFolder(null);
                    }}
                    onClick={() => setActive(ch.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      marginLeft: "1rem",
                      marginTop: "0.5rem",
                      marginBottom: "0.5rem",
                      background: active === ch.id
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : draggedChannel === ch.id
                        ? "#e0e0e0"
                        : "#f5f5f5",
                      borderRadius: "8px",
                      cursor: "grab",
                      transition: "all 0.2s",
                      boxShadow: active === ch.id ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.05)",
                      opacity: draggedChannel === ch.id ? 0.5 : 1,
                      transform: draggedChannel === ch.id ? "scale(1.05)" : "scale(1)"
                    }}
                  >
                    <span style={{
                      color: active === ch.id ? "white" : "#333",
                      fontWeight: active === ch.id ? "600" : "normal"
                    }}>
                      #{ch.name}
                    </span>
                    <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setReloadingIndex(ch.id);
                          await reloadChannel(ch.id);
                          setReloadingIndex(null);
                        }}
                        disabled={reloadingIndex === ch.id}
                        style={{
                          background: active === ch.id ? "rgba(255, 255, 255, 0.2)" : "rgba(102, 126, 234, 0.1)",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                          fontSize: "0.85em",
                          color: active === ch.id ? "white" : "#667eea",
                          opacity: reloadingIndex === ch.id ? 0.5 : 1
                        }}
                      >
                        {reloadingIndex === ch.id ? "⟳" : "↻"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChannel(ch.id);
                        }}
                        style={{
                          background: active === ch.id ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 0, 0, 0.1)",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.25rem 0.5rem",
                          cursor: "pointer",
                          fontSize: "0.85em",
                          color: active === ch.id ? "white" : "#e63946"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* フォルダなしのチャンネル */}
          {channels.filter(c => c.folderId === null).map((ch) => (
            <div
              key={ch.id}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                handleChannelDragStart(ch.id);
              }}
              onDragEnd={() => {
                setDraggedChannel(null);
                setDraggedOverFolder(null);
              }}
              onClick={() => setActive(ch.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                background: active === ch.id
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : draggedChannel === ch.id
                  ? "#e0e0e0"
                  : "#f5f5f5",
                borderRadius: "8px",
                cursor: "grab",
                transition: "all 0.2s",
                boxShadow: active === ch.id ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "0 2px 4px rgba(0, 0, 0, 0.05)",
                opacity: draggedChannel === ch.id ? 0.5 : 1,
                transform: draggedChannel === ch.id ? "scale(1.05)" : "scale(1)"
              }}
            >
              <span style={{
                color: active === ch.id ? "white" : "#333",
                fontWeight: active === ch.id ? "600" : "normal"
              }}>
                #{ch.name}
              </span>
              <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    setReloadingIndex(ch.id);
                    await reloadChannel(ch.id);
                    setReloadingIndex(null);
                  }}
                  disabled={reloadingIndex === ch.id}
                  style={{
                    background: active === ch.id ? "rgba(255, 255, 255, 0.2)" : "rgba(102, 126, 234, 0.1)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    fontSize: "0.85em",
                    color: active === ch.id ? "white" : "#667eea",
                    opacity: reloadingIndex === ch.id ? 0.5 : 1
                  }}
                >
                  {reloadingIndex === ch.id ? "⟳" : "↻"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChannel(ch.id);
                  }}
                  style={{
                    background: active === ch.id ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 0, 0, 0.1)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                    fontSize: "0.85em",
                    color: active === ch.id ? "white" : "#e63946"
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: "1.5rem",
          padding: "1.5rem",
          background: "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
        }}>
          <h4 style={{
            marginTop: 0,
            marginBottom: "1rem",
            fontSize: "1em",
            color: "#333",
            fontWeight: "600"
          }}>
            ✨ 新規クエリ
          </h4>

          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85em", color: "#666", fontWeight: "500" }}>
            検索キーワード
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例: machine learning"
            style={{
              width: "100%",
              padding: "0.75rem",
              boxSizing: "border-box",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "0.9em",
              transition: "all 0.2s",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.border = "1px solid #667eea"}
            onBlur={(e) => e.target.style.border = "1px solid #e0e0e0"}
          />

          <label style={{ display: "block", marginTop: "1rem", marginBottom: "0.5rem", fontSize: "0.85em", color: "#666", fontWeight: "500" }}>
            取得件数
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value) || 5)}
            style={{
              width: "100%",
              padding: "0.75rem",
              boxSizing: "border-box",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "0.9em",
              transition: "all 0.2s",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.border = "1px solid #667eea"}
            onBlur={(e) => e.target.style.border = "1px solid #e0e0e0"}
          />

          <label style={{ display: "block", marginTop: "1rem", marginBottom: "0.5rem", fontSize: "0.85em", color: "#666", fontWeight: "500" }}>
            投稿日（この日以降）
          </label>
          <input
            type="date"
            value={dateAfter}
            onChange={(e) => setDateAfter(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              boxSizing: "border-box",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "0.9em",
              transition: "all 0.2s",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.border = "1px solid #667eea"}
            onBlur={(e) => e.target.style.border = "1px solid #e0e0e0"}
          />

          <label style={{ display: "block", marginTop: "1rem", marginBottom: "0.5rem", fontSize: "0.85em", color: "#666", fontWeight: "500" }}>
            投稿日（この日まで）
          </label>
          <input
            type="date"
            value={dateBefore}
            onChange={(e) => setDateBefore(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              boxSizing: "border-box",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "0.9em",
              transition: "all 0.2s",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.border = "1px solid #667eea"}
            onBlur={(e) => e.target.style.border = "1px solid #e0e0e0"}
          />

          <button
            onClick={addChannel}
            disabled={!query}
            style={{
              width: "100%",
              marginTop: "1.5rem",
              padding: "0.875rem",
              background: query
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: query ? "pointer" : "not-allowed",
              fontWeight: "600",
              fontSize: "0.95em",
              boxShadow: query ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (query) e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ➕ クエリを追加
          </button>
        </div>
      </div>
    </div>
  );
}
