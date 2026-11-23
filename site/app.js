(() => {
  "use strict";

  const REPO = "https://github.com/4i7/LLM-News-Memo";
  const PAGE_SIZE = 36;
  const KIND_LABELS = {topic:"TOPIC", run:"RUN EVENT", report:"REPORT", reference:"GUIDE"};
  const STATUS_LABELS = {
    NEW:"新規", FOLLOW_UP:"続報", DUPLICATE:"重複",
    ONGOING_NO_NEWS:"新事実なし", UNCONFIRMED_SIGNAL:"未確認情報",
    covered:"既報", covered_watch:"既報・監視", watch_only:"監視のみ",
    duplicate:"重複", superseded:"更新済み", current:"現行", published:"公開"
  };
  const $ = (selector) => document.querySelector(selector);
  const els = {
    results:$("#results"), template:$("#document-template"), search:$("#search-input"),
    kindButtons:[...document.querySelectorAll("[data-kind]")],
    year:$("#year-filter"), organization:$("#organization-filter"),
    status:$("#status-filter"), sort:$("#sort-filter"), count:$("#result-count"),
    context:$("#result-context"), activeTags:$("#active-tags"), more:$("#load-more"),
    empty:$("#empty-state"), error:$("#load-error"), reset:$("#reset-filters"),
    generated:$("#generated-at"), theme:$("#theme-toggle"),
    dialog:$("#detail-dialog"), detailTitle:$("#detail-title"),
    detailSub:$("#detail-sub"), detailContent:$("#detail-content")
  };
  const state = {query:"", kind:"all", year:"all", organization:"all", status:"all", sort:"recent", tag:null};
  let catalog = null;
  let byId = new Map();
  let shown = PAGE_SIZE;
  let openId = null;

  function str(value) { return value == null ? "" : String(value); }
  function norm(value) { return str(value).normalize("NFKC").toLocaleLowerCase("ja-JP").trim(); }
  function shortDate(value) {
    const match = str(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? match[1] + "." + match[2] + "." + match[3] : "日付不明";
  }
  function statusLabel(value) { return STATUS_LABELS[value] || str(value).replaceAll("_", " "); }
  function githubUrl(doc) {
    return REPO + "/blob/main/" + str(doc.path).split("/").map(encodeURIComponent).join("/") +
      (doc.line ? "#L" + doc.line : "");
  }
  function option(select, value, label) {
    const el = document.createElement("option"); el.value = value; el.textContent = label; select.append(el);
  }
  function addText(parent, tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = str(value);
    if (className) node.className = className;
    parent.append(node);
    return node;
  }
  function addLink(parent, title, url) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) return;
      const anchor = addText(parent, "a", title || url);
      anchor.href = parsed.href;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    } catch (error) { /* A malformed source URL is displayed only as text elsewhere. */ }
  }
  function populateFilters() {
    const organizations = new Set();
    const statuses = new Set();
    for (const item of catalog.documents) {
      for (const org of item.organizations || []) if (org) organizations.add(org);
      if (item.status) statuses.add(item.status);
    }
    for (const year of catalog.years || []) option(els.year, year, year);
    for (const org of [...organizations].sort((a,b) => a.localeCompare(b, "ja"))) option(els.organization, org, org);
    for (const status of [...statuses].sort()) option(els.status, status, statusLabel(status));
  }
  function loadUrl() {
    const params = new URLSearchParams(location.search);
    const kind = params.get("kind");
    const sort = params.get("sort");
    state.query = params.get("q") || "";
    state.kind = ["all","topic","run","report","reference"].includes(kind) ? kind : "all";
    state.year = params.get("year") || "all";
    state.organization = params.get("org") || "all";
    state.status = params.get("status") || "all";
    state.sort = ["recent","oldest","title"].includes(sort) ? sort : "recent";
    state.tag = params.get("tag") || null;
    return params.get("doc");
  }
  function syncControls() {
    els.search.value = state.query;
    for (const [control,field] of [[els.year,"year"],[els.organization,"organization"],[els.status,"status"]]) {
      control.value = [...control.options].some(option => option.value === state[field]) ? state[field] : "all";
      state[field] = control.value;
    }
    els.sort.value = state.sort;
    els.kindButtons.forEach(button => {
      const active = button.dataset.kind === state.kind;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }
  function updateUrl() {
    const params = new URLSearchParams();
    if (state.query) params.set("q", state.query);
    if (state.kind !== "all") params.set("kind", state.kind);
    if (state.year !== "all") params.set("year", state.year);
    if (state.organization !== "all") params.set("org", state.organization);
    if (state.status !== "all") params.set("status", state.status);
    if (state.sort !== "recent") params.set("sort", state.sort);
    if (state.tag) params.set("tag", state.tag);
    if (openId) params.set("doc", openId);
    const query = params.toString();
    history.replaceState(null, "", location.pathname + (query ? "?" + query : ""));
  }
  function filterDocuments() {
    const terms = norm(state.query).split(/\s+/).filter(Boolean);
    return catalog.documents.filter(doc => {
      if (state.kind !== "all" && doc.kind !== state.kind) return false;
      if (state.year !== "all" && doc.year !== state.year) return false;
      if (state.organization !== "all" && !(doc.organizations || []).includes(state.organization)) return false;
      if (state.status !== "all" && doc.status !== state.status) return false;
      if (state.tag && !(doc.tags || []).includes(state.tag)) return false;
      const text = norm(doc.searchText);
      return terms.every(term => text.includes(term));
    }).sort((a,b) => {
      if (state.sort === "title") return str(a.title).localeCompare(str(b.title), "ja");
      if (state.sort === "oldest") return str(a.sortDate).localeCompare(str(b.sortDate));
      return str(b.sortDate).localeCompare(str(a.sortDate)) || str(a.title).localeCompare(str(b.title), "ja");
    });
  }
  function addTag(parent, tag) {
    const button = addText(parent, "button", "#" + tag, "tag-button");
    button.type = "button";
    button.title = tag + " で絞り込み";
    button.addEventListener("click", () => {
      state.tag = tag;
      applyState(true);
    });
  }
  function cardFor(doc) {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.querySelector(".category-badge").textContent = KIND_LABELS[doc.kind] || doc.kind;
    const year = node.querySelector(".year-badge");
    year.textContent = doc.year || "";
    year.hidden = !doc.year;
    const status = node.querySelector(".freshness-badge");
    status.textContent = statusLabel(doc.status);
    status.hidden = !doc.status;
    node.querySelector("h3").textContent = doc.title || doc.path;
    node.querySelector(".card-summary").textContent = doc.summary || "詳細を参照してください。";
    const facts = node.querySelector(".doc-meta");
    if (doc.organizations && doc.organizations.length) addText(facts,"span",doc.organizations.slice(0,3).join(" · "));
    if (doc.kind === "run" && doc.detail && doc.detail.run_name) addText(facts,"span",doc.detail.run_name);
    const tags = node.querySelector(".tag-list");
    for (const tag of (doc.tags || []).filter(Boolean).slice(0,5)) addTag(tags,tag);
    node.querySelector(".updated-at").textContent =
      (doc.kind === "topic" ? "最終確認: " : doc.kind === "run" ? "実行: " : "資料日: ") + shortDate(doc.sortDate);
    const github = node.querySelector(".source-link");
    github.href = githubUrl(doc);
    github.setAttribute("aria-label", doc.title + "をGitHubで開く");
    const open = node.querySelector(".open-detail");
    open.addEventListener("click", () => openDoc(doc.id));
    return node;
  }
  function renderTags() {
    els.activeTags.replaceChildren();
    if (!state.tag) return;
    const button = addText(els.activeTags, "button", "#" + state.tag + " ×", "filter-chip");
    button.type = "button";
    button.addEventListener("click", () => { state.tag = null; applyState(); });
  }
  function render() {
    const docs = filterDocuments();
    const visible = docs.slice(0,shown);
    els.results.replaceChildren(...visible.map(cardFor));
    els.results.setAttribute("aria-busy", "false");
    els.results.hidden = docs.length === 0;
    els.empty.hidden = docs.length !== 0;
    els.count.textContent = docs.length.toLocaleString("ja-JP");
    const filters = [];
    if (state.query) filters.push("「" + state.query + "」");
    if (state.kind !== "all") filters.push(KIND_LABELS[state.kind]);
    if (state.year !== "all") filters.push(state.year + "年");
    if (state.organization !== "all") filters.push(state.organization);
    if (state.status !== "all") filters.push(statusLabel(state.status));
    els.context.textContent = filters.join(" / ") || "全収録データ";
    els.more.hidden = docs.length <= shown;
    els.more.textContent = "さらに表示（" + visible.length + " / " + docs.length + "件）";
    renderTags();
  }
  function applyState(scroll = false) {
    shown = PAGE_SIZE;
    syncControls();
    updateUrl();
    render();
    if (scroll) $("#browser").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function preset(values) {
    Object.assign(state,{query:"",kind:"all",year:"all",organization:"all",status:"all",sort:"recent",tag:null},values);
    applyState(true);
  }
  function detailSection(parent, heading, values) {
    const list = Array.isArray(values) ? values.filter(Boolean) : [];
    if (!list.length) return;
    const section = addText(parent,"section","","detail-section");
    addText(section,"h3",heading);
    const ul = document.createElement("ul");
    for (const value of list) addText(ul,"li",value);
    section.append(ul);
  }
  function detailPairs(parent, entries) {
    const list = entries.filter(entry => entry[1] !== undefined && entry[1] !== null && entry[1] !== "");
    if (!list.length) return;
    const dl = document.createElement("dl");
    dl.className = "detail-facts";
    for (const [key,value] of list) {
      addText(dl,"dt",key);
      addText(dl,"dd",Array.isArray(value) ? value.join(" / ") : value);
    }
    parent.append(dl);
  }
  function topicDetail(parent, doc) {
    const data = doc.detail;
    detailPairs(parent, [
      ["初回確認",data.first_seen_jst],["最終確認",data.last_seen_jst],
      ["収録状況",statusLabel(data.coverage_status)],["最終レポート",data.last_report],
      ["組織",data.organizations],["製品・モデル",data.products],
      ["イベント種別",data.event_type],["信頼度",data.confidence],
      ["収録根拠",data.seed_basis]
    ]);
    detailSection(parent,"確認済み・記録済みの事実",data.known_facts);
    detailSection(parent,"再掲載が必要となる条件",data.reinclude_only_if);
    detailSection(parent,"別名・検索用語",data.aliases);
    if (data.treatment) { const section=addText(parent,"section","","detail-section"); addText(section,"h3","運用上の扱い"); addText(section,"p",data.treatment); }
    if (data.notes) { const section=addText(parent,"section","","detail-section"); addText(section,"h3","補足・留保"); addText(section,"p",data.notes); }
    const sources = (data.sources || []).filter(Boolean);
    if (sources.length) {
      const section=addText(parent,"section","","detail-section");
      addText(section,"h3","出典");
      const ul=document.createElement("ul");
      for (const url of sources) {
        const li=document.createElement("li");
        addLink(li,url,url);
        if (!li.childElementCount) li.textContent=str(url);
        ul.append(li);
      }
      section.append(ul);
    }
  }
  function runDetail(parent, doc) {
    const data = doc.detail;
    detailPairs(parent, [
      ["実行名",data.run_name],["実行日時",data.run_time_jst],
      ["判定",statusLabel(data.classification)],["トピック識別子",data.topic_key],
      ["該当ファイル",data.topic_record_path],["復旧・追記情報",data.writeback_recovery]
    ]);
    if (data.notes) {
      const section=addText(parent,"section","","detail-section");
      addText(section,"h3","判定理由・差分");
      addText(section,"p",data.notes);
    }
    if (doc.relatedTopicId && byId.has(doc.relatedTopicId)) {
      const button=addText(parent,"button","関連するトピックの詳細を読む","load-more");
      button.type="button";
      button.addEventListener("click",()=>openDoc(doc.relatedTopicId));
    }
  }
  function openDoc(id) {
    const doc = byId.get(id);
    if (!doc) return;
    openId = id;
    els.detailTitle.textContent = doc.title;
    els.detailSub.textContent = (KIND_LABELS[doc.kind] || doc.kind) + " / " + shortDate(doc.date);
    els.detailContent.replaceChildren();
    const actions=addText(els.detailContent,"div","","detail-actions");
    addLink(actions,"GitHubの原文を開く",githubUrl(doc));
    if (doc.kind === "topic") topicDetail(els.detailContent,doc);
    else if (doc.kind === "run") runDetail(els.detailContent,doc);
    else {
      const article = addText(els.detailContent,"article","","article-body");
      // HTML is generated by Mistune's escape=True renderer from repository Markdown.
      article.innerHTML = doc.bodyHtml || "";
    }
    if (!els.dialog.open) els.dialog.showModal();
    els.detailContent.scrollTop = 0;
    updateUrl();
  }
  function bindEvents() {
    let timer;
    els.search.addEventListener("input",()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{state.query=els.search.value.trim();state.tag=null;applyState();},120);
    });
    for (const [control,field] of [[els.year,"year"],[els.organization,"organization"],[els.status,"status"],[els.sort,"sort"]]) {
      control.addEventListener("change",()=>{state[field]=control.value;applyState();});
    }
    els.kindButtons.forEach(button=>button.addEventListener("click",()=>{
      state.kind=button.dataset.kind;
      state.status="all";
      applyState();
    }));
    document.querySelectorAll("[data-preset-kind]").forEach(button=>button.addEventListener("click",()=>preset({kind:button.dataset.presetKind})));
    document.querySelectorAll("[data-preset]").forEach(button=>button.addEventListener("click",()=>preset(JSON.parse(button.dataset.preset))));
    els.reset.addEventListener("click",()=>preset({}));
    els.more.addEventListener("click",()=>{shown+=PAGE_SIZE;render();});
    $("#detail-close").addEventListener("click",()=>els.dialog.close());
    els.dialog.addEventListener("click",event=>{if(event.target===els.dialog)els.dialog.close();});
    els.dialog.addEventListener("close",()=>{openId=null;updateUrl();});
    document.addEventListener("keydown",event=>{
      const typing=event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement;
      if (event.key==="/" && !typing && !els.dialog.open) { event.preventDefault();els.search.focus(); }
      if (event.key==="Escape" && document.activeElement===els.search && els.search.value) { state.query="";applyState(); }
    });
  }
  function setupTheme() {
    const modes=["auto","light","dark"];
    let initial="auto";
    try { initial=localStorage.getItem("llm-news-memo-theme") || "auto"; } catch (_) {}
    if (!modes.includes(initial)) initial="auto";
    document.documentElement.dataset.theme=initial;
    els.theme.addEventListener("click",()=>{
      const current=document.documentElement.dataset.theme;
      const next=modes[(modes.indexOf(current)+1)%modes.length];
      document.documentElement.dataset.theme=next;
      els.theme.title="表示テーマ: "+next;
      try { localStorage.setItem("llm-news-memo-theme",next); } catch (_) {}
    });
  }
  async function init() {
    setupTheme();
    try {
      const response=await fetch("./catalog.json",{cache:"no-store"});
      if (!response.ok) throw new Error("catalog HTTP "+response.status);
      catalog=await response.json();
      if (catalog.schemaVersion!==1 || !Array.isArray(catalog.documents)) throw new Error("Invalid catalog");
      byId=new Map(catalog.documents.map(doc=>[doc.id,doc]));
      populateFilters();
      const initialDoc=loadUrl();
      els.generated.textContent=shortDate(catalog.generatedAt);
      for (const [key,id] of [["topics","#metric-topics"],["runs","#metric-runs"],["reports","#metric-reports"],["references","#metric-references"]])
        $(id).textContent=(catalog.counts[key] || 0).toLocaleString("ja-JP");
      bindEvents();
      applyState();
      if (initialDoc && byId.has(initialDoc)) openDoc(initialDoc);
    } catch (error) {
      console.error("Failed to initialize the browser:",error);
      els.results.hidden=true;
      els.more.hidden=true;
      els.error.hidden=false;
      els.generated.textContent="読み込み失敗";
      els.results.setAttribute("aria-busy","false");
    }
  }
  init();
})();
