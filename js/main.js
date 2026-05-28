document.addEventListener('DOMContentLoaded', () => {
  /* --- Navegación Sticky --- */
  const header = document.querySelector('header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      header.classList.add('nav-hidden');
    } else {
      header.classList.remove('nav-hidden');
    }
    lastScrollY = window.scrollY;
  });

  /* --- Mobile Drawer (Navegación Móvil) --- */
  const openBtn = document.getElementById('menu-open');
  const drawer = document.getElementById('mobile-drawer');
  const sheet = drawer.querySelector('.drawer-sheet');

  function openDrawer() {
    drawer.showPopover();
    drawer.offsetHeight; // Forzar reflow para que corra la transición
    drawer.classList.add('open');
    document.querySelector('main').inert = true;
    openBtn.setAttribute('aria-expanded', 'true');
    sheet.focus();
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    document.querySelector('main').inert = false;
    openBtn.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      if (!drawer.classList.contains('open')) {
        drawer.hidePopover();
      }
    }, 300); // Duración de la transición CSS
  }

  openBtn.addEventListener('click', openDrawer);
  
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) closeDrawer();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Cerrar al hacer clic en un link del móvil
  const mobileLinks = sheet.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
    });
  });

  /* --- Scroll Reveal Animations --- */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target); // Solo animar una vez
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  /* --- Barra de Progreso Animada --- */
  const progressBar = document.querySelector('.progreso-bar');
  if (progressBar) {
    const meta = 2700000;
    // Asumiendo un monto inicial recaudado para el diseño visual, ej. 120,000 (el usuario lo ajustará)
    const recaudado = 120000;
    
    const porcentaje = Math.min((recaudado / meta) * 100, 100);
    
    const progressObserver = new IntersectionObserver((entries) => {
      if(entries[0].isIntersecting) {
        setTimeout(() => {
          progressBar.style.width = porcentaje + '%';
        }, 500);
        progressObserver.disconnect();
      }
    }, { threshold: 0.5 });
    
    progressObserver.observe(document.querySelector('.progreso-container'));
  }

  /* --- Galería del Proyecto (Tabs e Interactividad) --- */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Quitar clase activa de todos los botones y secciones
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      // Añadir activa al botón pulsado y su sección
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(`tab-${tabId}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  /* --- Lightbox para imágenes y videos --- */
  const galeriaItems = document.querySelectorAll('.galeria-item');
  
  // Crear el elemento lightbox si no existe
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" data-i18n-aria-label="lightbox_close" aria-label="Cerrar">&times;</button>
        <img src="" alt="Imagen ampliada" style="display: none; max-width: 100%; max-height: 75vh; border-radius: var(--radius-lg); object-fit: contain; border: 3px solid rgba(255, 255, 255, 0.2);">
        <video src="" controls style="display: none; max-width: 100%; max-height: 75vh; border-radius: var(--radius-lg); border: 3px solid rgba(255, 255, 255, 0.2); outline: none;"></video>
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('img');
  const lightboxVideo = lightbox.querySelector('video');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  galeriaItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const video = item.querySelector('video');
      const caption = item.querySelector('.galeria-caption');
      
      // Resetear estado
      lightboxImg.style.display = 'none';
      lightboxVideo.style.display = 'none';
      try {
        lightboxVideo.pause();
      } catch(e) {}
      lightboxVideo.src = '';

      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxImg.style.display = 'block';
        lightboxCaption.textContent = caption ? caption.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquear scroll de la página
      } else if (video) {
        lightboxVideo.src = video.src;
        lightboxVideo.style.display = 'block';
        lightboxCaption.textContent = caption ? caption.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquear scroll de la página
        lightboxVideo.play().catch(err => console.log('Autoplay prevented', err));
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
    try {
      lightboxVideo.pause();
    } catch(e) {}
    lightboxVideo.src = '';
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    // Cerrar si se hace clic fuera del contenido principal
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  /* --- Acordeón de Requisitos --- */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isActive = item.classList.contains('active');

      // Cerrar otros acordeones abiertos (para mantener el orden)
      document.querySelectorAll('.accordion-item').forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-content').style.maxHeight = null;
          otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });

      // Alternar estado del seleccionado
      if (isActive) {
        item.classList.remove('active');
        content.style.maxHeight = null;
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --- Sistema de Traducción (i18n) --- */
  function translatePage(lang) {
    if (!window.translations) return;

    // Función de obtención segura de traducción para evitar inyección de propiedades y prototype pollution
    function getSafeTranslation(langKey, propKey) {
      if (!window.translations) return null;
      if (typeof langKey !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(langKey)) return null;
      const langDesc = Object.getOwnPropertyDescriptor(window.translations, langKey);
      if (!langDesc || !langDesc.value) return null;
      
      const langObj = langDesc.value;
      if (typeof propKey !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(propKey)) return null;
      const propDesc = Object.getOwnPropertyDescriptor(langObj, propKey);
      return propDesc ? propDesc.value : null;
    }

    // 1. Traducir textos simples
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getSafeTranslation(lang, key);
      if (val !== null && val !== undefined) {
        el.textContent = val;
      }
    });

    // 2. Traducir bloques de HTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const val = getSafeTranslation(lang, key);
      if (val !== null && val !== undefined) {
        el.innerHTML = val;
      }
    });

    // 3. Traducir atributos alt
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      const val = getSafeTranslation(lang, key);
      if (val !== null && val !== undefined) {
        el.setAttribute('alt', val);
      }
    });

    // 4. Traducir atributos aria-label
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      const val = getSafeTranslation(lang, key);
      if (val !== null && val !== undefined) {
        el.setAttribute('aria-label', val);
      }
    });

    // 5. Traducir atributos href (ej. enlace de WhatsApp)
    document.querySelectorAll('[data-i18n-href]').forEach(el => {
      const key = el.getAttribute('data-i18n-href');
      const val = getSafeTranslation(lang, key);
      if (val !== null && val !== undefined) {
        el.setAttribute('href', val);
      }
    });

    // 6. Traducir atributos content (ej. meta de descripción)
    document.querySelectorAll('[data-i18n-content]').forEach(el => {
      const key = el.getAttribute('data-i18n-content');
      const val = getSafeTranslation(lang, key);
      if (val !== null && val !== undefined) {
        el.setAttribute('content', val);
      }
    });

    // 7. Actualizar el atributo lang del HTML
    document.documentElement.setAttribute('lang', lang);

    // 8. Sincronizar botones activos del selector de idioma
    document.querySelectorAll('.lang-selector .lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 9. Recalcular alturas de acordeones que estén abiertos
    document.querySelectorAll('.accordion-item.active .accordion-content').forEach(content => {
      content.style.maxHeight = content.scrollHeight + 'px';
    });
  }

  function setLanguage(lang) {
    localStorage.setItem('parroquia_lang', lang);
    translatePage(lang);
  }

  function initLanguage() {
    // Intentar leer de localStorage
    let savedLang = localStorage.getItem('parroquia_lang');
    if (!savedLang) {
      // Detección automática del navegador
      const browserLang = navigator.language || navigator.userLanguage || 'es';
      savedLang = browserLang.startsWith('en') ? 'en' : 'es';
    }
    translatePage(savedLang);

    // Añadir listeners a los selectores de idioma
    document.querySelectorAll('.lang-selector .lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedLang = e.currentTarget.getAttribute('data-lang');
        setLanguage(selectedLang);
      });
    });
  }

  // Inicializar traducciones
  initLanguage();
});

