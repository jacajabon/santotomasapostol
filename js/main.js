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
  const scroller = drawer.querySelector('.drawer-scroller');
  const sheet = drawer.querySelector('.drawer-sheet');

  async function openDrawer() {
    drawer.showPopover();
    
    // Fallback para navegadores sin scroll-initial-target
    if (!CSS.supports('scroll-initial-target', 'nearest')) {
      scroller.scrollTo({left: scroller.offsetWidth, behavior: 'instant'});
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    
    scroller.scrollTo({left: 0, behavior: 'auto'});
  }

  function closeDrawer() {
    scroller.scrollTo({left: scroller.offsetWidth, behavior: 'auto'});
  }

  function onDrawerOpened() {
    document.querySelector('main').inert = true;
    openBtn.setAttribute('aria-expanded', 'true');
    sheet.focus();
  }

  function onDrawerClosed() {
    drawer.hidePopover();
    document.querySelector('main').inert = false;
    openBtn.setAttribute('aria-expanded', 'false');
  }

  const visibleThreshold = 1 / window.innerWidth;
  const observer = new IntersectionObserver((entries) => {
    const entry = entries.at(-1);
    if (entry.intersectionRatio < visibleThreshold) onDrawerClosed();
    if (entry.intersectionRatio === 1) onDrawerOpened();
  }, {root: drawer, threshold: [visibleThreshold, 1]});
  
  observer.observe(sheet);

  openBtn.addEventListener('click', openDrawer);
  
  drawer.addEventListener('click', (e) => {
    if (!sheet.contains(e.target)) closeDrawer();
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

  /* --- Lightbox para imágenes --- */
  const galeriaItems = document.querySelectorAll('.galeria-item');
  
  // Crear el elemento lightbox si no existe
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Cerrar">&times;</button>
        <img src="" alt="Imagen ampliada">
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  galeriaItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.galeria-caption');
      
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = caption ? caption.textContent : '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquear scroll de la página
      }
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', (e) => {
    // Cerrar si se hace clic fuera de la imagen
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
});

