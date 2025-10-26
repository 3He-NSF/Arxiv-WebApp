import { useState } from "react";
import type { FetchOptions } from "../api/fetchArxiv";

type Paper = {
  title: string;
  authors: string;
  summary: string;
  link: string;
  published: string; // 公開日
  submittedDate: string; // 投稿日
  updatedDate: string; // 更新日
  category: string;
  subjects: string[];
};

type QueryResult = {
  papers: Paper[];
  executedAt: string;
  options: FetchOptions;
};

export function PaperList({ 
  results, 
  reloadChannel, 
  currentOptions 
}: { 
  results: QueryResult[];
  reloadChannel: (options?: FetchOptions) => Promise<void>;
  currentOptions: FetchOptions;
}) {
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [customMaxResults, setCustomMaxResults] = useState(currentOptions.maxResults || 5);

  // 日付範囲のstate（YYYY-MM-DD形式）
  const [customDateAfter, setCustomDateAfter] = useState(
    currentOptions.submittedDateAfter
      ? currentOptions.submittedDateAfter.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
      : ""
  );
  const [customDateBefore, setCustomDateBefore] = useState(
    currentOptions.submittedDateBefore
      ? currentOptions.submittedDateBefore.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
      : ""
  );

  const toggleAbstract = (resultIndex: number, paperIndex: number) => {
    const key = `${resultIndex}-${paperIndex}`;
    const newSet = new Set(expandedAbstracts);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedAbstracts(newSet);
  };

  const copyToClipboard = async (text: string, resultIndex: number, paperIndex: number) => {
    try {
      await navigator.clipboard.writeText(text);
      const key = `${resultIndex}-${paperIndex}`;
      setCopiedIndex(key);
      setTimeout(() => setCopiedIndex(null), 2000); // 2秒後に消す
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("コピーに失敗しました");
    }
  };

  const handleReloadWithOptions = async () => {
    const options: FetchOptions = {
      maxResults: customMaxResults,
      submittedDateAfter: customDateAfter ? customDateAfter.replace(/-/g, "") : undefined,
      submittedDateBefore: customDateBefore ? customDateBefore.replace(/-/g, "") : undefined,
    };
    await reloadChannel(options);
    setShowOptions(false);
  };

  const getCategoryDisplay = (category: string) => {
    if (!category) return "";
    // arXivのカテゴリを整形して表示
    return category.split(".").pop()?.toUpperCase() || category;
  };

  return (
    <div>
      <div style={{
        marginBottom: "2rem",
        padding: "1rem",
        background: "rgba(102, 126, 234, 0.05)",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{ fontSize: "0.9em", color: "#666" }}>
          検索結果: {results.length} 回実行
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            style={{
              padding: "0.5rem 1rem",
              background: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85em",
              fontWeight: "500",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#764ba2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#667eea"}
          >
            ⚙️ オプション変更して再検索
          </button>
        </div>
      </div>

      {showOptions && (
        <div style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>検索オプション</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9em" }}>
              取得件数
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={customMaxResults}
              onChange={(e) => setCustomMaxResults(parseInt(e.target.value) || 5)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "6px"
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9em" }}>
              投稿日（この日以降）
            </label>
            <input
              type="date"
              value={customDateAfter}
              onChange={(e) => setCustomDateAfter(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "6px"
              }}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9em" }}>
              投稿日（この日まで）
            </label>
            <input
              type="date"
              value={customDateBefore}
              onChange={(e) => setCustomDateBefore(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "6px"
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleReloadWithOptions}
              style={{
                padding: "0.5rem 1rem",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9em",
                fontWeight: "500"
              }}
            >
              🔄 再検索
            </button>
            <button
              onClick={() => setShowOptions(false)}
              style={{
                padding: "0.5rem 1rem",
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
      )}

      {results.map((result, resultIndex) => (
        <div key={resultIndex} style={{
          marginBottom: "2rem",
          paddingBottom: "2rem",
          borderBottom: resultIndex < results.length - 1 ? "2px solid rgba(0, 0, 0, 0.1)" : "none"
        }}>
          <div style={{
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)"
          }}>
            <span style={{
              fontSize: "0.9em",
              color: "#666"
            }}>
              📅 {result.executedAt}
            </span>
          </div>
          {result.papers.map((p, i) => {
            const paperKey = `${resultIndex}-${i}`;
            const isExpanded = expandedAbstracts.has(paperKey);
            const displayText = isExpanded
              ? p.summary
              : p.summary.substring(0, 200) + (p.summary.length > 200 ? "..." : "");
            const isCopied = copiedIndex === paperKey;

            return (
              <div
                key={i}
                style={{
                  marginBottom: "1.5rem",
                  background: "white",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s",
                  border: "1px solid rgba(0, 0, 0, 0.05)"
                }}
              >
                <h3 style={{
                  marginBottom: "0.75rem",
                  fontSize: "1.3em",
                  color: "#1a1a1a",
                  fontWeight: "600",
                  lineHeight: "1.4"
                }}>
                  {p.title}
                </h3>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "0.75rem",
                  flexWrap: "wrap"
                }}>
                  <span style={{
                    color: "#667eea",
                    fontSize: "0.9em",
                    fontWeight: "500"
                  }}>
                    👤 {p.authors}
                  </span>
                  {p.subjects && p.subjects.length > 0 && (
                    <>
                      <span style={{ color: "#999", fontSize: "0.85em" }}>•</span>
                      <span style={{
                        color: "#28a745",
                        fontSize: "0.85em",
                        fontWeight: "500"
                      }}>
                        📚 {p.subjects.join(", ")}
                      </span>
                    </>
                  )}
                  {p.submittedDate && (
                    <>
                      <span style={{ color: "#999", fontSize: "0.85em" }}>•</span>
                      <span style={{
                        color: "#666",
                        fontSize: "0.9em"
                      }}>
                        📅 {p.submittedDate}
                      </span>
                    </>
                  )}
                  {p.updatedDate && p.updatedDate !== p.submittedDate && (
                    <>
                      <span style={{ color: "#999", fontSize: "0.85em" }}>•</span>
                      <span style={{
                        color: "#888",
                        fontSize: "0.9em"
                      }}>
                        🔄 最終更新: {p.updatedDate}
                      </span>
                    </>
                  )}
                  {p.category && (
                    <>
                      <span style={{ color: "#999", fontSize: "0.85em" }}>•</span>
                      <span style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.75em",
                        fontWeight: "600"
                      }}>
                        🏷️ {getCategoryDisplay(p.category)}
                      </span>
                    </>
                  )}
                </div>
                <div style={{
                  marginBottom: "0.75rem",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-start"
                }}>
                  {p.summary.length > 200 && (
                    <button
                      onClick={() => toggleAbstract(resultIndex, i)}
                      title={isExpanded ? "Collapse abstract" : "Expand abstract"}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#667eea",
                        fontSize: "0.9em",
                        cursor: "pointer",
                        padding: "0",
                        width: "1.5rem",
                        height: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s",
                        marginTop: "0.1rem"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>
                  )}
                  <p style={{
                    lineHeight: "1.6",
                    color: "#444",
                    flex: 1,
                    margin: 0
                  }}>
                    {displayText}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {isExpanded && (
                    <button
                      onClick={() => copyToClipboard(p.summary, resultIndex, i)}
                      title="Copy abstract"
                      style={{
                        background: isCopied ? "#28a745" : "rgba(40, 167, 69, 0.1)",
                        border: "none",
                        color: isCopied ? "white" : "#28a745",
                        padding: "0.5rem",
                        borderRadius: "6px",
                        fontSize: "1.2em",
                        cursor: "pointer",
                        width: "2.5rem",
                        height: "2.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (!isCopied) {
                          e.currentTarget.style.background = "rgba(40, 167, 69, 0.2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isCopied ? "#28a745" : "rgba(40, 167, 69, 0.1)";
                      }}
                    >
                      {isCopied ? "✓" : "⧉"}
                    </button>
                  )}
                </div>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    fontSize: "1em",
                    color: "#667eea",
                    fontFamily: "monospace",
                    textDecoration: "underline",
                    marginTop: "0.5rem",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#764ba2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#667eea";
                  }}
                >
                  {p.link}
                </a>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
