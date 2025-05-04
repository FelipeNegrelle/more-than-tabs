function isYouTubeUrl(url) {
  return url && url.includes("youtube.com");
}

async function isBlockingEnabled() {
  const { blockingEnabled } = await browser.storage.local.get("blockingEnabled");
  return blockingEnabled !== false;            // default = true
}

/* ------------- força manter só 1 aba YouTube ------------- */
async function closeExtraYouTubeTabs() {
  const allTabs = await browser.tabs.query({});
  const youtubeTabs = allTabs.filter(t => isYouTubeUrl(t.url));

  if (youtubeTabs.length <= 1) return;

  // Mantém a mais antiga (menor id) e fecha o resto
  youtubeTabs.sort((a, b) => a.id - b.id);
  const [keep, ...others] = youtubeTabs;

  await browser.tabs.remove(others.map(t => t.id));
  await browser.tabs.update(keep.id, { active: true });
}

/* --------- listeners normais enquanto bloqueio ativo --------- */

browser.tabs.onCreated.addListener(async (tab) => {
  if (!isYouTubeUrl(tab.url) || !(await isBlockingEnabled())) return;

  const allTabs = await browser.tabs.query({});
  const others = allTabs.filter(t => isYouTubeUrl(t.url) && t.id !== tab.id);

  if (others.length) {
    await browser.tabs.remove(tab.id);
    await browser.tabs.update(others[0].id, { active: true });
  }
});

browser.tabs.onUpdated.addListener(async (id, changeInfo) => {
  if (!isYouTubeUrl(changeInfo.url) || !(await isBlockingEnabled())) return;

  const allTabs = await browser.tabs.query({});
  const others = allTabs.filter(t => isYouTubeUrl(t.url) && t.id !== id);

  if (others.length) {
    await browser.tabs.remove(id);
    await browser.tabs.update(others[0].id, { active: true });
  }
});

/* ------------- recebe pedido do popup ---------------- */
browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === "enforceYouTubeLimit" && await isBlockingEnabled()) {
    closeExtraYouTubeTabs();
  }
});
