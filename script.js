const whatsappNumber = "549XXXXXXXXXX";

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

function closeMenu() {
  if (!menuToggle || !navLinks) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
  navLinks.classList.remove("menu-visible");
  document.body.classList.remove("menu-open");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute(
      "aria-label",
      isExpanded ? "Abrir menú" : "Cerrar menú"
    );

    navLinks.classList.toggle("menu-visible", !isExpanded);
    document.body.classList.toggle("menu-open", !isExpanded);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const fields = {
    name: {
      input: document.querySelector("#name"),
      error: document.querySelector("#name-error"),
      message: "Ingresá tu nombre completo."
    },
    phone: {
      input: document.querySelector("#phone"),
      error: document.querySelector("#phone-error"),
      message: "Ingresá un teléfono válido."
    },
    vehicle: {
      input: document.querySelector("#vehicle"),
      error: document.querySelector("#vehicle-error"),
      message: "Indicá qué vehículo tenés."
    },
    service: {
      input: document.querySelector("#service"),
      error: document.querySelector("#service-error"),
      message: "Seleccioná un servicio."
    },
    message: {
      input: document.querySelector("#message"),
      error: document.querySelector("#message-error"),
      message: "Contanos un poco más sobre tu consulta."
    }
  };

  const consent = document.querySelector("#consent");
  const consentError = document.querySelector("#consent-error");
  const feedback = document.querySelector("#form-feedback");
  const messageCount = document.querySelector("#message-count");
  const messageInput = fields.message.input;

  const normalizeText = (value) => value.trim().replace(/\s+/g, " ");

  const validators = {
    name(value) {
      return normalizeText(value).length >= 2;
    },
    phone(value) {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 8 && digits.length <= 15;
    },
    vehicle(value) {
      return normalizeText(value).length >= 2;
    },
    service(value) {
      return value !== "";
    },
    message(value) {
      return normalizeText(value).length >= 10;
    }
  };

  function showError(field, message) {
    field.input.classList.toggle("invalid", Boolean(message));
    field.input.setAttribute("aria-invalid", String(Boolean(message)));
    field.error.textContent = message;
  }

  function validateField(key) {
    const field = fields[key];
    const value = field.input.value;
    const valid = validators[key](value);

    showError(field, valid ? "" : field.message);
    return valid;
  }

  Object.entries(fields).forEach(([key, field]) => {
    field.input.addEventListener("blur", () => validateField(key));

    field.input.addEventListener("input", () => {
      if (field.input.classList.contains("invalid")) {
        validateField(key);
      }

      feedback.textContent = "";
    });

    field.input.addEventListener("change", () => {
      if (field.input.classList.contains("invalid")) {
        validateField(key);
      }
    });
  });

  messageInput.addEventListener("input", () => {
    messageCount.textContent = String(messageInput.value.length);
  });

  consent.addEventListener("change", () => {
    consentError.textContent = consent.checked
      ? ""
      : "Necesitás confirmar esta opción para continuar.";
  });

  const query = new URLSearchParams(window.location.search);
  const requestedService = query.get("servicio");
  const serviceSelect = fields.service.input;

  if (requestedService) {
    const matchingOption = Array.from(serviceSelect.options).find(
      (option) =>
        option.value.toLocaleLowerCase("es") ===
        requestedService.trim().toLocaleLowerCase("es")
    );

    if (matchingOption) {
      serviceSelect.value = matchingOption.value;
    }
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const validity = Object.keys(fields).map((key) => validateField(key));
    const allFieldsValid = validity.every(Boolean);

    consentError.textContent = consent.checked
      ? ""
      : "Confirmá que los datos son correctos para continuar.";

    if (!allFieldsValid || !consent.checked) {
      feedback.textContent = "Revisá los campos marcados antes de continuar.";

      const firstInvalid = contactForm.querySelector(
        '[aria-invalid="true"]'
      );

      if (firstInvalid) firstInvalid.focus();
      else consent.focus();

      return;
    }

    if (!/^\d{10,15}$/.test(whatsappNumber)) {
      feedback.textContent =
        "Falta configurar el número de WhatsApp del taller en script.js.";
      return;
    }

    const name = normalizeText(fields.name.input.value);
    const phone = normalizeText(fields.phone.input.value);
    const vehicle = normalizeText(fields.vehicle.input.value);
    const service = fields.service.input.value;
    const message = normalizeText(fields.message.input.value);

    const whatsappMessage = [
      "Hola, TORQUE. Quiero realizar una consulta.",
      "",
      `Nombre: ${name}`,
      `Teléfono: ${phone}`,
      `Vehículo: ${vehicle}`,
      `Servicio: ${service}`,
      "",
      "Consulta:",
      message
    ].join("\n");

    const whatsappUrl = new URL(`https://wa.me/${whatsappNumber}`);
    whatsappUrl.searchParams.set("text", whatsappMessage);

    const whatsappWindow = window.open(
      whatsappUrl.toString(),
      "_blank",
      "noopener,noreferrer"
    );

    if (whatsappWindow) {
      feedback.textContent =
        "Se abrió WhatsApp. Revisá el mensaje y envialo para completar la consulta.";
    } else {
      feedback.textContent =
        "El navegador bloqueó la nueva ventana. Permití las ventanas emergentes e intentá nuevamente.";
    }
  });
}