import { useState } from "react";
import { fetchArxivPapers, type FetchOptions } from "./api/fetchArxiv";
import { QueryTabs } from "./components/QueryTabs";
import { PaperList } from "./components/PaperList";

type QueryResult = {
  papers: { title: string; authors: string; summary: string; link: string; published: string; submittedDate: string; updatedDate: string; category: string; subjects: string[] }[];
  executedAt: string; // クエリ実行日時
  options: FetchOptions;
};

type Folder = {
  id: string;
  name: string;
  isExpanded: boolean;
};

type Channel = {
  id: string;
  folderId: string | null; // null の場合はフォルダなし
  name: string;
  results: QueryResult[]; // 実行結果の履歴
  currentOptions: FetchOptions; // 現在のオプション設定
};

// 今日の日付をYYYY-MM-DD形式で取得
const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 1年前の日付をYYYY-MM-DD形式で取得
const getOneYearAgo = () => {
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  const year = oneYearAgo.getFullYear();
  const month = String(oneYearAgo.getMonth() + 1).padStart(2, '0');
  const day = String(oneYearAgo.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<string | null>(null); // channel ID or null
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(5);
  const [dateAfter, setDateAfter] = useState(getOneYearAgo());
  const [dateBefore, setDateBefore] = useState(getToday());
  const [nextId, setNextId] = useState(1);

  const createFolder = (name: string) => {
    const newFolder: Folder = {
      id: `folder-${nextId}`,
      name,
      isExpanded: true,
    };
    setFolders([...folders, newFolder]);
    setNextId(nextId + 1);
  };

  const addChannel = async () => {
    if (!query) return;
    const submittedDateAfter = dateAfter
      ? dateAfter.replace(/-/g, "") // YYYY-MM-DD -> YYYYMMDD
      : undefined;
    const submittedDateBefore = dateBefore
      ? dateBefore.replace(/-/g, "") // YYYY-MM-DD -> YYYYMMDD
      : undefined;
    const options: FetchOptions = {
      maxResults,
      submittedDateAfter,
      submittedDateBefore,
    };
    const papers = await fetchArxivPapers(query, options);
    const executedAt = new Date().toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const newResult = { papers, executedAt, options };
    const newChannel: Channel = {
      id: `channel-${nextId}`,
      folderId: null,
      name: query,
      results: [newResult],
      currentOptions: options,
    };
    setChannels([...channels, newChannel]);
    setActive(newChannel.id);
    setQuery("");
    setMaxResults(5);
    setDateAfter(getOneYearAgo());
    setDateBefore(getToday());
    setNextId(nextId + 1);
  };

  const deleteChannel = (id: string) => {
    const newChannels = channels.filter(c => c.id !== id);
    setChannels(newChannels);
    if (active === id) {
      setActive(null);
    }
  };

  const deleteFolder = (id: string) => {
    // フォルダに含まれているチャンネルを削除
    const channelsInFolder = channels.filter(c => c.folderId === id);
    const channelIdsToDelete = channelsInFolder.map(c => c.id);
    setChannels(channels.filter(c => !channelIdsToDelete.includes(c.id)));
    setFolders(folders.filter(f => f.id !== id));
    if (active !== null && channelIdsToDelete.includes(active)) {
      setActive(null);
    }
  };

  const toggleFolder = (id: string) => {
    setFolders(folders.map(f =>
      f.id === id ? { ...f, isExpanded: !f.isExpanded } : f
    ));
  };

  const moveChannelToFolder = (channelId: string, folderId: string | null) => {
    setChannels(channels.map(c =>
      c.id === channelId ? { ...c, folderId } : c
    ));
  };

  const reorderChannels = (fromId: string, toId: string) => {
    const fromIndex = channels.findIndex(c => c.id === fromId);
    const toIndex = channels.findIndex(c => c.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const newChannels = Array.from(channels);
    const [removed] = newChannels.splice(fromIndex, 1);
    newChannels.splice(toIndex, 0, removed);
    setChannels(newChannels);
  };

  const reloadChannel = async (channelId: string, customOptions?: FetchOptions) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;

    const options = customOptions || channel.currentOptions;
    const papers = await fetchArxivPapers(channel.name, options);

    // 重複排除: 既に表示されている論文を除外
    const existingLinks = new Set();
    channel.results.forEach(result => {
      result.papers.forEach(paper => {
        existingLinks.add(paper.link);
      });
    });

    const newPapers = papers.filter(paper => !existingLinks.has(paper.link));

    const executedAt = new Date().toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const newResult = { papers: newPapers, executedAt, options };
    setChannels(channels.map(c =>
      c.id === channelId ? {
        ...c,
        results: [...c.results, newResult],
        currentOptions: options
      } : c
    ));
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    }}>
      <QueryTabs
        folders={folders}
        channels={channels}
        active={active}
        setActive={setActive}
        query={query}
        setQuery={setQuery}
        addChannel={addChannel}
        deleteChannel={deleteChannel}
        reloadChannel={reloadChannel}
        reorderChannels={reorderChannels}
        createFolder={createFolder}
        deleteFolder={deleteFolder}
        toggleFolder={toggleFolder}
        moveChannelToFolder={moveChannelToFolder}
        maxResults={maxResults}
        setMaxResults={setMaxResults}
        dateAfter={dateAfter}
        setDateAfter={setDateAfter}
        dateBefore={dateBefore}
        setDateBefore={setDateBefore}
      />
      <div style={{
        flex: 1,
        padding: "2rem",
        overflowY: "auto",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)"
      }}>
        {active !== null ? (() => {
          const activeChannel = channels.find(c => c.id === active);
          if (!activeChannel) return null;
          return (
            <PaperList
              results={activeChannel.results}
              reloadChannel={() => reloadChannel(activeChannel.id)}
              channelIndex={active}
              currentOptions={activeChannel.currentOptions}
            />
          );
        })() : (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontSize: "1.2em",
            color: "#666"
          }}>
            クエリを追加してください。
          </div>
        )}
      </div>
    </div>
  );
}
