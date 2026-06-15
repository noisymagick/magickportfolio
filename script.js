// Ожидание полной загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    
    /* --- JSON Локализация --- */
    let translations = {};
    try {
        const response = await fetch('lang.json');
        translations = await response.json();
    } catch (e) {
        console.error("Failed to load language file:", e);
        return;
    }

    const buttons = document.querySelectorAll(".lang-btn");
    let currentLang = localStorage.getItem("lang") || "ru";

    const updateUI = (lang) => {
        currentLang = lang;
        localStorage.setItem("lang", lang);
        
        buttons.forEach(btn => btn.classList.toggle("active", btn.dataset.lang === lang));
        
        // Перевод элементов с data-i18n
        document.querySelectorAll("[data-i18n]").forEach(el => {
            const keys = el.dataset.i18n.split('.');
            let value = translations[lang];
            keys.forEach(k => value = value[k]);
            
            if (el.tagName === 'DIV' || el.tagName === 'P' || el.tagName === 'H2') {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });

        // Перевод атрибутов data-i18n-attr (e.g., placeholder)
        document.querySelectorAll("[data-i18n-attr]").forEach(el => {
            const [attr, keyPath] = el.dataset.i18nAttr.split(':');
            const keys = keyPath.split('.');
            let value = translations[lang];
            keys.forEach(k => value = value[k]);
            el.setAttribute(attr, value);
        });

        // Перевод карточек проектов (data-ru/data-en)
        document.querySelectorAll("[data-ru]").forEach(el => {
            el.textContent = el.getAttribute(`data-${lang}`);
        });

        // Динамический список опыта
        const expList = document.getElementById("experience-list");
        if (expList) {
            expList.innerHTML = translations[lang].hero.experience_list.map(t => `<p>${t}</p>`).join('');
        }

        // Обновление Soon
        const cursor = document.querySelector(".cursor-soon");
        if (cursor) cursor.textContent = translations[lang].general.soon;

        // Перерисовка индикатора
        requestAnimationFrame(() => {
            const activeLink = document.querySelector(`.nav-left a[href="#${activeLinkId}"]`);
            if (activeLink) updateIndicator(activeLink);
        });
    };

    buttons.forEach(button => {
        button.addEventListener("click", () => updateUI(button.dataset.lang));
    });

    updateUI(currentLang);
    document.documentElement.classList.add("lang-loaded");
    document.body.classList.add("lang-loaded");

    /* --- Навигация и Индикатор --- */
    const navLinks = document.querySelectorAll(".nav-left a");
    const navContainer = document.querySelector(".nav-left");
    const indicator = document.querySelector(".nav-indicator");
    let activeLinkId = "home";

    const updateIndicator = (el) => {
        const navRect = navContainer.getBoundingClientRect();
        const linkRect = el.getBoundingClientRect();
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.left = `${linkRect.left - navRect.left}px`;
    };

    if (!document.getElementById(activeLinkId)) {
        indicator.style.display = 'none';
    } else {
        navLinks.forEach(link => {
            link.addEventListener("mouseenter", () => updateIndicator(link));
        });
        navContainer.addEventListener("mouseleave", () => {
            const activeLink = document.querySelector(`.nav-left a[href="#${activeLinkId}"]`);
            if (activeLink) updateIndicator(activeLink);
        });
        const initialActive = document.querySelector(`.nav-left a[href="#${activeLinkId}"]`) || navLinks[0];
        if (initialActive) updateIndicator(initialActive);
    }

    /* --- Секции и Анимации --- */
    const sections = document.querySelectorAll(".reveal");
    const portrait = document.querySelector(".portrait");

    const handleScroll = () => {
        if (portrait) portrait.classList.toggle("hidden", window.scrollY > 10);

        let current = "";
        sections.forEach(section => {
            if (window.scrollY >= (section.offsetTop - window.innerHeight * 0.3)) {
                current = section.getAttribute("id");
            }
            section.classList.toggle("visible", 
                window.scrollY >= (section.offsetTop - window.innerHeight * 0.8) && 
                window.scrollY < (section.offsetTop + section.clientHeight - window.innerHeight * 0.2)
            );
        });

        if (current && current !== activeLinkId) {
            activeLinkId = current;
            const activeLink = document.querySelector(`.nav-left a[href="#${activeLinkId}"]`);
            if (activeLink) requestAnimationFrame(() => updateIndicator(activeLink));
        }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    /* --- Архив проектов --- */
    const archiveGrid = document.getElementById("archive-grid");
    if (archiveGrid) {
        const modal = document.createElement("div");
        modal.className = "image-modal";
        modal.innerHTML = `<span class="close-modal">&times;</span><img src="" alt="Full size">`;
        document.body.appendChild(modal);
        const modalImg = modal.querySelector("img");
        modal.querySelector(".close-modal").onclick = () => modal.style.display = "none";
        modal.onclick = (e) => { if(e.target === modal) modal.style.display = "none"; };

        const archiveImages = ["Ahmad Fashion Prints.jpg", "Ahmad Fashion-1.jpg", "Ahmad Fashion.jpg", "BF_Bag.png", "Boho_logo.jpg", "Cassette Visual-1.png", "Cassette.png", "Cave_Rocknroll_Typography.jpg", "Cover.jpg", "Crystalgloww Cover.jpg", "EGSN.png", "Gazel Poster.jpg", "Gegen Cover.jpg", "Gegen Logo.jpg", "HF Poster.jpg", "Hellsteel Poster.jpg", "KeramaRama Poster.jpg", "Lettering-2.jpg", "Lettering.jpg", "Logo Sketch.jpg", "Logo-1.jpg", "Logo-2.jpg", "Logo-3.jpg", "Logo-4.jpg", "Logo.jpg", "Logotype.jpg", "Markul Cover.jpg", "Merch Bag.jpg", "Merch T-Shirt-1.jpg", "Merch T-Shirt.jpg", "Mockup.jpg", "Monument Logo.jpg", "Nonamegig Poster.jpg", "Poster Ahmad Fashion.jpg", "Poster Alkali.jpg", "PuffusThai.jpeg", "PuffusThai.jpg", "Sonya Poster.jpg", "UHO Poster 2026.jpg", "ftw_sticker.png", "logo_ftw.png", "zine1.png", "zine2.png", "zine3.png", "zine4.png", "Красногвардейская Poster.jpg", "МРАКОБЕС Tour Poster.jpg", "Монумент Cover.jpg", "Москва А2.jpg", "Нижний А2.jpg", "Рыцарь Горя Cover.jpg", "Туровая А2.jpg", "Ярославль А2.jpg"];
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === "flex") {
                modal.style.display = "none";
            }
        });

        archiveImages.sort(() => Math.random() - 0.5).forEach(src => {
            const img = document.createElement("img");
            img.src = `img_archive/${src}`;
            img.loading = "lazy";
            img.onclick = () => { modalImg.src = img.src; modal.style.display = "flex"; };
            archiveGrid.appendChild(img);
        });
    }

    /* --- Теги услуг --- */
    const serviceTags = document.getElementById("service-tags");
    if (serviceTags) {
        // Инициализация
        const getTags = () => (currentLang === "ru" ? translations.ru.hero.tags : translations.en.hero.tags).split(",");
        let tags = getTags();
        let i = 0;
        serviceTags.textContent = tags[0];
        serviceTags.style.opacity = "1";

        setInterval(() => {
            tags = getTags();
            i = (i + 1) % tags.length;
            serviceTags.style.opacity = "0";
            setTimeout(() => {
                serviceTags.textContent = tags[i];
                serviceTags.style.opacity = "1";
            }, 300);
        }, 2000);
    }

    /* --- Проекты: NDA и Soon --- */
    const cursor = document.createElement("div");
    cursor.className = "cursor-soon";
    cursor.textContent = currentLang === "ru" ? "Скоро" : "Soon";
    document.body.appendChild(cursor);

    const ndaModal = document.getElementById("nda-modal");
    const ndaInput = document.getElementById("nda-input");
    const ndaSubmit = document.getElementById("nda-submit");

    document.querySelectorAll(".project-card").forEach(card => {
        if (card.dataset.status === "soon") {
            card.addEventListener("click", (e) => e.preventDefault());
            card.addEventListener("mousemove", (e) => {
                if(window.innerWidth > 768) {
                    cursor.style.left = (e.clientX + 15) + "px";
                    cursor.style.top = (e.clientY + 15) + "px";
                    cursor.style.opacity = "1";
                }
            });
            card.addEventListener("mouseleave", () => cursor.style.opacity = "0");
            card.addEventListener("click", (e) => {
                if(window.innerWidth <= 768) {
                    cursor.style.left = e.clientX + "px";
                    cursor.style.top = e.clientY + "px";
                    cursor.style.opacity = "1";
                    
                    setTimeout(() => {
                        cursor.style.opacity = "0";
                    }, 1000);
                }
            });
        } else if (card.dataset.status === "nda") {
            card.addEventListener("click", (e) => {
                e.preventDefault();
                ndaModal.style.display = "flex";
                ndaInput.focus();
                const checkNda = () => {
                    if (ndaInput.value === "1111") {
                        ndaModal.style.display = "none";
                        ndaInput.value = "";
                        ndaInput.placeholder = translations[currentLang].nda.placeholder;
                        window.location.href = card.dataset.project;
                    } else {
                        ndaInput.value = "";
                        ndaInput.placeholder = translations[currentLang].nda.error;
                    }
                };

                ndaSubmit.onclick = checkNda;
                ndaInput.onkeydown = (e) => {
                    if (e.key === 'Enter') checkNda();
                };
            });
        }
    });

    if(ndaModal) {
        const closeNda = () => {
            ndaModal.style.display = "none";
            ndaInput.placeholder = translations[currentLang].nda.placeholder;
            ndaInput.value = "";
        };
        ndaModal.onclick = (e) => { if(e.target === ndaModal) closeNda(); };
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && ndaModal.style.display === "flex") closeNda();
        });
    }

    /**
     * Grain Effect
     */
    class Grain {
      constructor(el) {
        /**
         * Настройки зерна:
         * patternSize: размер сетки (меньше значение = мельче шум)
         * patternAlpha: прозрачность шума (0-255)
         */
        this.patternSize = 600;
        this.patternScaleX = 1;
        this.patternScaleY = 1;
        this.patternRefreshInterval = 6;
        this.patternAlpha = 6;

        this.canvas = el;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.scale(this.patternScaleX, this.patternScaleY);

        this.patternCanvas = document.createElement("canvas");
        this.patternCanvas.width = this.patternSize;
        this.patternCanvas.height = this.patternSize;
        this.patternCtx = this.patternCanvas.getContext("2d");
        this.patternData = this.patternCtx.createImageData(
          this.patternSize,
          this.patternSize
        );
        this.patternPixelDataLength = this.patternSize * this.patternSize * 4;

        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);

        this.frame = 0;

        window.addEventListener("resize", this.resize);
        this.resize();

        window.requestAnimationFrame(this.loop);
      }

      resize() {
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
        this.canvas.height = window.innerHeight * window.devicePixelRatio;
      }

      update() {
        const {
          patternPixelDataLength,
          patternData,
          patternAlpha,
          patternCtx
        } = this;

        for (let i = 0; i < patternPixelDataLength; i += 4) {
          const value = Math.random() * 255;
          patternData.data[i] = value;
          patternData.data[i + 1] = value;
          patternData.data[i + 2] = value;
          patternData.data[i + 3] = patternAlpha;
        }

        patternCtx.putImageData(patternData, 0, 0);
      }

      draw() {
        const { ctx, patternCanvas, canvas } = this;
        const { width, height } = canvas;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat");
        ctx.fillRect(0, 0, width, height);
      }

      loop() {
        const shouldDraw = ++this.frame % this.patternRefreshInterval === 0;
        if (shouldDraw) {
          this.update();
          this.draw();
        }
        window.requestAnimationFrame(this.loop);
      }
    }

    // Автоматическая инициализация зерна, если canvas отсутствует
    let grainEl = document.querySelector(".grain");
    if (!grainEl) {
        grainEl = document.createElement("canvas");
        grainEl.className = "grain";
        document.body.prepend(grainEl);
    }
    
    if(grainEl) new Grain(grainEl);

    /* --- Прокрутка проектов мышью по позиции курсора --- */
    const projectsRow = document.querySelector(".projects-row");
    if (projectsRow && window.innerWidth > 768) {
        let mouseX = 0;
        let isHovering = false;
        let requestId = null;

        const scrollLoop = () => {
            if (isHovering) {
                const rect = projectsRow.getBoundingClientRect();
                const center = rect.width / 2;
                const relativeX = mouseX - rect.left;
                
                // Зона срабатывания (по 20% от краев)
                const margin = rect.width * 0.2;
                let speed = 0;

                if (relativeX < margin) {
                    speed = (relativeX - margin) / margin * 15;
                } else if (relativeX > rect.width - margin) {
                    speed = (relativeX - (rect.width - margin)) / margin * 15;
                }

                if (speed !== 0) {
                    projectsRow.scrollLeft += speed;
                }
            }
            requestId = requestAnimationFrame(scrollLoop);
        };

        projectsRow.addEventListener("mouseenter", () => isHovering = true);
        projectsRow.addEventListener("mouseleave", () => isHovering = false);
        projectsRow.addEventListener("mousemove", (e) => mouseX = e.clientX);

        scrollLoop();
    }
});
