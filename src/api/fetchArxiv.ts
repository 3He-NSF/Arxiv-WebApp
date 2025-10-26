// src/api/fetchArxiv.ts

interface ArxivEntry {
  title: string;
  authors: string;
  summary: string;
  link: string;
  published: string; // 公開日
  submittedDate: string; // 投稿日
  updatedDate: string; // 更新日
  category: string; // メインカテゴリ
  subjects: string[]; // 全てのSubject分類
}

export interface FetchOptions {
  maxResults?: number;
  submittedDateAfter?: string; // YYYYMMDD format
  submittedDateBefore?: string; // YYYYMMDD format
}

export async function fetchArxivPapers(
  query: string,
  options: FetchOptions = {}
): Promise<ArxivEntry[]> {
  const maxResults = options.maxResults || 5;
  const submittedDateAfter = options.submittedDateAfter;
  const submittedDateBefore = options.submittedDateBefore;

  let searchQuery = `all:${encodeURIComponent(query)}`;

  // 日付範囲の構築
  if (submittedDateAfter && submittedDateBefore) {
    searchQuery += `+AND+submittedDate:[${submittedDateAfter}+TO+${submittedDateBefore}]`;
  } else if (submittedDateAfter) {
    searchQuery += `+AND+submittedDate:[${submittedDateAfter}+TO+NOW]`;
  } else if (submittedDateBefore) {
    searchQuery += `+AND+submittedDate:[19700101+TO+${submittedDateBefore}]`;
  }

  const url = `https://export.arxiv.org/api/query?search_query=${searchQuery}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`;
  const res = await fetch(url);
  const text = await res.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");

  const entries = xmlDoc.getElementsByTagName("entry");

  return Array.from(entries).map((entry) => {
    const title = entry.getElementsByTagName("title")[0]?.textContent || "";
    const authors = Array.from(entry.getElementsByTagName("author"))
      .map((author) => {
        const name = author.getElementsByTagName("name")[0]?.textContent || "";
        return name;
      })
      .join(", ");
    const summary = entry.getElementsByTagName("summary")[0]?.textContent || "";
    const link = entry.getElementsByTagName("id")[0]?.textContent || "";
    const published = entry.getElementsByTagName("published")[0]?.textContent || "";
    const updated = entry.getElementsByTagName("updated")[0]?.textContent || "";

    // Extract dates in YYYY-MM-DD format
    const publishedDate = published ? published.substring(0, 10) : "";
    const updatedDate = updated ? updated.substring(0, 10) : "";

    // Note: arXiv API does not return submittedDate in the XML response.
    // The published date is the first appearance of the paper on arXiv.
    // If you need the actual submission date, you would need to scrape
    // the individual paper page or use a different API endpoint.
    // For now, we use published as the submitted date.
    const submittedDate = publishedDate;

    // Get primary category
    const primaryCategory = entry.getElementsByTagName("primary_category")[0];
    const category = primaryCategory ? primaryCategory.getAttribute("term") || "" : "";

    // Get all subjects (categories)
    const categories = entry.getElementsByTagName("category");
    const subjects = Array.from(categories)
      .map(cat => cat.getAttribute("term") || "")
      .filter(term => term !== "");

    return {
      title,
      authors,
      summary,
      link,
      published: publishedDate,
      submittedDate,
      updatedDate,
      category,
      subjects,
    };
  });
}
