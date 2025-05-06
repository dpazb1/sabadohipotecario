// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Referencias a los selectores y grupos principales del formulario
  const projectSelect = document.getElementById('project-select'); // Dropdown de proyectos
  const roomTypeGroup = document.getElementById('room-type-group'); // Grupo de tipos de departamento
  const roomTypeSelect = document.getElementById('room-type-select'); // Dropdown de tipos de departamento
  const selectedProjects = new Set(); // Proyectos seleccionados
  const selectedRoomTypes = new Set(); // Tipos seleccionados

  // Referencias a los inputs principales
  const nameInput = document.getElementById('name'); // Input de nombre
  const rutInput = document.getElementById('rut'); // Input de RUT
  const phoneInput = document.getElementById('phone'); // Input de teléfono

  // Validación de nombre: solo letras
  nameInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ\s]/g, '');
  });

  // Función para formatear el RUT chileno
  function formatRUT(value) {
    // Eliminar caracteres no válidos y pasar a minúsculas
    value = value.replace(/[^\dk]/gi, '').toLowerCase();
    if (!value) return '';
    // Si hay una 'k' antes del dígito verificador, eliminarla
    if (value.length >= 2 && value.charAt(value.length - 2) === 'k') {
      value = value.slice(0, -2) + value.slice(-1);
    }
    // Extraer dígito verificador
    let verifier = '';
    if (value.endsWith('k')) {
      verifier = 'k';
      value = value.slice(0, -1);
    } else if (value.length > 0) {
      verifier = value.slice(-1);
      value = value.slice(0, -1);
    }
    // Limitar a 8 dígitos
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    // Formatear con puntos
    let formattedValue = '';
    for (let i = value.length - 1, j = 0; i >= 0; i--, j++) {
      if (j > 0 && j % 3 === 0) {
        formattedValue = '.' + formattedValue;
      }
      formattedValue = value[i] + formattedValue;
    }
    // Agregar guion y dígito verificador
    if (verifier) {
      formattedValue += '-' + verifier;
    }
    return formattedValue;
  }

  // Validación y formateo en tiempo real del RUT
  rutInput.addEventListener('input', function(e) {
    const start = this.selectionStart;
    const oldValue = this.value;
    // Contar dígitos válidos
    const currentDigitCount = oldValue.replace(/[^\dk]/gi, '').length;
    // Prevenir más de 9 dígitos
    if (currentDigitCount >= 9) {
      if (this.value.length > oldValue.length) {
        e.preventDefault();
        this.value = oldValue;
        this.setSelectionRange(start, start);
        return;
      }
    }
    const newValue = formatRUT(this.value);
    const digitCount = newValue.replace(/[^\dk]/gi, '').length;
    // Actualizar si es válido
    if (digitCount <= 9 && oldValue !== newValue) {
      this.value = newValue;
      // Mantener posición del cursor
      if (start === oldValue.length) {
        this.setSelectionRange(newValue.length, newValue.length);
      } else {
        const dotsBeforeOld = (oldValue.slice(0, start).match(/\./g) || []).length;
        const dotsBeforeNew = (newValue.slice(0, start).match(/\./g) || []).length;
        const dashBeforeOld = (oldValue.slice(0, start).match(/-/g) || []).length;
        const dashBeforeNew = (newValue.slice(0, start).match(/-/g) || []).length;
        const newPosition = start + (dotsBeforeNew - dotsBeforeOld) + (dashBeforeNew - dashBeforeOld);
        this.setSelectionRange(newPosition, newPosition);
      }
    } else if (digitCount > 9) {
      this.value = oldValue;
      this.setSelectionRange(start, start);
    }
  });

  // Validación y envío del formulario
  document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Limpiar errores previos
    document.querySelectorAll('.form-group, .checkbox-group').forEach(group => {
        group.classList.remove('error');
    });
    let isValid = true;
    // Validar nombre
    if (!nameInput.value.trim()) {
        nameInput.closest('.form-group').classList.add('error');
        isValid = false;
    }
    // Validar RUT
    const rutValue = rutInput.value.replace(/[^\dk]/gi, '').toLowerCase();
    const digitCount = rutValue.length;
    if (digitCount < 8 || digitCount > 9 || (rutValue.includes('k') && rutValue.charAt(rutValue.length - 1) !== 'k')) {
        rutInput.closest('.form-group').classList.add('error');
        isValid = false;
    }
    // Validar teléfono
    const phoneValue = phoneInput.value.replace(/\s/g, '');
    if (!phoneValue || phoneValue.length !== 8 || !/^\d+$/.test(phoneValue)) {
        phoneInput.closest('.form-group').classList.add('error');
        isValid = false;
    }
    // Validar email
    const emailInput = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
        emailInput.closest('.form-group').classList.add('error');
        isValid = false;
    }
    // Validar selección de proyecto
    const projectSelect = document.getElementById('project-select');
    const selectedProjects = projectSelect.querySelector('.selected-projects').children.length;
    if (selectedProjects === 0) {
        projectSelect.closest('.form-group').classList.add('error');
        isValid = false;
    }
    // Validar tipo de departamento si corresponde
    const roomTypeGroup = document.getElementById('room-type-group');
    if (roomTypeGroup.style.display !== 'none') {
        const roomTypeSelect = document.getElementById('room-type-select');
        const selectedRoomTypes = roomTypeSelect.querySelector('.selected-projects').children.length;
        if (selectedRoomTypes === 0) {
            roomTypeGroup.classList.add('error');
            isValid = false;
        }
    }
    // Validar términos y condiciones
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
        termsCheckbox.closest('.checkbox-group').classList.add('error');
        isValid = false;
    }
    // Si es válido, mostrar mensaje de éxito y limpiar el formulario
    if (isValid) {
        const formContainer = this.closest('.form-container');
        if (formContainer) {
            formContainer.innerHTML = `
                <h3 class="form-title success">¡Muchas gracias!</h3>
                <div class="success-message">
                    Recibimos tu solicitud. ¡Nos pondremos en contacto contigo pronto!
                </div>
            `;
            formContainer.style.height = 'auto';
            formContainer.style.maxHeight = 'none';
            formContainer.style.minHeight = '200px';
            setTimeout(() => {
                formContainer.scrollTo({ top: formContainer.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
        return;
    }
    // Si hay errores, hacer scroll al primer error
    const formContainer = this.closest('.form-container');
    const firstError = this.querySelector('.form-group.error, .checkbox-group.error');
    if (formContainer && firstError) {
      const formRect = formContainer.getBoundingClientRect();
      const errorRect = firstError.getBoundingClientRect();
      const scrollTop = formContainer.scrollTop + (errorRect.top - formRect.top) - 20;
      formContainer.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  });

  // Validación y formateo del teléfono
  let lastPhoneValue = '';
  const prefixWrapper = document.querySelector('.phone-prefix-wrapper'); // Dropdown de prefijo
  const prefixBtn = prefixWrapper.querySelector('.select-btn');
  const prefixOptions = prefixWrapper.querySelectorAll('.option');
  let selectedPrefix = '569'; // Prefijo por defecto

  // Abrir/cerrar dropdown de prefijo
  prefixBtn.addEventListener('click', () => {
    prefixWrapper.classList.toggle('active');
  });

  // Selección de prefijo
  prefixOptions.forEach(option => {
    option.addEventListener('click', () => {
      selectedPrefix = option.dataset.value;
      prefixBtn.innerHTML = `<span class="select-btn-text">${option.textContent}</span>`;
      prefixWrapper.classList.remove('active');
    });
  });

  // Cerrar dropdown de prefijo al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!prefixWrapper.contains(e.target)) {
      prefixWrapper.classList.remove('active');
    }
  });

  // Formatear teléfono en tiempo real
  function formatPhoneNumber(value) {
    value = value.replace(/[^0-9]/g, '');
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    if (value.length > 4) {
      value = value.substring(0, 4) + ' ' + value.substring(4);
    }
    return value;
  }

  phoneInput.addEventListener('input', function(e) {
    const cursorPosition = this.selectionStart;
    let formattedValue = formatPhoneNumber(this.value);
    if (this.value !== formattedValue && lastPhoneValue !== formattedValue) {
      lastPhoneValue = formattedValue;
      this.value = formattedValue;
      let newCursorPosition = cursorPosition;
      if (cursorPosition === 5 && formattedValue.length > 4) {
        newCursorPosition = 6;
      } else if (cursorPosition > 4 && formattedValue.length > 4) {
        newCursorPosition = cursorPosition + 1;
      }
      setTimeout(() => {
        this.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  });

  // Al enviar el formulario, construir el número completo con prefijo
  document.querySelector('form').addEventListener('submit', function(e) {
    const phoneValue = phoneInput.value.replace(/[^0-9]/g, '');
    if (phoneValue.length === 8) {
      const fullPhoneNumber = selectedPrefix + phoneValue;
      // Aquí puedes enviar el número completo al backend o usarlo como necesites
      console.log('Full phone number:', fullPhoneNumber);
    }
  });

  // Inicializar los dropdowns personalizados
  function setupSelect(selectWrapper) {
    // Referencias a los elementos del dropdown
    const selectBtn = selectWrapper.querySelector('.select-btn');
    const selectContent = selectWrapper.querySelector('.select-content');
    const options = Array.from(selectWrapper.querySelectorAll('.option'));
    const selectedContainer = selectWrapper.querySelector('.selected-projects');
    const isProjectSelect = selectWrapper.id === 'project-select';
    const selectedSet = isProjectSelect ? selectedProjects : selectedRoomTypes;

    // Búsqueda en el dropdown de proyectos
    if (isProjectSelect) {
      const searchInput = selectWrapper.querySelector('.search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const searchTerm = e.target.value.toLowerCase();
          options.forEach(option => {
            if (option.dataset.value === 'all') {
              option.style.display = searchTerm ? 'none' : '';
              return;
            }
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(searchTerm) ? '' : 'none';
          });
        });
        // Prevenir que se cierre el dropdown al hacer click en el buscador
        searchInput.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      }
    }

    // Abrir/cerrar el dropdown y autoscroll si corresponde
    let hasScrolled = false;
    selectBtn.addEventListener('click', () => {
      selectWrapper.classList.toggle('active');
      // Autoscroll to bottom of form only the first time this dropdown is opened
      if (!hasScrolled && (selectWrapper.id === 'project-select' || selectWrapper.id === 'room-type-select')) {
        const formContainer = selectWrapper.closest('.form-container');
        if (formContainer) {
          setTimeout(() => {
            formContainer.scrollTo({ top: formContainer.scrollHeight, behavior: 'smooth' });
          }, 80);
          hasScrolled = true;
        }
      }
    });

    // Lógica de la opción "Todos" solo para proyectos
    let allOption = null;
    if (isProjectSelect) {
      allOption = options.find(opt => opt.dataset.value === 'all');
      if (allOption) {
        allOption.addEventListener('click', () => {
          const regularOptions = options.filter(opt => opt.dataset.value !== 'all');
          const isAllSelected = allOption.classList.contains('selected');
          if (isAllSelected) {
            regularOptions.forEach(opt => {
              opt.classList.remove('selected');
              selectedSet.delete(opt.dataset.value);
            });
            allOption.classList.remove('selected');
          } else {
            regularOptions.forEach(opt => {
              if (opt.style.display !== 'none') {
                opt.classList.add('selected');
                selectedSet.add(opt.dataset.value);
              }
            });
            allOption.classList.add('selected');
          }
          updateDisplay(selectWrapper, selectedSet, options);
        });
      }
    }

    // Selección individual de opciones
    options.forEach(option => {
      if (option.dataset.value !== 'all') {
        option.addEventListener('click', () => {
          const isSelected = option.classList.contains('selected');
          if (isSelected) {
            option.classList.remove('selected');
            selectedSet.delete(option.dataset.value);
            if (isProjectSelect && allOption) allOption.classList.remove('selected');
          } else {
            option.classList.add('selected');
            selectedSet.add(option.dataset.value);
            if (isProjectSelect && allOption) {
              const regularOptions = options.filter(opt => opt.dataset.value !== 'all');
              const allRegularSelected = regularOptions.every(opt => opt.classList.contains('selected'));
              if (allRegularSelected) {
                allOption.classList.add('selected');
              }
            }
          }
          updateDisplay(selectWrapper, selectedSet, options);
        });
      }
    });

    // Cerrar el dropdown al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!selectWrapper.contains(e.target)) {
        selectWrapper.classList.remove('active');
      }
    });

    // Texto inicial del botón
    if (isProjectSelect) {
      selectBtn.innerHTML = '<span class="select-btn-text">Selecciona uno o más proyectos <span class="placeholder-secondary-asterisk">*</span></span>';
    } else {
      selectBtn.innerHTML = '<span class="select-btn-text">Selecciona uno o más tipos <span class="placeholder-secondary-asterisk">*</span></span>';
    }
    // Prefijo de teléfono
    if (selectWrapper.classList.contains('phone-prefix-wrapper')) {
      selectBtn.innerHTML = '<span class="select-btn-text">+56 9</span>';
    }
  }

  // Actualizar visualización de los tags seleccionados y el texto del botón
  function updateDisplay(selectWrapper, selectedSet, options) {
    const selectedContainer = selectWrapper.querySelector('.selected-projects');
    const selectBtn = selectWrapper.querySelector('.select-btn');
    const formGroup = selectWrapper.closest('.form-group');
    // Limpiar y actualizar los tags
    selectedContainer.innerHTML = '';
    let hasTags = false;
    options.forEach(option => {
      if (option.dataset.value !== 'all' && option.classList.contains('selected')) {
        hasTags = true;
        const tag = document.createElement('div');
        tag.className = 'selected-project';
        let projectName = option.childNodes[0].textContent.trim();
        tag.innerHTML = `${projectName}<span class="remove">×</span>`;
        tag.querySelector('.remove').addEventListener('click', (e) => {
          e.stopPropagation();
          option.classList.remove('selected');
          selectedSet.delete(option.dataset.value);
          if (selectWrapper.id === 'project-select') {
            const allOption = options.find(opt => opt.dataset.value === 'all');
            if (allOption) allOption.classList.remove('selected');
          }
          updateDisplay(selectWrapper, selectedSet, options);
        });
        selectedContainer.appendChild(tag);
      }
    });
    // Ajustar altura del grupo si hay tags
    if (formGroup) {
      if (hasTags) {
        formGroup.style.height = 'auto';
        formGroup.style.minHeight = '42.5px';
      } else {
        formGroup.style.height = '';
        formGroup.style.minHeight = '';
      }
    }
    // Actualizar texto del botón
    const selectedCount = selectedSet.size;
    selectBtn.innerHTML = `<span class="select-btn-text">${selectedCount > 0 ? `${selectedCount} seleccionados` : 'Selecciona uno o más'}</span>`;
    // Mostrar/ocultar grupo de tipo de departamento según selección de proyecto
    if (selectWrapper.id === 'project-select') {
      roomTypeGroup.style.display = selectedCount > 0 ? 'block' : 'none';
    }
  }

  // Inicializar los selectores personalizados
  setupSelect(projectSelect);
  setupSelect(roomTypeSelect);

  // Highlight asterisks in placeholders with secondary color
  stylePlaceholderAsterisks();
});

