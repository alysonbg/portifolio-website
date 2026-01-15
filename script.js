// Substitua as strings abaixo pelas suas credenciais do EmailJS
// - userID: "user_xxxxx" (ou public key)
// - serviceID: "service_xxx"
// - templateID: "template_xxx"
const EMAILJS_USER_ID = "SEU_USER_ID_AQUI";
const EMAILJS_SERVICE_ID = "SEU_SERVICE_ID_AQUI";
const EMAILJS_TEMPLATE_ID = "SEU_TEMPLATE_ID_AQUI";

// Limites simples para evitar payloads excessivos/spam no front.
const FIELD_LIMITS = {
  from_name: 80,
  subject: 120,
  reply_to: 120,
  message: 2000,
};

document.addEventListener("DOMContentLoaded", () => {
  // inicializa o EmailJS
  if (typeof emailjs !== "undefined") {
    try {
      emailjs.init(EMAILJS_USER_ID);
    } catch (err) {
      console.warn("Erro ao inicializar EmailJS:", err);
    }
  } else {
    console.warn("EmailJS não carregado. Verifique o CDN.");
  }

  // ano no footer
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Form handling
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  const submitBtn = document.getElementById("submit-btn");

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.textContent = "";
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    const emailInput = document.getElementById("email");
    if (emailInput && !validateEmail(emailInput.value)) {
      status.textContent = "Por favor insira um email válido.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar mensagem";
      return;
    }

    // Normaliza e valida tamanho dos campos.
    clampField("name", "from_name");
    clampField("subject", "subject");
    clampField("email", "reply_to");
    clampField("message", "message");

    if (typeof emailjs !== "undefined" && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
      emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
        .then(function () {
          status.textContent = "Mensagem enviada! Obrigado — eu responderei em breve.";
          form.reset();
        }, function (error) {
          console.error("Erro EmailJS:", error);
          status.textContent = "Ocorreu um erro ao enviar. Tente novamente mais tarde.";
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar mensagem";
        });
    } else {
      console.warn("EmailJS não configurado (service/template/user faltando).");
      status.textContent = "Formulário pronto, mas EmailJS não está configurado. Veja o README para configurar.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar mensagem";
    }
  });

  // smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId.length > 1) {
        e.preventDefault();
        const targetEl = document.querySelector(targetId);
        if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});

function validateEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function clampField(domId, templateKey) {
  const el = document.getElementById(domId);
  if (!el) return;
  const limit = FIELD_LIMITS[templateKey] || 256;
  const trimmed = (el.value || "").trim();
  el.value = trimmed.slice(0, limit);
}