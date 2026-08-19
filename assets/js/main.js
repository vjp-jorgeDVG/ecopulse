/**
 * ECOPULSE DYNAMICS - MASTER JS OPTIMIZADO (PRETTIER)
 * Funcionalidades: Dashboard, Gráficas, Tema, API, Simulador, V2G, Formularios y Animaciones
 */

let miGrafica = null;

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. GESTIÓN DEL LOADER ---
  const loader = document.getElementById('dashLoader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => (loader.style.display = 'none'), 500);
    }, 1000);
  }

  // --- 2. NAVEGACIÓN DE PESTAÑAS (TABS) ---
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.dash-tab');

  navItems.forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-target');

      navItems.forEach((nav) => nav.classList.remove('active'));
      tabs.forEach((tab) => {
        tab.classList.remove('active');
        tab.style.display = 'none';
      });

      this.classList.add('active');
      const targetTab = document.getElementById(targetId);
      if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.display = 'block';
        if (targetId === 'tab-calculadora') realizarCalculoSim();
      }
    });
  });

  // --- 3. GRÁFICA PRINCIPAL (CHART.JS) ---
  const canvas = document.getElementById('mainChart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

    const isDarkInitial = document.body.classList.contains('dark-theme');

    miGrafica = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:00'],
        datasets: [
          {
            label: 'Generación Solar (kW)',
            data: [0, 2.5, 5.8, 4.2, 0.8, 0, 0],
            borderColor: '#10B981',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Consumo Red (kW)',
            data: [0.8, 1.2, 1.5, 2.0, 3.5, 2.2, 1.0],
            borderColor: isDarkInitial ? '#FFFFFF' : '#000000',
            borderWidth: 2,
            borderDash: [4, 4],
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: isDarkInitial ? '#9CA3AF' : '#1F2937' },
          },
        },
      },
    });
  }

  // --- 4. GESTIÓN DEL MODO OSCURO ---
  const themeSwitch = document.getElementById('checkbox-theme');

  if (localStorage.getItem('ep_theme') === 'dark-theme') {
    document.body.classList.add('dark-theme');
    if (themeSwitch) themeSwitch.checked = true;
  }

  if (themeSwitch) {
    themeSwitch.addEventListener('change', function () {
      const isDark = this.checked;
      document.body.classList.toggle('dark-theme', isDark);
      localStorage.setItem('ep_theme', isDark ? 'dark-theme' : 'light-theme');

      if (miGrafica) {
        miGrafica.data.datasets[1].borderColor = isDark ? '#FFFFFF' : '#000000';
        miGrafica.options.plugins.legend.labels.color = isDark ? '#9CA3AF' : '#1F2937';
        miGrafica.update();
      }
    });
  }

  // --- 5. SINCRONIZACIÓN DE DATOS REALES (API) ---
  async function syncRealTimeData() {
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=40.03&longitude=-6.09&current_weather=true&hourly=terrestrial_radiation'
      );
      const data = await res.json();

      // Actualizar KPIs de la Hora Actual
      const horaActual = new Date().getHours();
      const rad = data.hourly?.terrestrial_radiation[horaActual] || 0;
      const temp = data.current_weather?.temperature || 0;

      const tempEl = document.getElementById('live-temp');
      if (tempEl) tempEl.innerText = `${temp}°C`;

      const valRend = (rad / 1000).toFixed(2);
      const valGen = (rad / 200).toFixed(1);
      const valAhorro = (valGen * 0.22).toFixed(2);

      updateCounterUI('rendimiento-solar', valRend);
      updateCounterUI('generacion-total', valGen);
      updateCounterUI('impacto-economico', valAhorro);

      // Actualizar la Gráfica con la Curva de Hoy
      if (miGrafica && data.hourly) {
        const horasGrafica = [6, 9, 12, 15, 18, 21, 23];
        const curvaGeneracionHoy = horasGrafica.map((h) => {
          let radiacionHora = data.hourly.terrestrial_radiation[h] || 0;
          return (radiacionHora / 200).toFixed(1);
        });

        miGrafica.data.datasets[0].data = curvaGeneracionHoy;
        miGrafica.update();
      }
    } catch (e) {
      console.error('EcoPulse API Error:', e);
    }
  }

  function updateCounterUI(id, val) {
    const field = document.querySelector(`#${id} .counter`);
    if (field) {
      field.innerText = isNaN(val) ? '0.0' : val;
      field.parentElement.classList.add('pulse-update');
      setTimeout(() => field.parentElement.classList.remove('pulse-update'), 800);
    }
  }

  syncRealTimeData();
  setInterval(syncRealTimeData, 600000); // Se actualiza cada 10 mins

  // --- 6. SIMULADOR DE DIMENSIONAMIENTO ---
  const vGasto = document.getElementById('v-gasto');
  const vClima = document.getElementById('v-clima');
  const vPanel = document.getElementById('v-panel');

  const outGasto = document.getElementById('val-gasto');
  const outPaneles = document.getElementById('res-num-paneles');
  const outEspacio = document.getElementById('res-espacio');
  const outArboles = document.getElementById('res-arboles');
  const outDesc = document.getElementById('res-desc');

  function realizarCalculoSim() {
    if (!vGasto || !vClima || !vPanel) return;

    const gasto = parseFloat(vGasto.value) || 0;
    const hsp = parseFloat(vClima.value) || 1;
    const potWp = parseFloat(vPanel.value) || 1;

    const kwhDia = (gasto / 0.22) / 30;
    const nPaneles = Math.ceil(kwhDia / ((potWp / 1000) * hsp * 0.75));

    if (outGasto) outGasto.innerText = gasto;
    if (outPaneles) outPaneles.innerText = nPaneles;
    if (outEspacio) outEspacio.innerText = (nPaneles * 2).toFixed(1);
    if (outArboles) outArboles.innerText = (nPaneles * 12).toFixed(0);

    if (outDesc) {
      if (nPaneles <= 4) outDesc.innerText = 'Configuración esencial para ahorro básico.';
      else if (nPaneles <= 10) outDesc.innerText = 'Perfecto para una familia de 4 personas.';
      else outDesc.innerText = 'Capacidad alta: Ideal para vehículo eléctrico.';
    }
  }

  if (vGasto) vGasto.addEventListener('input', realizarCalculoSim);
  if (vClima) vClima.addEventListener('change', realizarCalculoSim);
  if (vPanel) vPanel.addEventListener('change', realizarCalculoSim);

  // --- 7. PROTOCOLO V2G (VEHICLE TO GRID) ---
  const v2gToggle = document.getElementById('v2g-toggle');
  if (v2gToggle) {
    let v2gTimer;
    let acum = 0;

    const dot = document.getElementById('fDot');
    const status = document.getElementById('v2g-status');
    const power = document.getElementById('v2g-power');
    const money = document.getElementById('v2g-money');

    v2gToggle.addEventListener('change', function () {
      if (this.checked) {
        if (dot) dot.style.display = 'block';
        if (status) {
          status.innerText = 'INYECCIÓN ACTIVA';
          status.className = 'badge-active';
        }

        v2gTimer = setInterval(() => {
          const currentPower = (Math.random() * (4.5 - 3.0) + 3.0).toFixed(1);
          acum += 0.0002;
          if (power) power.innerText = `${currentPower} kW`;
          if (money) money.innerText = `+${acum.toFixed(3)} €`;
        }, 1000);
      } else {
        clearInterval(v2gTimer);
        if (dot) dot.style.display = 'none';
        if (status) {
          status.innerText = 'Standby';
          status.className = 'badge-neutral';
        }
        if (power) power.innerText = '0.0 kW';
      }
    });
  }
  // --- 8. VALIDACIÓN DE FORMULARIOS (UX, BLUR E ICONOS) ---
  const contactForm = document.getElementById('ep-contact-form');

  if (contactForm) {
    const inputs = contactForm.querySelectorAll('.input-text');
    const fMensaje = document.getElementById('f-mensaje');

    function validarCampo(input) {
      const group = input.closest('.ep-form-group');
      const icon = group.querySelector('.status-icon');
      let esValido = false;

      // Lógica de validación
      if (input.id === 'f-proyecto') {
        esValido = input.selectedOptions.length >= 2;
      } else if (input.id === 'f-mensaje') {
        esValido = input.value.trim().length >= 30;
      } else if (input.hasAttribute('required')) {
        esValido = input.value.trim().length > 0;
      } else {
        if (input.value.trim().length === 0) {
          group.classList.remove('is-valid', 'is-invalid');
          if (icon) icon.className = 'status-icon fa fa-building-o';
          input.removeAttribute('aria-invalid'); // Limpiamos accesibilidad
          return true;
        }
        esValido = true;
      }

      // UX: Cambio de colores, iconos Y ACCESIBILIDAD
      if (esValido) {
        group.classList.remove('is-invalid');
        group.classList.add('is-valid');
        input.setAttribute('aria-invalid', 'false'); // Le dice al lector de pantalla: "Todo OK"
        
        if (icon) icon.className = 'status-icon fa fa-check'; 
      } else {
        group.classList.remove('is-valid');
        group.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true'); // Le dice al lector de pantalla: "¡ERROR AQUÍ!"
        
        if (icon) icon.className = 'status-icon fa fa-times'; 
      }

      return esValido;
    }

    // EVENTOS UX (Inmediato y al perder el foco)
    inputs.forEach((input) => {
      input.addEventListener('input', () => validarCampo(input));  // Inmediato
      input.addEventListener('blur', () => validarCampo(input));   // AL PERDER EL FOCO
      input.addEventListener('change', () => validarCampo(input)); // Cambios en el select
    });

    // Contadores del mensaje
    if (fMensaje) {
      fMensaje.addEventListener('input', function () {
        const text = this.value.trim();
        const chars = text.length;
        const words = text === '' ? 0 : text.split(/\s+/).length;

        document.querySelector('#cnt-min b').innerText = Math.max(0, 30 - chars);
        document.querySelector('#cnt-max b').innerText = Math.max(0, 1000 - chars);
        document.querySelector('#cnt-words b').innerText = words;
      });
    }

    // Validación final (Previa al envío al servidor)
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      let formValido = true;

      inputs.forEach((input) => {
        // Validamos absolutamente todos los campos requeridos antes del envío
        if (input.hasAttribute('required') || input.value.trim() !== '') {
          if (!validarCampo(input)) formValido = false;
        }
      });

      if (formValido) {
        const successMsg = document.getElementById('form-success');
        successMsg.style.display = 'block';

        contactForm.reset();
        
        // Restaurar estado inicial
        inputs.forEach((input) => {
            const group = input.closest('.ep-form-group');
            group.classList.remove('is-valid', 'is-invalid');
            // Restaurar iconos originales
            if(input.id === 'f-nombre') document.getElementById('icon-nombre').className = 'status-icon fa fa-asterisk';
            if(input.id === 'f-empresa') document.getElementById('icon-empresa').className = 'status-icon fa fa-building-o';
            if(input.id === 'f-proyecto') document.getElementById('icon-proyecto').className = 'status-icon fa fa-list';
            if(input.id === 'f-mensaje') document.getElementById('icon-mensaje').className = 'status-icon fa fa-comment-o';
        });
        
        if (fMensaje) fMensaje.dispatchEvent(new Event('input'));

        setTimeout(() => (successMsg.style.display = 'none'), 5000);
      }
    });
  }

  // --- 9. ANIMACIONES AL SCROLL (INTERSECTION OBSERVER) ---
  const revealElements = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .reveal-scale'
  );
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }
  
});

