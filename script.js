const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".navigation");

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isExpanded);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      navigation.classList.remove("is-open");
    });
  });
}

document.querySelectorAll("[data-link-placeholder]").forEach((link) => {
  link.addEventListener("click", (event) => event.preventDefault());
});

const applyProjectFilter = (selectedCategory) => {
  let visibleProjects = 0;
  document.querySelectorAll(".project-card").forEach((card) => {
    const isVisible = card.dataset.featured === "true"
      && (selectedCategory === "all" || card.dataset.category === selectedCategory);
    card.hidden = !isVisible;
    if (isVisible) visibleProjects += 1;
  });

  const emptyState = document.querySelector("#featured-empty-state");
  if (emptyState) {
    emptyState.hidden = visibleProjects > 0;
    emptyState.textContent = "No featured projects yet";
  }
};

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;

    document.querySelectorAll(".filter-button").forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-active", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });

    applyProjectFilter(selectedCategory);
  });
});

const activeFilter = document.querySelector(".filter-button.is-active");
if (activeFilter) applyProjectFilter(activeFilter.dataset.filter);

const projectDialog = document.querySelector("#project-dialog");
const projectDialogMedia = document.querySelector("#project-dialog-media");
const contactDialog = document.querySelector("#contact-dialog");
const blogDialog = document.querySelector("#blog-dialog");
const blogDialogContent = document.querySelector("#blog-dialog-content");
const blogStories = new Map((window.blogStories || []).map((story) => [story.id, story]));

const createBlogEntry = (story) => {
  const article = document.createElement("article");
  article.className = "blog-entry";
  article.id = story.id;

  const category = document.createElement("p");
  category.className = "section-kicker";
  category.textContent = story.category;
  article.append(category);

  const title = document.createElement("h2");
  title.id = `${story.id}-title`;
  title.textContent = story.title;
  article.append(title);

  const meta = document.createElement("p");
  meta.className = "blog-detail-meta";
  meta.textContent = story.meta;
  article.append(meta);

  const layout = document.createElement("div");
  layout.className = "blog-story-layout";
  const gallery = document.createElement("div");
  gallery.className = "blog-photo-gallery";
  gallery.setAttribute("aria-label", `${story.title} photo gallery`);

  story.photos.forEach((photoSource, index) => {
    const photo = document.createElement("div");
    photo.className = "blog-photo-slot";

    if (typeof photoSource === "string" && photoSource.match(/\.(png|jpe?g|gif|webp|avif|svg)$/i)) {
      const image = document.createElement("img");
      image.src = photoSource;
      image.alt = `${story.title} photo ${index + 1}`;
      image.loading = "lazy";
      photo.append(image);
    } else {
      if (["cover-buildhers", "cover-devcon", "cover-blue", "cover-pink", "cover-lilac", "cover-gdg"].includes(photoSource)) {
        photo.classList.add(photoSource);
      }
      const placeholder = document.createElement("span");
      placeholder.className = "photo-placeholder";
      placeholder.setAttribute("aria-hidden", "true");
      const asterisk = document.createElement("img");
      asterisk.className = "ui-asterisk";
      asterisk.src = "assets/asteriskpink.png";
      asterisk.alt = "";
      placeholder.append(asterisk);
      const label = document.createElement("small");
      label.textContent = `EVENT PHOTO ${index + 1}`;
      placeholder.append(label);
      photo.append(placeholder);
    }

    gallery.append(photo);
  });

  const body = document.createElement("div");
  body.className = "blog-detail-body";

  if (story.quote) {
    const quote = document.createElement("blockquote");
    quote.className = "blog-quote";
    quote.textContent = story.quote;
    body.append(quote);
  }

  if (story.placeholder) {
    const placeholderNote = document.createElement("p");
    placeholderNote.className = "blog-placeholder-note";
    placeholderNote.textContent = story.placeholder;
    body.append(placeholderNote);
  }

  story.sections.forEach((section) => {
    const heading = document.createElement("h3");
    heading.textContent = section.heading;
    body.append(heading);
    section.paragraphs.forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      body.append(paragraph);
    });
  });

  layout.append(gallery, body);
  article.append(layout);
  return article;
};

const blogEntries = document.querySelector(".blog-entries");
if (blogEntries) {
  blogEntries.innerHTML = "";
  blogStories.forEach((story) => {
    blogEntries.appendChild(createBlogEntry(story));
  });
}

