(() => {
  "use strict";

  document.documentElement.classList.add("js");
  const dictionary = JSON.parse(document.querySelector("#translations").textContent);
  const supported = ["fr", "nl", "en"];
  const parameters = new URLSearchParams(location.search);
  let language = "fr";
  let savedLanguage;

  try {
    savedLanguage = localStorage.getItem("zybo-language");
  } catch {
    // The explicit URL language still works when storage is unavailable.
  }

  function translate(key) {
    return dictionary[key]?.[language] ?? key;
  }

  const translatable = [...document.querySelectorAll("[data-copy]")];
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const languageMenu = document.querySelector(".languages");
  const navigation = document.querySelector("#main-navigation");
  const toggle = document.querySelector(".menu-toggle");
  const currentLanguage = document.querySelector("[data-current-lang]");
  const linkPaths = [...document.querySelectorAll("a[href]")]
    .map(link => ({ link, path: link.getAttribute("href") }))
    .filter(({ path }) => path.startsWith("./") || path.startsWith("../"));

  function applyLanguage(next, remember = false) {
    language = supported.includes(next) ? next : "fr";
    document.documentElement.lang = language;
    document.title = translate("meta.title");
    document.querySelector('meta[name="description"]').content = translate("meta.description");
    navigation.setAttribute("aria-label", { fr: "Navigation principale", nl: "Hoofdnavigatie", en: "Main navigation" }[language]);
    currentLanguage.textContent = language.toUpperCase();

    for (const node of translatable) {
      node.textContent = translate(node.dataset.copy);
    }
    for (const button of languageButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    }
    for (const { link, path } of linkPaths) {
      if (language === "fr" && !parameters.has("lang")) {
        link.setAttribute("href", path);
      } else {
        const url = new URL(path, location.href);
        url.searchParams.set("lang", language);
        link.href = url.href;
      }
    }
    if (remember) {
      try {
        localStorage.setItem("zybo-language", language);
      } catch {
        // Keep the current document translated.
      }
      if (location.protocol !== "file:") {
        const url = new URL(location.href);
        url.searchParams.set("lang", language);
        history.replaceState(history.state, "", url);
      }
    }
    document.dispatchEvent(new Event("zybo:language"));
  }

  for (const button of languageButtons) {
    button.addEventListener("click", () => {
      applyLanguage(button.dataset.language, true);
      languageMenu.open = false;
      languageMenu.querySelector("summary").focus();
    });
  }

  function closeNavigation() {
    delete navigation.dataset.open;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    navigation.toggleAttribute("data-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) languageMenu.open = false;
  });
  navigation.addEventListener("click", event => {
    if (event.target.closest("a")) closeNavigation();
  });
  languageMenu.addEventListener("toggle", () => {
    if (languageMenu.open) closeNavigation();
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".languages")) languageMenu.open = false;
    if (!event.target.closest("#main-navigation, .menu-toggle")) closeNavigation();
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (languageMenu.open) {
      languageMenu.open = false;
      languageMenu.querySelector("summary").focus();
    } else if (navigation.hasAttribute("data-open")) {
      closeNavigation();
      toggle.focus();
    }
  });

  applyLanguage(parameters.get("lang") || savedLanguage);

  const form = document.querySelector("#contact-form");
  if (form) setupContact(form);

  function setupContact(contactForm) {
    const button = contactForm.querySelector('button[type="submit"]');
    const feedback = contactForm.querySelector(".form-status");
    const subject = contactForm.elements.namedItem("subject");
    let serviceKey = "service." + parameters.get("service");
    let previousSuggestion = "";
    const topics = contactForm.querySelector(".contact-topics");
    const topicButtons = topics ? [...topics.querySelectorAll("[data-contact-topic]")] : [];

    function updateTopics() {
      for (const topic of topicButtons) {
        const selected = "service." + topic.dataset.contactTopic === serviceKey && subject.value === previousSuggestion;
        topic.setAttribute("aria-pressed", String(selected));
      }
    }

    function suggestSubject() {
      if (!Object.hasOwn(dictionary, serviceKey) || subject.value !== previousSuggestion) return;
      previousSuggestion = translate(serviceKey);
      subject.value = previousSuggestion;
      updateTopics();
    }

    function showFeedback(key, state) {
      feedback.dataset.copy = key;
      feedback.dataset.state = state;
      feedback.textContent = translate(key);
    }

    suggestSubject();
    if (topics) topics.hidden = false;
    for (const topic of topicButtons) {
      topic.addEventListener("click", () => {
        serviceKey = "service." + topic.dataset.contactTopic;
        previousSuggestion = subject.value;
        suggestSubject();
      });
    }
    subject.addEventListener("input", updateTopics);
    document.addEventListener("zybo:language", () => {
      suggestSubject();
      if (feedback.dataset.copy) feedback.textContent = translate(feedback.dataset.copy);
    });

    contactForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (button.disabled) return;
      button.disabled = true;
      showFeedback("form.sending", "sending");

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(contactForm),
          signal: AbortSignal.timeout(18000),
        });
        if (!response.ok) {
          showFeedback("form.error", "error");
          return;
        }
        contactForm.reset();
        previousSuggestion = "";
        suggestSubject();
        showFeedback("form.sent", "success");
      } catch {
        showFeedback("form.error", "error");
      } finally {
        button.disabled = false;
      }
    });
  }

  const statusPanel = document.querySelector("[data-status]");
  if (statusPanel) setupStatus(statusPanel);

  function setupStatus(panel) {
    const targets = [
      { name: "status.home", url: panel.dataset.home },
      { name: "status.contact", url: panel.dataset.contact },
      { name: "GitHub API", url: "https://api.github.com/" },
    ];
    const cards = panel.querySelector("[data-status-cards]");
    const refresh = panel.querySelector("[data-refresh]");
    const lastCheck = panel.querySelector("[data-last-check]");
    let checkedAt = null;
    let results = [];
    let busy = false;

    function element(tag, value, className) {
      const node = document.createElement(tag);
      node.textContent = value;
      if (className) node.className = className;
      return node;
    }

    function render() {
      cards.replaceChildren(...targets.map(({ name }, index) => {
        const result = results[index];
        const card = element("article", "", "status-card");
        const chip = element("span", translate("status." + (result?.state ?? "checking")), "status-chip");
        chip.dataset.result = result?.state ?? "checking";
        card.append(element("h3", translate(name)), chip);
        if (result) {
          const details = element("dl", "");
          details.append(
            element("dt", translate("status.latency")), element("dd", result.ms ?? "—"),
            element("dt", "HTTP"), element("dd", result.http ?? "—"),
          );
          card.append(details);
        }
        return card;
      }));
      if (checkedAt) {
        lastCheck.dateTime = checkedAt.toISOString();
        lastCheck.textContent = checkedAt.toLocaleString({ fr: "fr-BE", nl: "nl-BE", en: "en-GB" }[language]);
      }
    }

    async function measure({ url }) {
      const start = performance.now();
      try {
        const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
        return {
          state: response.status === 200 ? "up" : "warn",
          ms: Math.round(performance.now() - start) + " ms",
          http: response.status,
        };
      } catch {
        return { state: "down" };
      }
    }

    async function check() {
      if (busy || document.hidden) return;
      busy = true;
      refresh.disabled = true;
      render();
      try {
        results = await Promise.all(targets.map(measure));
        checkedAt = new Date();
        render();
      } finally {
        refresh.disabled = false;
        busy = false;
      }
    }

    refresh.addEventListener("click", check);
    document.addEventListener("zybo:language", render);
    document.addEventListener("visibilitychange", check);
    render();
    check();
    setInterval(check, 10000);
  }

})();