// --- 2. NAVEGACIÓN DE PESTAÑAS (TABS DEL DASHBOARD) ---
  // (Código de las pestañas...)

  // --- 3. GESTIÓN DEL MODO OSCURO ---  <-- (ESTE BLOQUE AHORA VA ANTES)
  const themeSwitch = document.getElementById('checkbox-theme');

  if (localStorage.getItem('ep_theme') === 'dark-theme') {
    document.body.classList.add('dark-theme');
    if (themeSwitch) themeSwitch.checked = true;
  }

  if (themeSwitch) {
    themeSwitch.addEventListener('change', function () {
      const isDark = this.checked;
      document.body.classList.toggle('dark-theme', isDark);
      localStorage.setItem('ep_theme', isDark ? 'dark-theme' : 'light-theme');

      if (miGrafica) {
        miGrafica.data.datasets[1].borderColor = isDark ? '#FFFFFF' : '#000000';
        miGrafica.options.plugins.legend.labels.color = isDark ? '#9CA3AF' : '#1F2937';
        miGrafica.update();
      }
    });
  }

  // --- 4. GRÁFICA PRINCIPAL (CHART.JS) --- <-- (LA GRÁFICA AHORA VA DESPUÉS)
  const canvas = document.getElementById('mainChart');
  // (Resto del código de la gráfica...)