document.querySelectorAll(".blog-slide-card[data-blog-id], .blog-issue[data-blog-id]").forEach((card) => {
  const story = blogStories.get(card.dataset.blogId);
  const cover = card.querySelector(".blog-slide-cover, .blog-issue-cover");
  const title = card.querySelector(".blog-slide-copy strong, .blog-issue-copy strong");
  const category = card.querySelector(".blog-issue-meta");
  const summary = card.querySelector(
    ".blog-slide-copy > span, .blog-issue-copy > span:nth-child(3)"
  );
  const photoSource = story?.bannerPhoto || story?.photos[2];

  if (!story || !cover || !title || !summary || typeof photoSource !== "string") {
    console.error(`Unable to render carousel card for "${card.dataset.blogId}".`);
    return;
  }

  if (/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(photoSource)) {
    const image = document.createElement("img");
    image.src = photoSource;
    image.alt = `${story.title} banner`;
    cover.prepend(image);
  }

  title.textContent = story.title;
  if (category) category.textContent = story.category;
  summary.textContent = story.quote || story.sections[0]?.paragraphs[0] || "";
});

document.querySelectorAll(".project-card[data-project-title]").forEach((card) => {
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-haspopup", "dialog");
  card.setAttribute("aria-label", `${card.dataset.projectTitle}: open project details`);

  const openProject = () => {
    if (!projectDialog || !projectDialogMedia) return;
    const artwork = card.querySelector(".project-art");
    const title = document.querySelector("#project-dialog-title");
    const type = document.querySelector("#project-dialog-type");
    const date = document.querySelector("#project-dialog-date");
    const description = document.querySelector("#project-dialog-description");
    const role = document.querySelector("#project-dialog-role");
    const roleRow = document.querySelector("#project-dialog-role-row");
    const context = document.querySelector("#project-dialog-context");
    const contextRow = document.querySelector("#project-dialog-context-row");

    if (!artwork || !title || !type || !description || !role || !roleRow || !context || !contextRow) return;

    projectDialogMedia.replaceChildren(artwork.cloneNode(true));
    title.textContent = card.dataset.projectTitle || "";
    type.textContent = card.dataset.projectType || "";
    if (date) {
      date.textContent = card.dataset.projectDate || "";
      date.hidden = !card.dataset.projectDate;
    }
    description.textContent = card.dataset.projectDescription || "";
    role.textContent = card.dataset.projectRole || "";
    roleRow.hidden = !card.dataset.projectRole;
    context.textContent = card.dataset.projectContext || "";
    contextRow.hidden = !card.dataset.projectContext;
    projectDialog.showModal();
  };

  card.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    openProject();
  });

  card.addEventListener("keydown", (event) => {
    if (event.target !== card || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    openProject();
  });
});

document.querySelectorAll("[data-open-contact]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!contactDialog) return;
    event.preventDefault();
    contactDialog.showModal();
    contactDialog.querySelector("input[name='name']")?.focus();
  });
});

document.querySelectorAll(".blog-issue[data-blog-id]").forEach((card) => {
  card.setAttribute("aria-haspopup", "dialog");

  card.addEventListener("click", (event) => {
    const story = blogStories.get(card.dataset.blogId);
    if (!story) {
      console.error(`No shared blog story is configured for "${card.dataset.blogId}".`);
      return;
    }
    if (!blogDialog || !blogDialogContent) return;
    event.preventDefault();

    const article = createBlogEntry(story);
    article.querySelector("h2").id = "blog-dialog-title";
    blogDialogContent.replaceChildren(article);
    blogDialog.showModal();
  });
});

document.querySelectorAll(".blog-carousel-controls").forEach((controls) => {
  const carousel = controls.previousElementSibling;
  if (!carousel) return;

  controls.querySelectorAll("[data-carousel-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.carouselDirection);
      const card = carousel.querySelector(".blog-issue, .blog-slide-card");
      if (!card || !Number.isFinite(direction)) return;

      const cardStyle = getComputedStyle(card);
      const cardGap = Number.parseFloat(cardStyle.marginRight) || 0;
      const group = card.parentElement;
      const gap = Number.parseFloat(getComputedStyle(group).columnGap) || 0;
      const step = card.getBoundingClientRect().width + gap + cardGap;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      const nextScroll = carousel.scrollLeft + direction * step;
      carousel.scrollLeft = nextScroll < 0 ? maxScroll : nextScroll > maxScroll ? 0 : nextScroll;
    });
  });
});