// Limpiar errores al escribir en inputs o selects
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', function() {
        this.closest('.form-group, .checkbox-group')?.classList.remove('error');
    });
});

// Limpiar errores al cambiar el checkbox
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        this.closest('.checkbox-group')?.classList.remove('error');
    });
});

// Limpiar errores al interactuar con los selectores personalizados
document.querySelectorAll('.select-wrapper').forEach(select => {
    select.addEventListener('click', function() {
        this.closest('.form-group')?.classList.remove('error');
    });
});

// Highlight asterisks in placeholders with secondary color
function stylePlaceholderAsterisks() {
  const inputs = document.querySelectorAll('input[placeholder*="*"]');
  inputs.forEach(input => {
    const placeholder = input.getAttribute('placeholder');
    if (placeholder.includes('*')) {
      // Only works visually if we use a fake placeholder overlay
      const wrapper = document.createElement('div');
      wrapper.className = 'custom-placeholder-wrapper';
      wrapper.style.position = 'relative';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'custom-placeholder-overlay';
      overlay.style.position = 'absolute';
      overlay.style.left = '12px';
      overlay.style.top = '50%';
      overlay.style.transform = 'translateY(-50%)';
      overlay.style.pointerEvents = 'none';
      overlay.style.color = getComputedStyle(input).color;
      overlay.style.opacity = '0.8';
      overlay.style.fontSize = getComputedStyle(input).fontSize;
      overlay.style.fontFamily = getComputedStyle(input).fontFamily;
      overlay.style.width = '100%';
      overlay.style.whiteSpace = 'nowrap';
      overlay.style.overflow = 'hidden';
      overlay.style.textOverflow = 'ellipsis';
      // Replace * with span
      overlay.innerHTML = placeholder.replace(/\*/g, '<span class="placeholder-secondary-asterisk">*</span>');
      wrapper.appendChild(overlay);
      // Hide overlay when input has value or is focused
      function toggleOverlay() {
        overlay.style.display = (input.value || document.activeElement === input) ? 'none' : 'block';
      }
      input.addEventListener('input', toggleOverlay);
      input.addEventListener('focus', toggleOverlay);
      input.addEventListener('blur', toggleOverlay);
      toggleOverlay();
      // Remove native placeholder
      input.setAttribute('placeholder', '');
    }
  });
} 