/* ══════════════════════════════════════════════
   PeluIA — Application Logic
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Navbar Scroll Effect ───
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ─── Mobile Nav Toggle ───
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close mobile nav on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ─── Counter Animation ───
  function animateCounters() {
    const counters = document.querySelectorAll('[data-target]');
    counters.forEach(counter => {
      if (counter.dataset.animated) return;

      const target = parseInt(counter.dataset.target);
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * ease);

        counter.textContent = current.toLocaleString('es-AR');

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString('es-AR');
        }
      }

      counter.dataset.animated = 'true';
      requestAnimationFrame(updateCounter);
    });
  }

  // ─── Scroll Reveal & Counter Trigger ───
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Trigger counter animation if this section has counters
        const counters = entry.target.querySelectorAll('[data-target]');
        if (counters.length > 0) {
          animateCounters();
        }
      }
    });
  }, observerOptions);

  // Add reveal class to sections
  const revealElements = document.querySelectorAll(
    '.feature-card, .step, .booking-layout, .stat-card, .testimonial-card, .cta-card'
  );

  revealElements.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.08}s`;
    revealObserver.observe(el);
  });

  // Also observe hero stats and stat section
  const heroStats = document.querySelector('.hero-stats-row');
  if (heroStats) revealObserver.observe(heroStats);

  const statsSection = document.querySelector('.stats');
  if (statsSection) revealObserver.observe(statsSection);

  // ─── Set Min Date on Booking ───
  const bookingDate = document.getElementById('bookingDate');
  if (bookingDate) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate() + 1).padStart(2, '0'); // Tomorrow
    bookingDate.min = `${yyyy}-${mm}-${dd}`;
  }

  // ─── Booking Form Submission ───
  const bookingForm = document.getElementById('bookingForm');
  const aiResponse = document.getElementById('aiResponse');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('clientName').value;
      const service = document.getElementById('serviceSelect');
      const serviceText = service.options[service.selectedIndex].text;
      const date = document.getElementById('bookingDate').value;
      const time = document.getElementById('bookingTime').value;

      // Show loading state
      const btnText = document.querySelector('.btn-text');
      const btnLoader = document.querySelector('.btn-loader');
      const submitBtn = document.getElementById('bookingSubmit');

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      submitBtn.disabled = true;

      // Update AI response with "thinking" if present
      if (aiResponse) {
        aiResponse.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="spinner"></span>
            <span>Procesando tu solicitud, ${name.split(' ')[0]}...</span>
          </div>
        `;
      }

      // Simulate confirmation
      setTimeout(() => {
        const phone = document.getElementById('clientPhone')?.value || '';
        const stylist = document.getElementById('stylistSelect')?.value || 'indistinto';
        const stylistText = stylist === 'paola' ? 'con Paola' : (stylist === 'pauli' ? 'con Pauli' : 'con Paola o Pauli');

        if (aiResponse) {
          const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          });

          aiResponse.innerHTML = `
            <div class="ai-response-success">
              <p>✅ <strong>¡Turno registrado, ${name.split(' ')[0]}!</strong></p>
              <br>
              <p>📋 <strong>Servicio:</strong> ${serviceText}</p>
              <p>📅 <strong>Fecha:</strong> ${formattedDate}</p>
              <p>🕐 <strong>Hora:</strong> ${time} hs</p>
              <p>💇‍♀️ <strong>Atención:</strong> ${stylistText}</p>
              <br>
              <p>🔔 Te enviaremos la confirmación por WhatsApp.</p>
            </div>
          `;
        }

        // Reset button
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;

        // Show toast
        showToast(
          '¡Solicitud enviada con éxito!',
          `¡Gracias ${name.split(' ')[0]}! Paola y Pauli confirmarán tu turno (${serviceText}) para el día ${date} a las ${time} hs.`
        );

        // Reset form
        bookingForm.reset();

      }, 1200);
    });
  }

  // ─── Active nav link highlighting ───
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinksAll.forEach(link => {
          link.style.color = ''; // Limpia cualquier color inline
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => navObserver.observe(section));

  // Click directo en los enlaces del navbar
  navLinksAll.forEach(link => {
    link.addEventListener('click', () => {
      navLinksAll.forEach(l => {
        l.classList.remove('active');
        l.style.color = '';
      });
      link.classList.add('active');
    });
  });

  // ─── Feature cards parallax on mouse ───
  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});

// ─── Global Functions ───

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function preselectService(serviceName) {
  const select = document.getElementById('serviceSelect');
  if (select) {
    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].text.includes(serviceName) || select.options[i].value.includes(serviceName)) {
        select.selectedIndex = i;
        break;
      }
    }
  }
}

function openLightbox(src, title) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImage');
  const caption = document.getElementById('lightboxCaption');
  if (modal && img) {
    img.src = src;
    if (caption) caption.textContent = title;
    modal.classList.add('active');
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function showToast(title = '¡Turno solicitado!', message = 'Paola y Pauli se comunicarán con vos a la brevedad para confirmar.') {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  if (toastTitle) toastTitle.textContent = title;
  if (toastMessage) toastMessage.textContent = message;
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => hideToast(), 5000);
  }
}

function hideToast() {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.remove('show');
  }
}

// ─── Gallery Filter Logic ───
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
});