document.querySelectorAll("dialog [data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog")?.close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  const status = document.createElement("p");
  status.className = "contact-form-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.hidden = true;
  form.append(status);
  form.noValidate = true;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const email = String(values.get("email") || "").trim();
    const message = String(values.get("message") || "").trim();
    const nameInput = form.elements.namedItem("name");
    const emailInput = form.elements.namedItem("email");
    const messageInput = form.elements.namedItem("message");

    nameInput.setCustomValidity(name ? "" : "Please enter your name.");
    emailInput.setCustomValidity(email ? "" : "Please enter your email address.");
    messageInput.setCustomValidity(message ? "" : "Please enter a message.");
    if (!form.reportValidity()) {
      status.textContent = "Please complete all fields with a valid email address.";
      status.hidden = false;
      return;
    }

    const subject = `Portfolio message from ${name}`;
    const body = `From: ${name} <${email}>\n\n${message}`;
    const mailtoUrl = `mailto:charlotenano29@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const fallbackLink = document.createElement("a");
    fallbackLink.href = mailtoUrl;
    fallbackLink.textContent = "Open your email app manually";
    status.replaceChildren(
      document.createTextNode("Your email app should open with this message ready to send. You still need to press Send in your email app. If it did not open, "),
      fallbackLink,
      document.createTextNode(".")
    );
    status.hidden = false;
    window.location.href = mailtoUrl;
  });
});

const engagementWidget = document.querySelector(".engagement-widget");
const engagementToggle = document.querySelector("#engagement-toggle");
const engagementPanel = document.querySelector("#engagement-panel");

if (engagementWidget && engagementToggle && engagementPanel) {
  const setEngagementPanelOpen = (isOpen) => {
    engagementPanel.hidden = !isOpen;
    engagementWidget.classList.toggle("is-open", isOpen);
    engagementToggle.setAttribute("aria-expanded", String(isOpen));
    engagementToggle.setAttribute(
      "aria-label",
      isOpen ? "Close heart counter" : "Open heart counter"
    );
  };

  engagementToggle.addEventListener("click", () => {
    setEngagementPanelOpen(engagementPanel.hidden);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!engagementWidget.contains(event.target)) {
      setEngagementPanelOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !engagementPanel.hidden) {
      setEngagementPanelOpen(false);
      engagementToggle.focus();
    }
  });
}

const giveHeartButton = document.querySelector("#give-heart");
const heartCountLabel = document.querySelector("#heart-count");
const heartStatus = document.querySelector("#heart-status");

if (giveHeartButton && heartCountLabel && heartStatus) {
  const supabaseUrl = "https://dzvpussncanqbcyyxgmh.supabase.co";
  const supabaseAnonKey = "sb_publishable_Gdliob9KV40ggYRGXjC1sA_ljMxvOZ0";
  const isSupabaseConfigured = !supabaseUrl.startsWith("YOUR_")
    && !supabaseAnonKey.startsWith("YOUR_");
  let heartRequestInProgress = false;

  const callHeartCounter = async (functionName) => {
    const response = await fetch(
      `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/rpc/${functionName}`,
      {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json"
        },
        body: "{}"
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`Supabase ${functionName} failed (${response.status}): ${errorMessage}`);
    }

    const count = Number(await response.json());
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error(`Supabase ${functionName} returned an invalid heart count.`);
    }
    return count;
  };

  if (!isSupabaseConfigured) {
    heartCountLabel.textContent = "—";
    giveHeartButton.disabled = true;
    heartStatus.textContent = "Add your Supabase project URL and public anon key in script.js.";
  } else {
    const refreshHeartCount = async () => {
      try {
        const count = await callHeartCounter("get_heart_count");
        heartCountLabel.textContent = String(count);
        heartStatus.textContent = "Hearts from visitors!";
      } catch (error) {
        console.error("Unable to load the shared heart count.", error);
        heartStatus.textContent = "Couldn't load the total hearts. Please try again.";
      }
    };

    giveHeartButton.disabled = false;
    heartCountLabel.textContent = "…";
    heartStatus.textContent = "Loading hearts total…";
    void refreshHeartCount();
    window.setInterval(() => {
      if (!document.hidden && !heartRequestInProgress) void refreshHeartCount();
    }, 30000);

    giveHeartButton.addEventListener("click", async () => {
      if (heartRequestInProgress) return;

      heartRequestInProgress = true;
      giveHeartButton.disabled = true;
      heartStatus.textContent = "Sending your heart…";

      try {
        const count = await callHeartCounter("increment_heart_count");
        heartCountLabel.textContent = String(count);
        heartStatus.textContent = "Your heart was added to the shared total. Thank you!";
      } catch (error) {
        console.error("Unable to add a heart to the shared total.", error);
        heartStatus.textContent = "Couldn't save your heart. Please try again.";
      } finally {
        heartRequestInProgress = false;
        giveHeartButton.disabled = false;
      }
    });
  }
}

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());
